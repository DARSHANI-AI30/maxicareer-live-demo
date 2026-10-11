import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await dbManager.getStudentById(id);

    if (!student) {
      return NextResponse.json(
        { success: false, message: `Student with ID ${id} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: student,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error retrieving student' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await req.json();

    const updated = await dbManager.updateStudent(id, updates);

    if (!updated) {
      return NextResponse.json(
        { success: false, message: `Student with ID ${id} not found` },
        { status: 404 }
      );
    }

    const stats = await dbManager.getStats();

    return NextResponse.json({
      success: true,
      message: 'Student record updated in MongoDB database',
      data: updated,
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error updating student' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const deleted = await dbManager.deleteStudent(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, message: `Student with ID ${id} not found` },
        { status: 404 }
      );
    }

    const stats = await dbManager.getStats();

    return NextResponse.json({
      success: true,
      message: 'Student record deleted from database',
      stats,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: err?.message || 'Error deleting student' },
      { status: 500 }
    );
  }
}
