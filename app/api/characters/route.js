import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";

const prisma = new PrismaClient();

// Helper to verify character exists on Raider.IO before adding
async function verifyRaiderIO(region, realm, name) {
    const safeName = encodeURIComponent(name);
    const safeRealm = encodeURIComponent(realm);
    const url = `https://raider.io/api/v1/characters/profile?region=${region}&realm=${safeRealm}&name=${safeName}&fields=system`;
    
    const res = await fetch(url);
    if (!res.ok) return null;
    return await res.json();
}

export async function GET(req) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const characters = await prisma.character.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'asc' }
  });
  return NextResponse.json(characters);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  let { name, realm, region } = body;

  // --- NEW: Auto-fix "Loveli" to "Lovelì" ---
  // If the name starts with "loveli" (case-insensitive), replace it with "Lovelì"
  if (name && /^loveli/i.test(name)) {
      name = name.replace(/^loveli/i, 'Lovelì');
      console.log("Auto-corrected name spelling to:", name);
  }
  // ------------------------------------------

  if (!name || !realm || !region) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    // 1. VERIFY & NORMALIZE with Raider.IO
    // This checks if the character exists and gets the "Official" casing (e.g. "lovelìwar" -> "Lovelìwar")
    const officialData = await verifyRaiderIO(region, realm, name);

    if (!officialData) {
        return NextResponse.json({ 
            error: `Character not found on Raider.IO. Check spelling (accents matter!) and realm.` 
        }, { status: 404 });
    }

    // 2. Use the OFFICIAL name from Raider.IO (fixes casing issues)
    name = officialData.name;
    realm = officialData.realm; // Also fixes realm capitalization

    // 3. Check if already added
    const exists = await prisma.character.findFirst({
        where: {
            userId: session.user.id,
            name: name,
            realm: realm,
            region: region
        }
    });

    if (exists) {
        return NextResponse.json({ error: "Character already tracked" }, { status: 400 });
    }

    // 4. Save to DB
    const character = await prisma.character.create({
      data: {
        name,
        realm,
        region,
        userId: session.user.id
      },
    });
    return NextResponse.json(character);

  } catch (error) {
    console.error("Add Character Error:", error);
    return NextResponse.json({ error: 'Error creating character' }, { status: 500 });
  }
}

export async function DELETE(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  const character = await prisma.character.findUnique({
      where: { id }
  });

  if (!character || character.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.character.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}