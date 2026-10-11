import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  Video,
  Download,
  MessageCircle,
  Mail,
  ArrowRight,
  LogOut,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  FileText,
  User,
  Sparkles,
  Phone,
} from 'lucide-react';
import { StudentProfile } from '../types';
import {
  ROADMAP_DATA,
  RESOURCE_ITEMS,
  OFFICIAL_PHONE,
  OFFICIAL_PHONE_DIGITS,
  OFFICIAL_EMAIL,
} from '../data/portalData';
import { BrandLogo } from './BrandLogo';
import { CornerProfileMenu } from './CornerProfileMenu';
import { EmailModal, EmailModalData } from './EmailModal';

interface StudentDashboardProps {
  profile: StudentProfile;
  onLogout: () => void;
  onReturnToSite: () => void;
  onSwitchProfile?: (profile: StudentProfile) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  onLogout,
  onReturnToSite,
  onSwitchProfile,
}) => {
  const [activeTab, setActiveTab] = useState<'roadmap' | 'sessions' | 'resources' | 'plan'>('roadmap');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookedSlot, setBookedSlot] = useState<string | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

  const roadmapSteps = ROADMAP_DATA[profile.profession] || ROADMAP_DATA.college;
  const resources = RESOURCE_ITEMS[profile.profession] || RESOURCE_ITEMS.college;

  const handleDownload = (title: string) => {
    setDownloadSuccess(title);
    setTimeout(() => {
      setDownloadSuccess(null);
    }, 2800);
  };

  const handleBookSlot = (slotTime: string) => {
    setBookedSlot(slotTime);
    setBookingModalOpen(false);
  };

  const directWhatsAppUrl = `https://wa.me/${OFFICIAL_PHONE_DIGITS}?text=${encodeURIComponent(
    `Hello Maxicareer Mentor! I am ${profile.name} (Student ID: ${profile.id}) enrolled in ${profile.planName}. I have a mentorship query.`
  )}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Portal Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            {/* Left: Brand Logo & Portal Badge */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onReturnToSite}
                className="flex items-center group transition-transform hover:scale-105"
                title="Return to Maxicareer Homepage"
              >
                <BrandLogo variant="icon" size="lg" />
              </button>

              <div className="h-6 w-px bg-slate-200 hidden sm:block" />

              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg text-slate-900">
                    Maxicareer
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700">
                    Student Portal
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">
                  Mentorship Hub &bull; {profile.professionLabel}
                </span>
              </div>
            </div>

            {/* Right: Hotline, Public Site Link, and Corner Profile & Log Options */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* WhatsApp Quick Help */}
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors"
                title={`Chat with Mentor on WhatsApp: ${OFFICIAL_PHONE}`}
              >
                <MessageCircle className="w-3.5 h-3.5 fill-emerald-600" />
                <span>Mentor Help</span>
              </a>

              {/* Return to Public Site Link */}
              <button
                type="button"
                onClick={onReturnToSite}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <span>Public Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Corner Profile Menu ("Like a profile page" with log options & persona switcher) */}
              <CornerProfileMenu
                userProfile={profile}
                onOpenSignIn={() => {}}
                onOpenDashboard={() => {}}
                onLogout={onLogout}
                onSwitchProfile={onSwitchProfile || (() => {})}
                onBookConsultation={() => setBookingModalOpen(true)}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Workspace */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Welcome & Progress Overview Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle glow background */}
          <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>Active Enrollment: {profile.planName}</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Welcome to your Mentorship Hub, {profile.name}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed">
                Track your structured milestones, join scheduled 1-on-1 strategy sessions, and access
                proprietary guidance toolkits. For immediate assistance, reach our counselor line at{' '}
                <a
                  href={`tel:${OFFICIAL_PHONE_DIGITS}`}
                  className="text-emerald-400 font-bold hover:underline"
                >
                  {OFFICIAL_PHONE}
                </a>{' '}
                or{' '}
                <button
                  type="button"
                  onClick={() => {
                    setEmailModalData({
                      recipient: OFFICIAL_EMAIL,
                      subject: `Maxicareer Student Query - ${profile.name} (${profile.id})`,
                      body: `Hello Maxicareer Mentors,\n\nStudent: ${profile.name} (${profile.id})\nPlan: ${profile.planName}\n\nI have a question regarding:\n\nThank you!`,
                      title: 'Email Counselor Support',
                      subtitle: `Direct to ${OFFICIAL_EMAIL}`,
                    });
                    setEmailModalOpen(true);
                  }}
                  className="text-sky-300 font-bold hover:underline"
                >
                  {OFFICIAL_EMAIL}
                </button>
                .
              </p>
            </div>

            {/* Quick Metrics Card */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 flex items-center gap-6 self-start lg:self-auto">
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Roadmap Progress
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {profile.roadmapProgress}%
                </span>
                <div className="w-32 bg-white/20 h-2 rounded-full overflow-hidden mt-1.5">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${profile.roadmapProgress}%` }}
                  />
                </div>
              </div>

              <div className="border-l border-white/20 pl-4">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  Mentor Status
                </span>
                <div className="flex items-center gap-1.5 mt-1 text-emerald-400 font-bold text-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Online / Assigned</span>
                </div>
                <span className="text-[11px] text-slate-400">1-on-1 Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          <button
            type="button"
            onClick={() => setActiveTab('roadmap')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'roadmap'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Career Roadmap &amp; Milestones</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sessions')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'sessions'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>1-on-1 Mentorship Sessions</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resources')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'resources'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Learning Hub &amp; Toolkits</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
              activeTab === 'plan'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Registration &amp; Receipt</span>
          </button>
        </div>

        {/* Tab 1: CAREER ROADMAP & MILESTONES */}
        {activeTab === 'roadmap' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Customized Career Progression Path
                </h2>
                <p className="text-xs text-slate-500">
                  Curated specifically for your current target:{' '}
                  <span className="font-semibold text-blue-600">{profile.detail}</span>
                </p>
              </div>

              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discuss Roadmap with Mentor</span>
              </a>
            </div>

            {/* Timeline Steps */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 space-y-6">
              {roadmapSteps.map((step, idx) => {
                const isDone = step.status === 'completed';
                const isCurrent = step.status === 'in-progress';

                return (
                  <div
                    key={step.id}
                    className={`flex items-start gap-4 sm:gap-6 p-4 rounded-2xl transition-all ${
                      isCurrent
                        ? 'bg-blue-50/70 border-2 border-blue-500/40 shadow-xs'
                        : isDone
                        ? 'bg-slate-50/60 border border-slate-100'
                        : 'bg-white border border-slate-200 opacity-70'
                    }`}
                  >
                    {/* Status Icon */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm flex-shrink-0 mt-0.5 ${
                        isDone
                          ? 'bg-emerald-500 text-white'
                          : isCurrent
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20 ring-4 ring-blue-100'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isDone ? <CheckCircle2 className="w-5 h-5" /> : step.stepNumber}
                    </div>

                    {/* Step details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                          Milestone {step.stepNumber}
                        </span>

                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-emerald-100 text-emerald-700'
                              : isCurrent
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {isDone ? 'Completed' : isCurrent ? 'Action Required' : 'Upcoming'}
                        </span>
                      </div>

                      <h3 className="font-bold text-base sm:text-lg text-slate-900">
                        {step.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed">
                        {step.description}
                      </p>

                      {step.actionLabel && (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={() => setActiveTab('sessions')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                          >
                            <span>{step.actionLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: 1-ON-1 MENTORSHIP SESSIONS */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Upcoming Scheduled Session Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="font-black text-lg text-slate-900">
                      Next Confirmed 1-on-1 Mentorship Call
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Live Video Consultation
                  </span>
                </div>

                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600">
                        Topic / Session Objective
                      </span>
                      <h4 className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">
                        Profile Diagnostic, ATS Optimization &amp; Career Trajectory Call
                      </h4>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Date &amp; Time
                      </span>
                      <div className="text-sm sm:text-base font-black text-slate-900">
                        {bookedSlot || 'Tomorrow at 4:00 PM IST'}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-blue-200/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                        MK
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">Senior Mentor</div>
                        <div className="text-[11px] text-slate-500">
                          Ex-Tier 1 Tech Lead &bull; Maxicareer Faculty
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <a
                        href="https://meet.google.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        <span>Join Meeting Room</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Session Inclusions Checklist */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    What to Prepare Before Your Call:
                  </h4>
                  <ul className="space-y-1.5 text-xs text-slate-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Have your updated resume draft or transcript ready to share.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Write down 2-3 specific questions regarding your target roles or streams.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Ensure a quiet space with stable internet and microphone.</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Booking & Assistance Sidebar */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Need to Reschedule or Book an Extra Slot?
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Our mentorship team accommodates your academic and working schedules with flexible
                      timings.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="w-full py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Choose Available Slot</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left space-y-2">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                    <MessageCircle className="w-4 h-4" />
                    <span>Emergency Mentor Support</span>
                  </div>
                  <p className="text-xs text-slate-600">
                    Have an urgent query before your interview or exam?
                  </p>
                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-xs font-bold text-emerald-700 hover:underline"
                  >
                    WhatsApp Helpline: {OFFICIAL_PHONE} &rarr;
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: LEARNING HUB & TOOLKITS */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Exclusive Mentorship Resources &amp; Downloads
                </h2>
                <p className="text-xs text-slate-500">
                  Curated frameworks, blueprints, and interview banks tailored for {profile.professionLabel}.
                </p>
              </div>

              {downloadSuccess && (
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 animate-in fade-in">
                  Downloaded: {downloadSuccess}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {resources.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                        {item.type}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">{item.size}</span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleDownload(item.title)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Resource</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: MY REGISTRATION & RECEIPT */}
        {activeTab === 'plan' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-xl text-slate-900">Registration Receipt &amp; Plan Details</h3>
                  <p className="text-xs text-slate-500">Official Maxicareer Enrollment Confirmation</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200">
                  Confirmed &bull; Active
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Student ID</span>
                  <span className="font-mono font-bold text-slate-800 text-sm">{profile.id}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Registered Date</span>
                  <span className="font-bold text-slate-800">{profile.registeredDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Student Cohort</span>
                  <span className="font-bold text-blue-600">{profile.professionLabel}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Pricing / Fee Status</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    Inquired &bull; Consultation Active
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Enrolled Program Summary:
                </h4>
                <div className="flex items-center justify-between text-sm font-bold text-slate-900">
                  <span>{profile.planName}</span>
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-700 font-bold">
                    Consultation Mode
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Includes 1-on-1 personalized mentorship sessions, personalized career roadmap,
                  resume/portfolio audits, and continuous WhatsApp counseling access via{' '}
                  <strong>{OFFICIAL_PHONE}</strong>.
                </p>
              </div>

              {/* Direct Communication Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Inquire on WhatsApp ({OFFICIAL_PHONE})</span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setEmailModalData({
                      recipient: OFFICIAL_EMAIL,
                      subject: `Maxicareer Enrollment Support - ${profile.name} (${profile.id})`,
                      body: `Dear Maxicareer Support Team,\n\nStudent Profile:\n- Name: ${profile.name}\n- Student ID: ${profile.id}\n- Enrolled Plan: ${profile.planName}\n- Category: ${profile.profession}\n\nI have a question regarding:\n\nThank you!`,
                      title: 'Contact Maxicareer Support',
                      subtitle: `Direct to ${OFFICIAL_EMAIL}`,
                      senderName: profile.name,
                      senderEmail: profile.email,
                    });
                    setEmailModalOpen(true);
                  }}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 transition-colors"
                >
                  <Mail className="w-4 h-4" />
                  <span>Email Support ({OFFICIAL_EMAIL})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Slot Booking Modal */}
      {bookingModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200 space-y-5">
            <h3 className="font-bold text-lg text-slate-900">Select an Available Mentorship Slot</h3>
            <p className="text-xs text-slate-500">
              Pick a convenient time for your next 1-on-1 video session:
            </p>

            <div className="space-y-2">
              {[
                'Friday, 3:00 PM – 4:00 PM IST',
                'Friday, 6:00 PM – 7:00 PM IST',
                'Saturday, 11:00 AM – 12:00 PM IST',
                'Saturday, 4:00 PM – 5:00 PM IST',
                'Sunday, 5:00 PM – 6:00 PM IST',
              ].map((time, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleBookSlot(time)}
                  className="w-full text-left p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-semibold text-slate-700 transition-colors flex items-center justify-between"
                >
                  <span>{time}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setBookingModalOpen(false)}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Email Dispatch Modal */}
      <EmailModal
        isOpen={emailModalOpen}
        data={emailModalData}
        onClose={() => setEmailModalOpen(false)}
      />
    </div>
  );
};
