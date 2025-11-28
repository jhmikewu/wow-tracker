import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';
// Import the helper to validate
import { getCharacterData } from '../../utils/raiderio';

const prisma = new PrismaClient();

export async function GET() {
  const characters = await prisma.character.findMany({
    include: { wishlist: true },
  });
  return NextResponse.json(characters);
}

export async function POST(request) {
  const body = await request.json();
  const { name, realm, region } = body;

  // 1. Validate with Raider.IO before saving!
  const rioData = await getCharacterData(region, realm, name);
  
  if (!rioData) {
    return NextResponse.json(
      { error: `Character not found on Raider.IO. Check Realm/Name spelling.` }, 
      { status: 404 }
    );
  }

  try {
    // 2. If valid, save to Database
    const newChar = await prisma.character.create({
      data: { 
        name: name.toLowerCase(), 
        realm: realm.toLowerCase(), 
        region: region.toLowerCase() 
      },
    });
    return NextResponse.json(newChar);
  } catch (error) {
    // Prisma code P2002 means Unique constraint failed
    if (error.code === 'P2002') {
        return NextResponse.json({ error: 'You are already tracking this character.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(request) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await prisma.character.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true });
}