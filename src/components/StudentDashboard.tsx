import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar as CalendarIcon,
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
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  FileText,
  User,
  Sparkles,
  Phone,
  Search,
  Bell,
  MessageSquare,
  HelpCircle,
  Send,
  Check,
  Plus,
  Star,
  Award,
  X,
  RotateCcw,
  AlertCircle,
  Paperclip,
  CheckCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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

export type StudentDashboardTab =
  | 'courses'
  | 'calendar'
  | 'sessions'
  | 'notifications'
  | 'messages'
  | 'support';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  category: 'Mentorship' | 'Sessions' | 'Courses' | 'System';
  isRead: boolean;
  actionText?: string;
  actionTab?: StudentDashboardTab;
}

interface ChatMessage {
  id: string;
  sender: 'student' | 'mentor';
  text: string;
  timestamp: string;
  attachmentName?: string;
}

interface CalendarEvent {
  id: string;
  date: string; // YYYY-MM-DD
  dayNum: number;
  title: string;
  time: string;
  type: 'session' | 'deadline' | 'workshop';
  mentorName: string;
  meetLink?: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  profile,
  onLogout,
  onReturnToSite,
  onSwitchProfile,
}) => {
  // Navigation State - Matches the 6 tabs from user screenshot
  const [activeTab, setActiveTab] = useState<StudentDashboardTab>('courses');

  // Interactive States
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState<string | null>(null);
  const [bookModalOpen, setBookModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string>('Tomorrow, 4:00 PM IST');
  const [selectedTopic, setSelectedTopic] = useState('Mock Technical & Behavioral Interview');
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Email modal state
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

  // Notifications State (Initial count: 5, exactly as in image badge)
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Mentor Feedback Received',
      description: 'Sneha Sen reviewed your Resume Blueprint and added 3 strategic action items.',
      timestamp: '15 mins ago',
      category: 'Mentorship',
      isRead: false,
      actionText: 'View Feedback in Messages',
      actionTab: 'messages',
    },
    {
      id: 'notif-2',
      title: 'Upcoming 1-on-1 Mentorship Call',
      description: 'Mock Technical & Behavioral Interview is scheduled for tomorrow at 4:00 PM IST.',
      timestamp: '2 hours ago',
      category: 'Sessions',
      isRead: false,
      actionText: 'Join Meeting Link',
      actionTab: 'sessions',
    },
    {
      id: 'notif-3',
      title: 'New Curriculum Module Unlocked',
      description: 'Module 3: Industry Portfolio Projects & Real Codebases is now available.',
      timestamp: '1 day ago',
      category: 'Courses',
      isRead: false,
      actionText: 'Explore Module',
      actionTab: 'courses',
    },
    {
      id: 'notif-4',
      title: 'Course Registration Officially Confirmed',
      description: `Your enrollment in ${profile.planName} has been verified and active mentor assigned.`,
      timestamp: '2 days ago',
      category: 'System',
      isRead: false,
      actionText: 'View Course Syllabus',
      actionTab: 'courses',
    },
    {
      id: 'notif-5',
      title: 'Live Weekend Mentorship Office Hours',
      description: 'Group AMA with Senior Tech Leaders announced for Saturday 11:00 AM IST.',
      timestamp: '3 days ago',
      category: 'Mentorship',
      isRead: false,
      actionText: 'Check Calendar',
      actionTab: 'calendar',
    },
  ]);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  // Messaging State (Initial count: 0, exactly as in image badge)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'mentor',
      text: `Hello ${profile.name}! Welcome to your Maxicareer mentorship journey. I have reviewed your background and your initial goals. Let's make this program transformative!`,
      timestamp: 'Yesterday, 10:30 AM',
    },
    {
      id: 'msg-2',
      sender: 'student',
      text: 'Thank you Sneha! I am looking forward to our upcoming mock interview and working on my ATS resume overhaul.',
      timestamp: 'Yesterday, 11:15 AM',
    },
    {
      id: 'msg-3',
      sender: 'mentor',
      text: 'Excellent. Please download the ATS Resume Master Template from the My Courses tab and review the behavioral STAR framework questions before our call tomorrow at 4:00 PM.',
      timestamp: 'Yesterday, 2:40 PM',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isMentorTyping, setIsMentorTyping] = useState(false);

  // Expanded Modules State in My Courses
  const [expandedModuleId, setExpandedModuleId] = useState<string>('mod-1');
  const [completedLessonIds, setCompletedLessonIds] = useState<string[]>([
    'lesson-1-1',
    'lesson-1-2',
    'lesson-1-3',
    'lesson-2-1',
  ]);

  // Calendar Selected Date
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<number>(12); // Day 12
  const calendarEvents: CalendarEvent[] = [
    {
      id: 'ev-1',
      date: '2026-10-12',
      dayNum: 12,
      title: '1-on-1 Mock Technical & HR Interview',
      time: '4:00 PM – 5:00 PM IST',
      type: 'session',
      mentorName: 'Sneha Sen',
      meetLink: 'https://meet.google.com',
    },
    {
      id: 'ev-2',
      date: '2026-10-15',
      dayNum: 15,
      title: 'Milestone 2: Portfolio Code Architecture Submission',
      time: '11:59 PM IST (Deadline)',
      type: 'deadline',
      mentorName: 'Sneha Sen',
    },
    {
      id: 'ev-3',
      date: '2026-10-17',
      dayNum: 17,
      title: 'Weekend Live Office Hours: Resume & LinkedIn Review',
      time: '11:00 AM – 12:30 PM IST',
      type: 'workshop',
      mentorName: 'Dr. Priya Nair & Industry Mentors',
      meetLink: 'https://meet.google.com',
    },
    {
      id: 'ev-4',
      date: '2026-10-22',
      dayNum: 22,
      title: '1-on-1 Career Strategy & Negotiation Call',
      time: '6:30 PM – 7:15 PM IST',
      type: 'session',
      mentorName: 'Sneha Sen',
      meetLink: 'https://meet.google.com',
    },
  ];

  // Support Ticket Form State
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketCategory, setTicketCategory] = useState('Mentorship Guidance');
  const [ticketPriority, setTicketPriority] = useState('Normal');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  // FAQ Expanded index
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(0);

  // Roadmap & resources from portal data
  const roadmapSteps = ROADMAP_DATA[profile.profession] || ROADMAP_DATA.college;
  const resources = RESOURCE_ITEMS[profile.profession] || RESOURCE_ITEMS.college;

  const handleDownloadFile = (title: string) => {
    setDownloadToast(`Downloaded: ${title}`);
    setTimeout(() => {
      setDownloadToast(null);
    }, 3000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'student',
      text: chatInput.trim(),
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, newMsg]);
    const studentQuery = chatInput.trim();
    setChatInput('');

    // Simulated mentor reply after 1.2 seconds
    setIsMentorTyping(true);
    setTimeout(() => {
      setIsMentorTyping(false);
      const mentorReply: ChatMessage = {
        id: `msg-mentor-${Date.now()}`,
        sender: 'mentor',
        text: `Got your message regarding: "${studentQuery.slice(0, 35)}...". I am reviewing this right now and will provide detailed guidance during our upcoming session!`,
        timestamp: 'Just now',
      };
      setMessages((prev) => [...prev, mentorReply]);
    }, 1200);
  };

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSuccessMsg(`Session booked successfully for ${selectedSlot} (${selectedTopic})! Meeting link sent to your registered email.`);
    setTimeout(() => {
      setBookingSuccessMsg(null);
      setBookModalOpen(false);
    }, 2200);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleToggleLesson = (lessonId: string) => {
    setCompletedLessonIds((prev) =>
      prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
    );
  };

  const directWhatsAppUrl = `https://wa.me/${OFFICIAL_PHONE_DIGITS}?text=${encodeURIComponent(
    `Hello Maxicareer Mentors! I am ${profile.name} (ID: ${profile.id}), enrolled in ${profile.planName}. I would like to connect with my mentor.`
  )}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col selection:bg-purple-600 selection:text-white">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP PORTAL HEADER (Matches Admin Portal Style)                 */}
      {/* ------------------------------------------------------------------ */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-18 gap-3 sm:gap-4">
            {/* Left: Brand Logo + Portal Identity */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <button
                type="button"
                onClick={onReturnToSite}
                className="flex items-center group transition-transform hover:scale-105 shrink-0"
                title="Return to Maxicareer Homepage"
              >
                <BrandLogo variant="default" size="md" />
              </button>

              <div className="h-6 w-px bg-slate-200 hidden md:block shrink-0" />

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight truncate">
                    Student Portal
                  </span>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 shrink-0">
                    Active Learner
                  </span>
                </div>
                <span className="text-[11px] text-slate-500 font-medium truncate">
                  {profile.professionLabel} &bull; Mentor: Sneha Sen
                </span>
              </div>
            </div>

            {/* Middle: Search input (desktop) */}
            <div className="hidden xl:flex items-center flex-1 max-w-xs mx-4">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search modules, notes, sessions..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>
            </div>

            {/* Right: Mentor WhatsApp, Notification Bell, Public Site, Corner Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {/* WhatsApp Mentor Help */}
              <a
                href={directWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-bold transition-colors shadow-2xs"
                title={`Chat with Mentor on WhatsApp: ${OFFICIAL_PHONE}`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mentor WhatsApp</span>
              </a>

              {/* Notification Bell Shortcut */}
              <button
                type="button"
                onClick={() => setActiveTab('notifications')}
                className="relative p-2 rounded-xl text-slate-600 hover:text-purple-700 hover:bg-purple-50 transition-colors"
                title="View Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationsCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-purple-600 text-white rounded-full text-[10px] font-black flex items-center justify-center">
                    {unreadNotificationsCount}
                  </span>
                )}
              </button>

              {/* Return to Public Site */}
              <button
                type="button"
                onClick={onReturnToSite}
                className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                title="Return to Public Website"
              >
                <span>Public Site</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              {/* Corner Profile Menu */}
              <CornerProfileMenu
                userProfile={profile}
                onOpenSignIn={() => {}}
                onOpenDashboard={() => {}}
                onLogout={onLogout}
                onSwitchProfile={onSwitchProfile || (() => {})}
                onBookConsultation={() => setBookModalOpen(true)}
              />
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* 2. SUB-NAVIGATION TABS (EXACTLY MATCHING USER SCREENSHOT)          */}
        {/* ------------------------------------------------------------------ */}
        <div className="bg-white border-t border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-6 sm:gap-8 overflow-x-auto scrollbar-none py-1">
              {/* Tab 1: My Courses */}
              <button
                id="tab-my-courses"
                type="button"
                onClick={() => setActiveTab('courses')}
                className={`relative py-3.5 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'courses'
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>My Courses</span>
                {activeTab === 'courses' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* Tab 2: Calendar */}
              <button
                id="tab-calendar"
                type="button"
                onClick={() => setActiveTab('calendar')}
                className={`relative py-3.5 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'calendar'
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Calendar</span>
                {activeTab === 'calendar' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* Tab 3: My Sessions */}
              <button
                id="tab-my-sessions"
                type="button"
                onClick={() => setActiveTab('sessions')}
                className={`relative py-3.5 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'sessions'
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>My Sessions</span>
                {activeTab === 'sessions' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* Tab 4: Notifications (Badge 5) */}
              <button
                id="tab-notifications"
                type="button"
                onClick={() => setActiveTab('notifications')}
                className={`relative py-3.5 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'notifications'
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Notifications</span>
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold text-white transition-transform ${
                    activeTab === 'notifications'
                      ? 'bg-[#7C3AED] scale-105'
                      : 'bg-[#7C3AED]'
                  }`}
                >
                  {unreadNotificationsCount}
                </span>
                {activeTab === 'notifications' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* Tab 5: Messages (Badge 0) */}
              <button
                id="tab-messages"
                type="button"
                onClick={() => setActiveTab('messages')}
                className={`relative py-3.5 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'messages'
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Messages</span>
                <span
                  className={`inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-bold text-white transition-transform ${
                    activeTab === 'messages'
                      ? 'bg-[#7C3AED] scale-105'
                      : 'bg-[#7C3AED]'
                  }`}
                >
                  {messages.filter((m) => m.sender === 'mentor').length > 10 ? 1 : 0}
                </span>
                {activeTab === 'messages' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>

              {/* Tab 6: Support */}
              <button
                id="tab-support"
                type="button"
                onClick={() => setActiveTab('support')}
                className={`relative py-3.5 text-sm sm:text-base font-semibold whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'support'
                    ? 'text-[#7C3AED] font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Support</span>
                {activeTab === 'support' && (
                  <motion.div
                    layoutId="activeTabUnderline"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#7C3AED] rounded-full"
                    transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                  />
                )}
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Download Notification Toast */}
      <AnimatePresence>
        {downloadToast && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-3 text-xs font-bold"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{downloadToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* 3. MAIN WORKSPACE AREA                                             */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* ------------------------------------------------------------------ */}
        {/* TAB 1: MY COURSES                                                  */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            {/* Course Overview Card */}
            <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="space-y-2 max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-400/30">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span>Enrolled Course: {profile.planName}</span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    {profile.planName}
                  </h1>

                  <p className="text-sm text-slate-300 leading-relaxed">
                    Personalized career roadmap, hands-on skill deliverables, and continuous 1-on-1 mentor guidance. Status:{' '}
                    <span className="text-emerald-400 font-bold">Confirmed by Admin &bull; In Progress</span>
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
                    <button
                      type="button"
                      onClick={() => setBookModalOpen(true)}
                      className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold transition-all shadow-md shadow-purple-500/25 active:scale-95 cursor-pointer flex items-center gap-1.5"
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                      <span>Book Next 1-on-1 Session</span>
                    </button>

                    <a
                      href={directWhatsAppUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Ask Mentor on WhatsApp</span>
                    </a>
                  </div>
                </div>

                {/* KPI Card */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/15 flex items-center gap-6 self-start lg:self-auto shrink-0">
                  <div>
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Curriculum Progress
                    </span>
                    <span className="text-3xl font-black text-white">
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
                      Assigned Mentor
                    </span>
                    <div className="text-sm font-bold text-white mt-0.5">Sneha Sen</div>
                    <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-0.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Active Mentor (4.9 ★)
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Course Curriculum & Modules */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">
                    Course Curriculum &amp; Syllabus Modules
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Structured multi-phase learning path tailored for {profile.professionLabel}. Click to expand each module.
                  </p>
                </div>

                <span className="text-xs font-bold text-purple-700 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full w-fit">
                  4 Comprehensive Modules &bull; 16 Weeks
                </span>
              </div>

              <div className="space-y-4">
                {/* Module 1 */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setExpandedModuleId(expandedModuleId === 'mod-1' ? '' : 'mod-1')}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                        01
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">
                            Career Trajectory &amp; Strength Architecture
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                            Completed
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Personalized diagnostic, 0-to-5 year trajectory, and industry market mapping.
                        </p>
                      </div>
                    </div>
                    {expandedModuleId === 'mod-1' ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {expandedModuleId === 'mod-1' && (
                    <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                      {[
                        { id: 'lesson-1-1', title: 'Aptitude & Strength Evaluation Diagnostic', duration: '45 mins', type: 'Assessment' },
                        { id: 'lesson-1-2', title: 'Market Value & Target Role Benchmark', duration: '60 mins', type: 'Blueprint' },
                        { id: 'lesson-1-3', title: 'Quarterly Career Roadmap & Milestones Formulation', duration: '50 mins', type: '1:1 Review' },
                      ].map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleLesson(lesson.id)}
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Toggle completion"
                            >
                              <CheckCircle2
                                className={`w-5 h-5 ${
                                  completedLessonIds.includes(lesson.id)
                                    ? 'text-emerald-600 fill-emerald-100'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                              {lesson.type}
                            </span>
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Module 2 */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setExpandedModuleId(expandedModuleId === 'mod-2' ? '' : 'mod-2')}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-sm shrink-0">
                        02
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">
                            Core Practical Skills &amp; Modern Industry Tooling
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                            In Progress
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          High-leverage technical and domain competencies required by top employers.
                        </p>
                      </div>
                    </div>
                    {expandedModuleId === 'mod-2' ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>

                  {expandedModuleId === 'mod-2' && (
                    <div className="p-5 bg-white border-t border-slate-100 space-y-3">
                      {[
                        { id: 'lesson-2-1', title: 'Hands-on Tooling Mastery (Git, Cloud, Production Stacks)', duration: '1h 15m', type: 'Hands-on' },
                        { id: 'lesson-2-2', title: 'Communication, Executive Presence & Case Walkthroughs', duration: '50 mins', type: 'Interactive' },
                        { id: 'lesson-2-3', title: 'System Design & Problem-Solving Frameworks', duration: '1h 30m', type: 'Masterclass' },
                      ].map((lesson) => (
                        <div
                          key={lesson.id}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 hover:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => handleToggleLesson(lesson.id)}
                              className="text-emerald-600 hover:text-emerald-700"
                              title="Toggle completion"
                            >
                              <CheckCircle2
                                className={`w-5 h-5 ${
                                  completedLessonIds.includes(lesson.id)
                                    ? 'text-emerald-600 fill-emerald-100'
                                    : 'text-slate-300'
                                }`}
                              />
                            </button>
                            <span className="text-xs sm:text-sm font-semibold text-slate-800">
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-medium">
                              {lesson.type}
                            </span>
                            <span>{lesson.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Module 3 */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setExpandedModuleId(expandedModuleId === 'mod-3' ? '' : 'mod-3')}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                        03
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">
                            Portfolio Projects &amp; Real Production Deliverables
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                            Up Next
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Building proof-of-work that stands out in recruiter screenings and hiring panels.
                        </p>
                      </div>
                    </div>
                    {expandedModuleId === 'mod-3' ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>

                {/* Module 4 */}
                <div className="rounded-2xl border border-slate-200 overflow-hidden transition-all">
                  <button
                    type="button"
                    onClick={() => setExpandedModuleId(expandedModuleId === 'mod-4' ? '' : 'mod-4')}
                    className="w-full flex items-center justify-between p-5 bg-slate-50 hover:bg-slate-100/80 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
                        04
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-slate-900">
                            ATS Resume, Interview Coaching &amp; Offer Advisory
                          </h3>
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                            Placement Ready
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Mock behavioral and technical interviews, recruiter messaging, and compensation negotiation.
                        </p>
                      </div>
                    </div>
                    {expandedModuleId === 'mod-4' ? (
                      <ChevronUp className="w-5 h-5 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-slate-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Course Resources & Downloads */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                    Course Resources &amp; Downloads
                  </h3>
                  <p className="text-xs text-slate-500">
                    Official blueprints, ATS templates, and practice toolkits included with your mentorship.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {resources.map((res, idx) => (
                  <div
                    key={res.title || idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold text-xs mb-3">
                        <FileText className="w-4 h-4" />
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{res.title}</h4>
                      <p className="text-xs text-slate-500 mt-1">{res.description}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDownloadFile(res.title)}
                      className="mt-4 w-full py-2 px-3 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-200 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 2: CALENDAR                                                    */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'calendar' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Mentorship Schedule &amp; Calendar
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Track upcoming 1-on-1 calls, office hours, and curriculum milestone deadlines for October 2026.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBookModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Schedule New Session</span>
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Calendar Grid (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900">
                    October 2026
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-600" />
                      1:1 Call
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Deadline
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      Office Hours
                    </span>
                  </div>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 py-2 border-b border-slate-100">
                  <span>Sun</span>
                  <span>Mon</span>
                  <span>Tue</span>
                  <span>Wed</span>
                  <span>Thu</span>
                  <span>Fri</span>
                  <span>Sat</span>
                </div>

                {/* 31 days calendar */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Empty offset for Wednesday 1st Oct */}
                  <div className="p-3 text-center opacity-0"></div>
                  <div className="p-3 text-center opacity-0"></div>
                  <div className="p-3 text-center opacity-0"></div>

                  {[...Array(31)].map((_, i) => {
                    const day = i + 1;
                    const eventOnDay = calendarEvents.find((e) => e.dayNum === day);
                    const isSelected = selectedCalendarDate === day;

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => setSelectedCalendarDate(day)}
                        className={`h-14 sm:h-16 p-1.5 rounded-2xl flex flex-col items-center justify-between transition-all cursor-pointer border ${
                          isSelected
                            ? 'bg-purple-50 border-purple-400 ring-2 ring-purple-400/20'
                            : eventOnDay
                            ? 'bg-slate-50 border-slate-200 hover:border-purple-300'
                            : 'hover:bg-slate-50 border-transparent text-slate-700'
                        }`}
                      >
                        <span
                          className={`text-xs font-bold ${
                            isSelected ? 'text-purple-700 font-extrabold' : 'text-slate-700'
                          }`}
                        >
                          {day}
                        </span>

                        {eventOnDay && (
                          <span
                            className={`w-2 h-2 rounded-full ${
                              eventOnDay.type === 'session'
                                ? 'bg-purple-600'
                                : eventOnDay.type === 'deadline'
                                ? 'bg-amber-500'
                                : 'bg-blue-600'
                            }`}
                            title={eventOnDay.title}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right: Selected Date Agenda (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    Events for Oct {selectedCalendarDate}, 2026
                  </h3>
                  <span className="text-xs font-bold text-purple-600">
                    {calendarEvents.filter((e) => e.dayNum === selectedCalendarDate).length} Scheduled
                  </span>
                </div>

                {calendarEvents.filter((e) => e.dayNum === selectedCalendarDate).length > 0 ? (
                  <div className="space-y-4">
                    {calendarEvents
                      .filter((e) => e.dayNum === selectedCalendarDate)
                      .map((ev) => (
                        <div
                          key={ev.id}
                          className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-2"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-200 text-purple-800">
                              {ev.type}
                            </span>
                            <span className="text-xs font-bold text-slate-600">{ev.time}</span>
                          </div>

                          <h4 className="font-bold text-sm text-slate-900">{ev.title}</h4>
                          <p className="text-xs text-slate-600">With: {ev.mentorName}</p>

                          {ev.meetLink && (
                            <div className="pt-2">
                              <a
                                href={ev.meetLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                              >
                                <Video className="w-3.5 h-3.5" />
                                <span>Join Google Meet</span>
                              </a>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-slate-400 space-y-2">
                    <CalendarIcon className="w-8 h-8 mx-auto text-slate-300" />
                    <p className="text-xs font-medium">No sessions scheduled on this day.</p>
                    <button
                      type="button"
                      onClick={() => setBookModalOpen(true)}
                      className="text-xs font-bold text-purple-600 hover:underline"
                    >
                      Click here to book a call
                    </button>
                  </div>
                )}

                {/* Upcoming Next List */}
                <div className="border-t border-slate-100 pt-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    All Upcoming Key Dates
                  </h4>
                  {calendarEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedCalendarDate(ev.dayNum)}
                      className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer text-xs"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Oct {ev.dayNum} &bull; {ev.time}</span>
                      </div>
                      <div className="text-slate-600 truncate mt-0.5">{ev.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 3: MY SESSIONS                                                 */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  1-on-1 Mentorship Sessions &amp; Consultations
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Direct private sessions with your designated industry practitioners. 6 Total credits allocated in {profile.planName}.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setBookModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/20 transition-all flex items-center gap-2 cursor-pointer shrink-0 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Book New Session</span>
              </button>
            </div>

            {/* Session KPI Counters */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-2xl font-black text-slate-900">6</span>
                <span className="text-xs text-slate-500 font-medium">Total Credits</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-2xl font-black text-emerald-600">3</span>
                <span className="text-xs text-slate-500 font-medium">Completed</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-2xl font-black text-purple-600">1</span>
                <span className="text-xs text-slate-500 font-medium">Upcoming</span>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center">
                <span className="block text-2xl font-black text-blue-600">2</span>
                <span className="text-xs text-slate-500 font-medium">Remaining to Book</span>
              </div>
            </div>

            {/* Next Upcoming Session Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="font-black text-lg text-slate-900">
                    Next Confirmed 1-on-1 Mentorship Call
                  </h3>
                </div>
                <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Live Video Call
                </span>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-50 via-slate-50 to-blue-50 border border-purple-200/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">
                      Topic / Session Objective
                    </span>
                    <h4 className="text-base sm:text-xl font-bold text-slate-900 mt-0.5">
                      Mock Technical &amp; Behavioral Interview Drill
                    </h4>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Date &amp; Time
                    </span>
                    <div className="text-sm sm:text-base font-black text-slate-900">
                      Tomorrow at 4:00 PM IST
                    </div>
                  </div>
                </div>

                <div className="border-t border-purple-200/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      SS
                    </div>
                    <div>
                      <div className="font-bold text-xs text-slate-900">Sneha Sen</div>
                      <div className="text-[11px] text-slate-500">Senior Industry Practitioner &bull; Maxicareer Faculty</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <a
                      href="https://meet.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-purple-600 hover:bg-purple-700 shadow-sm transition-colors cursor-pointer"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Google Meet</span>
                    </a>

                    <button
                      type="button"
                      onClick={() => setBookModalOpen(true)}
                      className="px-3.5 py-2.5 rounded-xl font-bold text-xs text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                      Reschedule
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Past Completed Sessions */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-base text-slate-900">
                Completed Session History &amp; Mentor Notes
              </h3>

              <div className="space-y-3">
                {[
                  {
                    id: 's-1',
                    date: 'October 4, 2026',
                    topic: 'Initial Career Evaluation & Diagnostic Mapping',
                    mentor: 'Sneha Sen',
                    rating: '5/5 ★',
                    recap: 'Mapped clear 12-month trajectory. Assigned priority focus on ATS resume polish and system design drills.',
                  },
                  {
                    id: 's-2',
                    date: 'September 28, 2026',
                    topic: 'Resume Diagnostic & ATS Keyword Alignment',
                    mentor: 'Sneha Sen',
                    rating: '5/5 ★',
                    recap: 'Overhauled work experience bullet points using XYZ format. Added quantitative outcomes and metrics.',
                  },
                  {
                    id: 's-3',
                    date: 'September 20, 2026',
                    topic: 'Target Companies & High-Growth Sectors Consultation',
                    mentor: 'Dr. Priya Nair',
                    rating: '5/5 ★',
                    recap: 'Shortlisted top 25 target firms and developed alumni outreach messaging templates.',
                  },
                ].map((past) => (
                  <div
                    key={past.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <span className="font-bold text-sm text-slate-900">{past.topic}</span>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500 font-medium">{past.date}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Completed
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong className="text-slate-700">Mentor Notes:</strong> {past.recap}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 4: NOTIFICATIONS (5 Unread Badge)                              */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-2xs">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    Notifications &amp; Activity Updates
                  </h2>
                  {unreadNotificationsCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-600 text-white">
                      {unreadNotificationsCount} Unread
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  Real-time mentor responses, course milestone unlocks, and upcoming schedule alerts.
                </p>
              </div>

              {unreadNotificationsCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllNotificationsRead}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors cursor-pointer shrink-0"
                >
                  Mark All as Read
                </button>
              )}
            </div>

            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xs space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    !notif.isRead
                      ? 'bg-purple-50/50 border-purple-200'
                      : 'bg-white border-slate-200/80 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                        !notif.isRead
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Bell className="w-4 h-4" />
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {notif.category}
                        </span>
                        <span className="text-xs text-slate-400">{notif.timestamp}</span>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-purple-600" />
                        )}
                      </div>
                      <h4 className="font-bold text-sm text-slate-900">{notif.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {notif.description}
                      </p>
                    </div>
                  </div>

                  {notif.actionText && (
                    <button
                      type="button"
                      onClick={() => {
                        if (notif.actionTab) setActiveTab(notif.actionTab);
                        setNotifications((prev) =>
                          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
                        );
                      }}
                      className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-purple-50 text-purple-700 border border-slate-200 hover:border-purple-300 transition-colors shrink-0 text-center"
                    >
                      {notif.actionText}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 5: MESSAGES (Chat with Mentor)                                 */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden min-h-[600px]">
              {/* Left Contacts Sidebar (4 cols) */}
              <div className="lg:col-span-4 border-r border-slate-200 p-5 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-bold text-base text-slate-900">Mentorship Messages</h3>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Online
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      SS
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">Sneha Sen</span>
                        <span className="text-[10px] text-slate-400">2:40 PM</span>
                      </div>
                      <span className="text-[11px] text-purple-700 font-medium block">
                        Assigned Senior Mentor
                      </span>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Please review the behavioral STAR framework...
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      PN
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">Dr. Priya Nair</span>
                        <span className="text-[10px] text-slate-400">Yesterday</span>
                      </div>
                      <span className="text-[11px] text-slate-500 font-medium block">
                        Academic Career Counselor
                      </span>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Roadmap blueprint approved for Step-Next...
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      MC
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 truncate">Maxicareer Helpdesk</span>
                        <span className="text-[10px] text-slate-400">Oct 8</span>
                      </div>
                      <span className="text-[11px] text-emerald-700 font-medium block">
                        Student Operations
                      </span>
                      <p className="text-xs text-slate-500 truncate mt-0.5">
                        Your enrollment receipt and schedule confirmed.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Chat Thread (8 cols) */}
              <div className="lg:col-span-8 flex flex-col justify-between p-6">
                {/* Chat Top Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                      SS
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Sneha Sen</h4>
                      <p className="text-[11px] text-slate-500">
                        Senior Mentor &bull; Active &bull; Response time: ~15 mins
                      </p>
                    </div>
                  </div>

                  <a
                    href={directWhatsAppUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Open WhatsApp Chat</span>
                  </a>
                </div>

                {/* Message Bubble Thread */}
                <div className="flex-1 py-6 space-y-4 overflow-y-auto max-h-[380px] pr-2">
                  {messages.map((m) => {
                    const isMe = m.sender === 'student';
                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-md p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            isMe
                              ? 'bg-purple-600 text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs'
                          }`}
                        >
                          <p>{m.text}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {m.timestamp}
                        </span>
                      </div>
                    );
                  })}

                  {isMentorTyping && (
                    <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                      <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
                      <span>Sneha Sen is typing a reply...</span>
                    </div>
                  )}
                </div>

                {/* Quick Prompts Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-3 pb-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Quick Questions:</span>
                  {[
                    'Can we review my resume draft tomorrow?',
                    'How should I prepare for the technical drill?',
                    'What is the next roadmap milestone?',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setChatInput(chip)}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>

                {/* Chat Input Bar */}
                <form onSubmit={handleSendMessage} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your question or doubt for your mentor..."
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="submit"
                    className="px-5 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TAB 6: SUPPORT HUB                                                 */}
        {/* ------------------------------------------------------------------ */}
        {activeTab === 'support' && (
          <div className="space-y-6">
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Mentorship Support &amp; Student Helpdesk
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
                Have questions regarding your curriculum, 1-on-1 mentor appointments, resume review turnaround, or need direct administrative help? We are here for you.
              </p>

              {/* 3 Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <a
                  href={directWhatsAppUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <MessageCircle className="w-6 h-6 text-emerald-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900">WhatsApp Mentor Line</h4>
                    <p className="text-xs text-slate-600 mt-1">Instant support directly on chat</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 mt-3 inline-flex items-center gap-1">
                    <span>{OFFICIAL_PHONE}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </a>

                <button
                  type="button"
                  onClick={() => {
                    setEmailModalData({
                      recipient: OFFICIAL_EMAIL,
                      subject: `Student Support Ticket - ${profile.name} (${profile.id})`,
                      body: `Student ID: ${profile.id}\nName: ${profile.name}\nCourse: ${profile.planName}\n\nI need assistance with:\n`,
                      title: 'Email Student Helpdesk',
                      subtitle: `Direct to ${OFFICIAL_EMAIL}`,
                    });
                    setEmailModalOpen(true);
                  }}
                  className="p-5 rounded-2xl bg-blue-50 border border-blue-200 hover:shadow-md transition-all text-left flex flex-col justify-between cursor-pointer"
                >
                  <div>
                    <Mail className="w-6 h-6 text-blue-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900">Official Email Support</h4>
                    <p className="text-xs text-slate-600 mt-1">Written inquiry with 24h turnaround</p>
                  </div>
                  <span className="text-xs font-bold text-blue-700 mt-3 inline-flex items-center gap-1">
                    <span>{OFFICIAL_EMAIL}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </button>

                <div className="p-5 rounded-2xl bg-purple-50 border border-purple-200 flex flex-col justify-between">
                  <div>
                    <Phone className="w-6 h-6 text-purple-600 mb-2" />
                    <h4 className="font-bold text-sm text-slate-900">Emergency Call Support</h4>
                    <p className="text-xs text-slate-600 mt-1">Phone consultations 10 AM – 7 PM</p>
                  </div>
                  <a
                    href={`tel:${OFFICIAL_PHONE_DIGITS}`}
                    className="text-xs font-bold text-purple-700 mt-3 inline-flex items-center gap-1"
                  >
                    <span>Call Counselor</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Support Ticket Submission Form */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-6">
              <h3 className="font-bold text-lg text-slate-900">Submit a Support Request</h3>

              {ticketSubmitted ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-900">Support Request Logged!</h4>
                  <p className="text-xs text-emerald-700">
                    Your request (Ticket #ST-{Math.floor(1000 + Math.random() * 9000)}) has been forwarded to our student operations team. You will receive an update within 4 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setTicketSubmitted(false);
                      setTicketSubject('');
                      setTicketMessage('');
                    }}
                    className="mt-2 text-xs font-bold text-purple-600 underline"
                  >
                    Submit another query
                  </button>
                </div>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!ticketSubject.trim() || !ticketMessage.trim()) return;
                    setTicketSubmitted(true);
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Category
                      </label>
                      <select
                        value={ticketCategory}
                        onChange={(e) => setTicketCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option>Mentorship Guidance &amp; Doubts</option>
                        <option>Session Rescheduling / Scheduling</option>
                        <option>Curriculum Blueprint &amp; Materials</option>
                        <option>Resume Review / Deliverable Feedback</option>
                        <option>Account &amp; Registration Query</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Priority
                      </label>
                      <select
                        value={ticketPriority}
                        onChange={(e) => setTicketPriority(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option>Normal (Within 24 Hours)</option>
                        <option>High (Within 6 Hours)</option>
                        <option>Urgent (Within 1 Hour)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      placeholder="e.g. Question regarding Mock Interview preparation..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Details / Description
                    </label>
                    <textarea
                      rows={4}
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      placeholder="Please describe your question or issue in detail..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-purple-500/25 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Ticket</span>
                  </button>
                </form>
              )}
            </div>

            {/* FAQ Accordion */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
              <h3 className="font-bold text-lg text-slate-900">
                Frequently Asked Student Questions
              </h3>

              <div className="space-y-3">
                {[
                  {
                    q: 'How do I schedule a 1-on-1 session with my assigned mentor?',
                    a: 'Navigate to the My Sessions or Calendar tab, click "Book New Session", and select your desired date and time slot. A Google Meet link is automatically generated and added to your calendar.',
                  },
                  {
                    q: 'Can I message my mentor between scheduled sessions?',
                    a: 'Yes! Use the Messages tab to send questions directly to your mentor, or click the WhatsApp Mentor button for real-time mobile chat at +91 9789730097.',
                  },
                  {
                    q: 'Where do I access downloadable blueprints and ATS resume templates?',
                    a: 'In the My Courses tab, scroll to the "Course Resources & Downloads" section. All templates are ready for 1-click download in PDF and DOCX formats.',
                  },
                  {
                    q: 'What happens if I miss a scheduled mentorship session?',
                    a: 'You can reschedule any session with at least 4 hours notice via the My Sessions tab without losing your credit.',
                  },
                  {
                    q: 'Will I receive an official certificate upon completing my mentorship program?',
                    a: 'Yes. Upon completing the course modules and required milestone roadmap deliverables, Maxicareer issues a verifiable Certificate of Completion.',
                  },
                ].map((faq, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setExpandedFaqIndex(expandedFaqIndex === idx ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-800 bg-slate-50/70 hover:bg-slate-100 transition-colors"
                    >
                      <span>{faq.q}</span>
                      {expandedFaqIndex === idx ? (
                        <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                    </button>
                    {expandedFaqIndex === idx && (
                      <div className="p-4 bg-white text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* 4. BOOKING MODAL (1-on-1 Session Slot Picker)                       */}
      {/* ------------------------------------------------------------------ */}
      <AnimatePresence>
        {bookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-5 border border-slate-200"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Schedule 1-on-1 Mentorship Call
                  </h3>
                  <p className="text-xs text-slate-500">With Senior Mentor: Sneha Sen</p>
                </div>
                <button
                  type="button"
                  onClick={() => setBookModalOpen(false)}
                  className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {bookingSuccessMsg ? (
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
                  <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                  <p className="text-xs sm:text-sm font-bold text-emerald-900">{bookingSuccessMsg}</p>
                </div>
              ) : (
                <form onSubmit={handleBookSession} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Session Topic Focus
                    </label>
                    <select
                      value={selectedTopic}
                      onChange={(e) => setSelectedTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option>Mock Technical &amp; Behavioral Interview</option>
                      <option>ATS Resume Diagnostic &amp; Critique</option>
                      <option>Career Trajectory &amp; Transition Strategy</option>
                      <option>System Design &amp; Portfolio Code Architecture</option>
                      <option>Offer Negotiation &amp; Recruiter Outreach Drill</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Choose Available Slot
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        'Tomorrow, 4:00 PM IST',
                        'Tomorrow, 6:30 PM IST',
                        'Friday, 2:00 PM IST',
                        'Friday, 5:00 PM IST',
                        'Saturday, 11:30 AM IST',
                        'Monday, 4:00 PM IST',
                      ].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`p-2.5 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                            selectedSlot === slot
                              ? 'bg-purple-50 border-purple-400 text-purple-700 ring-2 ring-purple-400/20'
                              : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800 space-y-1">
                    <div className="font-bold">What happens next?</div>
                    <p className="text-[11px] text-purple-700">
                      A Google Meet link will be generated automatically and synchronized to your calendar and email.
                    </p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setBookModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 active:scale-95 cursor-pointer"
                    >
                      Confirm Booking
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Email Modal */}
      <EmailModal
        isOpen={emailModalOpen}
        data={emailModalData}
        onClose={() => setEmailModalOpen(false)}
      />
    </div>
  );
};
