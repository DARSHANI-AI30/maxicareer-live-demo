import { NextRequest, NextResponse } from 'next/server';
import { dbManager, StudentDocument } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const profession = searchParams.get('profession') || undefined;
    const status = searchParams.get('status') || undefined;
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const students = await dbManager.getStudents({
      search,
      profession,
      status,
      sortBy,
      sortOrder,
    });

    const stats = await dbManager.getStats();

    return NextResponse.json({
      success: true,
      count: students.length,
      data: students,
      stats,
    });
  } catch (err: any) {
    console.error('Error fetching students:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to retrieve student records',
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Student name and email are required fields',
        },
        { status: 400 }
      );
    }

    const newStudent = await dbManager.createStudent({
      name: String(body.name).trim(),
      email: String(body.email).trim().toLowerCase(),
      phone: body.phone ? String(body.phone).trim() : '',
      city: body.city ? String(body.city).trim() : 'India',
      profession: body.profession || 'college',
      professionLabel: body.professionLabel || undefined,
      institutionOrCompany: body.institutionOrCompany || body.schoolName || body.collegeName || body.company || '',
      detail: body.detail || body.targetRole || body.careerGoal || body.targetDomain || '',
      planName: body.planName || 'Career Guidance Consultation',
      planPrice: typeof body.planPrice === 'number' ? body.planPrice : 4999,
      selectedAddOns: Array.isArray(body.selectedAddOns) ? body.selectedAddOns : [],
      status: body.status || 'pending',
      mentorAssigned: body.mentorAssigned || 'Unassigned',
      notes: body.notes || body.additionalNotes || 'Self-registered via Maxicareer portal.',
      academicDetails: body.academicDetails || {
        classGrade: body.classGrade,
        streamInterest: body.streamInterest,
        schoolName: body.schoolName,
        degree: body.degree,
        yearOfStudy: body.yearOfStudy,
        collegeName: body.collegeName,
        targetDomain: body.targetDomain,
        graduationYear: body.graduationYear,
        highestQualification: body.highestQualification,
        targetRole: body.targetRole,
        company: body.company,
        designation: body.designation,
        experienceYears: body.experienceYears,
        careerGoal: body.careerGoal,
      },
      source: body.source || 'portal_registration',
    });

    const stats = await dbManager.getStats();

    return NextResponse.json(
      {
        success: true,
        message: 'Student registration recorded successfully in MongoDB database',
        data: newStudent,
        stats,
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error('Error creating student registration:', err);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to record student registration in database',
        error: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
