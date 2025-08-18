import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const companies = await db.company.findMany({
      select: {
        companyId: true,
        companyName: true,
      },
      orderBy: {
        companyName: 'asc',
      },
    });
    return NextResponse.json(companies);
  } catch (error) {
    console.error('Error obteniendo compañías:', error);
    return NextResponse.json({ message: 'Se ha producido un fallo al obtener las compañías' }, { status: 500 });
  }
}