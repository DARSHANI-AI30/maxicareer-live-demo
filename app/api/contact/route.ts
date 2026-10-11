import { NextResponse } from 'next/server';
import { dbManager } from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const isRegistration = Boolean(data.planName || data.type === 'registration');
    const name = data.name || data.fullName || 'Prospective Student';
    
    console.log('Maxicareer Inquiry Received:', {
      type: isRegistration ? 'Registration' : 'Consultation / Service Request',
      name: name,
      email: data.email,
      phone: data.phone,
      service: data.serviceInterest || data.planName || data.serviceTitle,
      subject: data.subject,
      timestamp: new Date().toISOString(),
    });

    // Auto-record to synthetic / real MongoDB database
    if (data.email) {
      try {
        await dbManager.createStudent({
          name: name,
          email: String(data.email).trim().toLowerCase(),
          phone: data.phone || '',
          city: data.city || 'India',
          profession: data.profession || 'college',
          institutionOrCompany: data.institutionOrCompany || '',
          detail: data.message || data.subject || data.serviceInterest || 'Consultation Inquiry',
          planName: data.planName || data.serviceInterest || 'General Career Consultation',
          planPrice: typeof data.price === 'number' ? data.price : 3000,
          status: 'pending',
          mentorAssigned: 'Unassigned',
          notes: data.message ? `Message: ${data.message}` : 'Consultation inquiry submitted via contact form.',
          source: isRegistration ? 'portal_registration' : 'quick_consultation',
        });
      } catch (dbErr) {
        console.warn('MongoDB log warning in contact route:', dbErr);
      }
    }

    const successMessage = isRegistration
      ? `Thank you, ${name}! Your enrollment request for ${data.planName || 'Maxicareer Program'} has been registered. Our career mentorship team will reach out to you within 24 hours.`
      : `Thank you, ${name}! Your consultation request has been submitted. A Maxicareer mentor will contact you within 24 hours.`;

    return NextResponse.json({
      success: true,
      message: successMessage,
      data: {
        name: name,
        email: data.email,
        phone: data.phone,
        service: data.serviceInterest || data.planName,
        receivedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Invalid request payload format',
      },
      { status: 400 }
    );
  }
}
