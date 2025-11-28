import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request) {
  const body = await request.json();
  const { characterId, description } = body;

  const item = await prisma.wishlistItem.create({
    data: { characterId, description },
  });
  return NextResponse.json(item);
}