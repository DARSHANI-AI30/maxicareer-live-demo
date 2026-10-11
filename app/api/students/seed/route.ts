import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const students = dbManager.resetSyntheticSeed();
    const stats = await dbManager.getStats();

    return NextResponse.json({
      success: true,
      message: `Synthetic MongoDB database re-seeded successfully with ${students.length} authentic student records.`,
      count: students.length,
      data: students,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error re-seeding database' },
      { status: 500 }
    );
  }
}
