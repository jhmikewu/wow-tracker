import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../lib/auth";

const prisma = new PrismaClient();

export async function GET(req) {
  const session = await getServerSession(authOptions);
  
  if (!session || !session.user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const characters = await prisma.character.findMany({
    where: { userId: session.user.id }
  });
  return NextResponse.json(characters);
}

export async function POST(req) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, realm, region } = body;

  if (!name || !realm || !region) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
    const character = await prisma.character.create({
      data: {
        name,
        realm,
        region,
        userId: session.user.id // Link to logged-in user
      },
    });
    return NextResponse.json(character);
  } catch (error) {
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

  // Verify ownership
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