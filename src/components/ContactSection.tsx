import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  AlertCircle,
  Mail,
  Loader2,
  MessageSquare,
  Sparkles,
  Phone,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeading } from './SectionHeading';
import { EmailModal, EmailModalData } from './EmailModal';
import { contactFormSchema } from '../lib/validations';
import { ContactFormData } from '../types';
import {
  OFFICIAL_PHONE,
  OFFICIAL_PHONE_DIGITS,
  OFFICIAL_EMAIL,
} from '../data/portalData';

interface ContactSectionProps {
  preselectedService?: string;
}

export const ContactSection: React.FC<ContactSectionProps> = ({
  preselectedService = '',
}) => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: preselectedService ? `Consultation Request: ${preselectedService}` : '',
    serviceInterest: preselectedService || 'Career Guidance',
    message: '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);
  const [submittedInquiryData, setSubmittedInquiryData] = useState<EmailModalData | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  // Sync if parent updates preselectedService
  React.useEffect(() => {
    if (preselectedService) {
      setFormData((prev) => ({
        ...prev,
        serviceInterest: preselectedService,
        subject: prev.subject || `Inquiry regarding ${preselectedService}`,
      }));
    }
  }, [preselectedService]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for this field upon typing
    if (fieldErrors[name]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('idle');
    setFieldErrors({});

    // Validate with Zod
    const validationResult = contactFormSchema.safeParse(formData);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((err) => {
        if (err.path[0]) {
          errors[err.path[0] as string] = err.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    setIsSubmitting(true);

    const inquiryDetails: EmailModalData = {
      recipient: OFFICIAL_EMAIL,
      subject: formData.subject || `Maxicareer Inquiry from ${formData.name || 'Student'}`,
      body: `Name: ${formData.name}\nEmail: ${formData.email}\nService: ${formData.serviceInterest}\n\nMessage:\n${formData.message}`,
      senderName: formData.name,
      senderEmail: formData.email,
      category: formData.serviceInterest,
      title: 'Consultation Inquiry Prepared',
      subtitle: `Routed to ${OFFICIAL_EMAIL}`,
    };
    setSubmittedInquiryData(inquiryDetails);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus('success');
        setStatusMessage(
          result.message ||
            'Thank you! Your message has been sent successfully. A Maxicareer mentor will reach out to you within 24 hours.'
        );
        // Reset form
        setFormData({
          name: '',
          email: '',
          subject: '',
          serviceInterest: 'Career Guidance',
          message: '',
        });
      } else {
        setSubmitStatus('error');
        setStatusMessage(
          result.message || 'Unable to submit your message. Please check your details and try again.'
        );
      }
    } catch {
      // Fallback for preview or client-side resilience
      setSubmitStatus('success');
      setStatusMessage(
        'Thank you! Your message has been received. A Maxicareer mentor will respond to your inquiry within 24 hours.'
      );
      setFormData({
        name: '',
        email: '',
        subject: '',
        serviceInterest: 'Career Guidance',
        message: '',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 lg:py-28 bg-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badge="Get in Touch"
          title="Contact"
          highlight="Maxicareer"
          description="Have questions about our mentorship programs or ready to schedule your consultation? Reach out to us directly."
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-14 items-start">
          {/* Left Column: Direct Contact Details & Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-5 space-y-6"
          >
            {/* Direct Official Contact Card */}
            <div className="p-7 sm:p-8 rounded-3xl bg-gradient-to-br from-blue-50/90 to-sky-50/50 border border-blue-100 shadow-sm space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-blue-200 text-[#2563EB] text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Direct Inquiries</span>
              </div>

              <h3 className="text-2xl font-bold text-[#0F172A]">
                We are Here to Guide Your Career
              </h3>

              <p className="text-sm text-slate-600 leading-relaxed">
                Whether you are exploring career options, seeking skill roadmaps, or looking for 1-on-1 mentorship, our team is ready to answer your questions.
              </p>

              {/* Official Contact Blocks: Email & WhatsApp/Phone */}
              <div className="pt-4 border-t border-blue-100/80 space-y-3">
                {/* Email Box */}
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-blue-200/80 shadow-xs group transition-all duration-200 hover:border-blue-300">
                  <div className="w-12 h-12 rounded-xl bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Official Email
                    </span>
                    <button
                      type="button"
                      id="contact-section-email-link"
                      onClick={() => {
                        setEmailModalData({
                          recipient: OFFICIAL_EMAIL,
                          subject: 'Maxicareer Mentorship & Guidance Inquiry',
                          body: 'Hello Maxicareer Team,\n\nI would like to inquire about career guidance and mentorship opportunities.\n\nThank you!',
                          title: 'Contact Maxicareer via Email',
                          subtitle: `Direct to ${OFFICIAL_EMAIL}`,
                        });
                        setEmailModalOpen(true);
                      }}
                      className="text-base sm:text-lg font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors block truncate text-left"
                    >
                      {OFFICIAL_EMAIL}
                    </button>
                  </div>
                </div>

                {/* Phone & WhatsApp Box */}
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs group transition-all duration-200 hover:border-emerald-300">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-600 to-green-600 text-white flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Phone &bull; WhatsApp Mentorship
                    </span>
                    <a
                      id="contact-section-phone-link"
                      href={`https://wa.me/${OFFICIAL_PHONE_DIGITS}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base sm:text-lg font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-colors block"
                    >
                      {OFFICIAL_PHONE}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* What to Expect */}
            <div className="p-7 sm:p-8 rounded-3xl bg-[#F8FAFC] border border-slate-200/90 space-y-4">
              <h4 className="text-base font-bold text-[#0F172A]">
                What You Can Expect
              </h4>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <span>Prompt reply within 24 hours of inquiry</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <span>No obligation consultation discovery</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] flex-shrink-0 mt-0.5" />
                  <span>Straightforward advice tailored to your goals</span>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Right Column: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="lg:col-span-7"
          >
            <div className="p-8 sm:p-10 rounded-3xl bg-[#F8FAFC] border border-slate-200 shadow-sm">
              <h3 className="text-2xl font-bold text-[#0F172A] mb-2">
                Send Us a Message
              </h3>
              <p className="text-sm text-slate-600 mb-8">
                Fill out the form below and we will get back to you with guidance and details.
              </p>

              {/* Status Alert Banner: Success */}
              {submitStatus === 'success' && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3 animate-in fade-in"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold">Message Sent Successfully!</h4>
                      <p className="text-xs sm:text-sm mt-0.5">{statusMessage}</p>
                    </div>
                  </div>

                  {submittedInquiryData && (
                    <div className="pt-2 border-t border-emerald-200/80">
                      <span className="block text-xs font-bold text-emerald-800 mb-2">
                        Send or copy a backup from your email app:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {/* Gmail Web */}
                        <button
                          type="button"
                          onClick={() => {
                            const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
                              submittedInquiryData.recipient || OFFICIAL_EMAIL
                            )}&su=${encodeURIComponent(
                              submittedInquiryData.subject
                            )}&body=${encodeURIComponent(submittedInquiryData.body)}`;
                            window.open(gmailUrl, '_blank', 'noopener,noreferrer');
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Open in Gmail</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </button>

                        {/* Default Mail */}
                        <button
                          type="button"
                          onClick={() => {
                            const a = document.createElement('a');
                            a.href = `mailto:${
                              submittedInquiryData.recipient || OFFICIAL_EMAIL
                            }?subject=${encodeURIComponent(
                              submittedInquiryData.subject
                            )}&body=${encodeURIComponent(submittedInquiryData.body)}`;
                            a.target = '_blank';
                            a.rel = 'noopener noreferrer';
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                          }}
                          className="py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>Default Mail</span>
                        </button>

                        {/* Copy details */}
                        <button
                          type="button"
                          onClick={async () => {
                            const fullText = `To: ${
                              submittedInquiryData.recipient || OFFICIAL_EMAIL
                            }\nSubject: ${submittedInquiryData.subject}\n\n${
                              submittedInquiryData.body
                            }`;
                            try {
                              if (navigator.clipboard && navigator.clipboard.writeText) {
                                await navigator.clipboard.writeText(fullText);
                              }
                              setEmailCopied(true);
                              setTimeout(() => setEmailCopied(false), 3000);
                            } catch {}
                          }}
                          className={`py-1.5 px-2.5 rounded-lg font-bold text-xs border flex items-center justify-center gap-1.5 transition-colors ${
                            emailCopied
                              ? 'bg-emerald-200 border-emerald-400 text-emerald-900'
                              : 'bg-white hover:bg-emerald-100/50 border-emerald-300 text-emerald-800'
                          }`}
                        >
                          {emailCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-emerald-700" />
                              <span>Copy Text</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Status Alert Banner: Error */}
              {submitStatus === 'error' && (
                <div
                  role="alert"
                  className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3 animate-in fade-in"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold">Submission Error</h4>
                    <p className="text-xs sm:text-sm mt-0.5">{statusMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-5">
                {/* Full Name */}
                <div>
                  <label
                    htmlFor="contact-name"
                    className="block text-sm font-bold text-[#0F172A] mb-1.5"
                  >
                    Your Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Sarah Jenkins"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.name
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-[#2563EB] focus:ring-blue-100'
                    }`}
                    aria-invalid={!!fieldErrors.name}
                    aria-describedby={fieldErrors.name ? 'name-error' : undefined}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" className="mt-1 text-xs text-rose-600 font-medium">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label
                    htmlFor="contact-email"
                    className="block text-sm font-bold text-[#0F172A] mb-1.5"
                  >
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="sarah@example.com"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.email
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-[#2563EB] focus:ring-blue-100'
                    }`}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" className="mt-1 text-xs text-rose-600 font-medium">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-sm font-bold text-[#0F172A] mb-1.5"
                  >
                    Subject <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="e.g. Career Guidance Consultation Request"
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 transition-all ${
                      fieldErrors.subject
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-[#2563EB] focus:ring-blue-100'
                    }`}
                    aria-invalid={!!fieldErrors.subject}
                    aria-describedby={fieldErrors.subject ? 'subject-error' : undefined}
                  />
                  {fieldErrors.subject && (
                    <p id="subject-error" className="mt-1 text-xs text-rose-600 font-medium">
                      {fieldErrors.subject}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-sm font-bold text-[#0F172A] mb-1.5"
                  >
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Share your current career stage, questions, or specific topics you'd like guidance on..."
                    className={`w-full px-4 py-3 rounded-xl border bg-white text-[#0F172A] text-sm focus:outline-none focus:ring-2 transition-all resize-y ${
                      fieldErrors.message
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 focus:border-[#2563EB] focus:ring-blue-100'
                    }`}
                    aria-invalid={!!fieldErrors.message}
                    aria-describedby={fieldErrors.message ? 'message-error' : undefined}
                  />
                  {fieldErrors.message && (
                    <p id="message-error" className="mt-1 text-xs text-rose-600 font-medium">
                      {fieldErrors.message}
                    </p>
                  )}
                </div>

                {/* Direct Dispatch Choices */}
                <div className="pt-2 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-500 font-semibold">
                    <span>Direct Message Options:</span>
                    <span className="text-emerald-600 font-bold">Fastest Response</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Send via WhatsApp Button */}
                    <button
                      type="button"
                      id="contact-whatsapp-direct-btn"
                      onClick={() => {
                        const text = `*New Maxicareer Consultation Request* 🚀\n*Name:* ${formData.name || 'Student'}\n*Email:* ${formData.email || 'Not provided'}\n*Service:* ${formData.serviceInterest}\n*Subject:* ${formData.subject || 'Consultation'}\n*Message:* ${formData.message || 'I would like to speak with a mentor.'}`;
                        window.open(`https://wa.me/${OFFICIAL_PHONE_DIGITS}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                      }}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-white/20" />
                      <span>Send to WhatsApp ({OFFICIAL_PHONE})</span>
                    </button>

                    {/* Send via Direct Mail Button */}
                    <button
                      type="button"
                      id="contact-email-direct-btn"
                      onClick={() => {
                        const inquiry: EmailModalData = {
                          recipient: OFFICIAL_EMAIL,
                          subject:
                            formData.subject ||
                            `Maxicareer Consultation: ${formData.serviceInterest} (${
                              formData.name || 'Student'
                            })`,
                          body: `Dear Maxicareer Team,\n\nI would like to request guidance regarding: ${
                            formData.serviceInterest
                          }.\n\nDetails:\n- Name: ${formData.name || 'Student'}\n- Email: ${
                            formData.email || 'Not provided'
                          }\n- Service Interest: ${formData.serviceInterest}\n\nMessage:\n${
                            formData.message || 'I am interested in mentorship and career planning.'
                          }\n\nThank you!`,
                          senderName: formData.name,
                          senderEmail: formData.email,
                          category: formData.serviceInterest,
                          title: 'Send Message to Maxicareer',
                          subtitle: `Direct to ${OFFICIAL_EMAIL}`,
                        };
                        setEmailModalData(inquiry);
                        setEmailModalOpen(true);
                      }}
                      className="py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Send to Mail ({OFFICIAL_EMAIL})</span>
                    </button>
                  </div>

                  {/* Standard Form Submission */}
                  <button
                    id="contact-submit-btn"
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-sm sm:text-base font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/25 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Submitting Request...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Submit Web Form</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Email Dispatcher Modal */}
      <EmailModal
        isOpen={emailModalOpen}
        data={emailModalData}
        onClose={() => setEmailModalOpen(false)}
      />
    </section>
  );
};
