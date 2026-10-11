import { NextRequest, NextResponse } from 'next/server';
import { dbManager } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const format = searchParams.get('format') || 'csv';
    const students = await dbManager.getStudents({});

    if (format === 'json') {
      return new NextResponse(JSON.stringify(students, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="synthetic_students_${Date.now()}.json"`,
        },
      });
    }

    // Default: CSV export
    const headers = [
      'Registration_ID',
      'Name',
      'Email',
      'Phone',
      'City',
      'Cohort',
      'Institution_or_Company',
      'Background_Detail',
      'Plan_Name',
      'Fee_INR',
      'Status',
      'Assigned_Mentor',
      'Registration_Date',
      'Source',
    ];

    const escapeCsv = (str: string | number | undefined | null) => {
      if (str === undefined || str === null) return '""';
      const val = String(str).replace(/"/g, '""');
      return `"${val}"`;
    };

    const rows = students.map((s) => [
      escapeCsv(s._id),
      escapeCsv(s.name),
      escapeCsv(s.email),
      escapeCsv(s.phone),
      escapeCsv(s.city || ''),
      escapeCsv(s.professionLabel),
      escapeCsv(s.institutionOrCompany || ''),
      escapeCsv(s.detail || ''),
      escapeCsv(s.planName),
      s.planPrice || 0,
      escapeCsv(s.status),
      escapeCsv(s.mentorAssigned),
      escapeCsv(s.registeredDate),
      escapeCsv(s.source),
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="maxicareer_students_${Date.now()}.csv"`,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: 'Export failed', error: String(err) },
      { status: 500 }
    );
  }
}
