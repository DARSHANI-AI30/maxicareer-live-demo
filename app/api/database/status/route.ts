import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await dbManager.getStats();
    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error fetching database stats' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { mongoUri } = await req.json();

    if (!mongoUri) {
      return NextResponse.json(
        { success: false, message: 'MongoDB connection string (URI) is required' },
        { status: 400 }
      );
    }

    const result = await dbManager.testUriConnection(mongoUri);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error testing MongoDB connection' },
      { status: 500 }
    );
  }
}
