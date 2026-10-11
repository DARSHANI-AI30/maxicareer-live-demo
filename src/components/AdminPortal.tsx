import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, ChevronDown, ExternalLink, LogOut, PanelLeft, Menu, X, Search, Eye, EyeOff, AlertCircle, ArrowRight, MessageCircle, Mail, Route, FileStack, Check } from 'lucide-react';
import { DbStudent, MongoStats, StudentProfile, UserProfession } from '../types';
import { BrandLogo } from './BrandLogo';
import {
  AdminContext,
  AdminContextValue,
  AdminSession,
  AdminTab,
  AppNotification,
  Application,
  ApprovalItem,
  AuditEntry,
  RoadmapTemplate,
  SessionItem,
  StudentRoadmap,
  NAV_GROUPS,
  SETTINGS_ITEM,
  ALL_TABS,
  tabLabel,
  tabGroup,
  MENTORS,
  COHORT_LABEL,
  roadmapProgress,
} from './admin/context';
import { usePersistentState, readStore, uid, timeAgo, formatDate, inr, DAY_MS } from './admin/lib';
import { Button, Badge, Drawer, Modal, Field, Input, Select, Textarea, StepMeter, Avatar, cx } from './admin/ui';
import { Dashboard } from './admin/pages/Dashboard';
import { Students, STATUS_LABEL, STATUS_TONE } from './admin/pages/Students';
import { Roadmaps } from './admin/pages/Roadmaps';
import { Applications, STAGE_TONE } from './admin/pages/Applications';
import { Notifications, CATEGORY_META, DEFAULT_PREFS, NotificationPrefs } from './admin/pages/Notifications';
import { Website } from './admin/pages/Website';
import { Approvals, AuditLog, PageAccess } from './admin/pages/Governance';
import { Counsellors, UserManagement, Programs, Services, Sessions, Reports, SettingsPage } from './admin/pages/Operations';

export type { AdminSession } from './admin/context';

interface AdminPortalProps {
  onBackToSite: () => void;
  currentUserProfile?: StudentProfile | null;
  onStudentLogout?: () => void;
  onAdminAuthenticated?: (session: AdminSession) => void;
}

/* ------------------------------------------------------------------ */
/* Seed data                                                           */
/* ------------------------------------------------------------------ */

const DEFAULT_TEMPLATES: RoadmapTemplate[] = [
  { id: 'rm-1', cohort: 'school', title: 'Step-Ready: school career discovery', audience: 'Class 9–12', duration: '12 weeks', status: 'Published', milestones: ['Aptitude and strengths assessment', 'Explore streams and career families', 'Entrance exam strategy (CUET / JEE / SAT)', 'Shortlist colleges and courses', 'Build a 12-month action plan'] },
  { id: 'rm-2', cohort: 'college', title: 'Step-Next: placement ready', audience: 'Undergraduate and postgraduate students', duration: '16 weeks', status: 'Published', milestones: ['Skill gap and profile audit', 'Complete two portfolio projects', 'ATS resume and LinkedIn review', 'Mock technical and HR interviews', 'Off-campus applications and referrals', 'Offer evaluation'] },
  { id: 'rm-3', cohort: 'fresher', title: 'Step-In: first job launch', audience: 'Fresh graduates and PSW holders', duration: '8 weeks', status: 'Published', milestones: ['Career path and market mapping', 'Resume and cover letter overhaul', 'LinkedIn optimisation and recruiter outreach', 'Interview preparation and mock sessions', 'Industry networking and placement'] },
  { id: 'rm-4', cohort: 'working_professional', title: 'Step-Up: career transition', audience: 'Working professionals', duration: '10 weeks', status: 'Published', milestones: ['Benchmark current role and market value', 'Define transition goal and constraints', 'Executive narrative and resume redesign', 'Leadership and system design scenarios', 'Networking, interviews and negotiation'] },
];

const isoInDays = (n: number) => new Date(Date.now() + n * DAY_MS).toISOString().slice(0, 10);

const DEFAULT_SESSIONS: SessionItem[] = [
  { id: 'sess-1', date: isoInDays(1), time: '16:00', studentName: 'Darshani Prachi', topic: 'Mock technical and HR interview', mentor: 'Sneha Sen', mode: 'Video call', status: 'Upcoming' },
  { id: 'sess-2', date: isoInDays(2), time: '18:30', studentName: 'Rohan Verma', topic: 'Career transition strategy', mentor: 'Amitav Ghosh', mode: 'Video call', status: 'Upcoming' },
  { id: 'sess-3', date: isoInDays(3), time: '17:00', studentName: 'Aarav Sharma', topic: 'Entrance exam strategy', mentor: 'Dr. Priya Nair', mode: 'Phone', status: 'Upcoming' },
];

const PROFESSION_LABEL: Record<UserProfession, string> = {
  school: 'School Student',
  college: 'College Student',
  fresher: 'Fresher / PSW',
  working_professional: 'Working Professional',
};

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite, currentUserProfile, onStudentLogout, onAdminAuthenticated }) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [session, setSession] = useState<AdminSession | null>(null);
  const [greeting, setGreeting] = useState('Good evening');

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Shell
  const [activeTab, setActiveTab] = usePersistentState<AdminTab>('maxicareer_admin_tab', 'dashboard');
  const [collapsed, setCollapsed] = usePersistentState<boolean>('maxicareer_admin_sidebar_collapsed', false);
  const [mobileNav, setMobileNav] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [jump, setJump] = useState('');
  const [jumpOpen, setJumpOpen] = useState(false);
  const [toasts, setToasts] = useState<{ id: string; message: string; tone: 'default' | 'error' }[]>([]);

  // Data
  const [students, setStudents] = useState<DbStudent[]>([]);
  const [stats, setStats] = useState<MongoStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [notifications, setNotifications] = usePersistentState<AppNotification[]>('maxicareer_notifications', []);
  const [dismissedAuto, setDismissedAuto] = usePersistentState<string[]>('maxicareer_notifications_seen', []);
  const [auditEntries, setAuditEntries] = usePersistentState<AuditEntry[]>('maxicareer_audit_logs', []);
  const [applications, setApplications] = usePersistentState<Application[]>('maxicareer_applications', []);
  const [templates, setTemplates] = usePersistentState<RoadmapTemplate[]>('maxicareer_roadmap_templates', DEFAULT_TEMPLATES);
  const [studentRoadmaps, setStudentRoadmaps] = usePersistentState<Record<string, StudentRoadmap>>('maxicareer_student_roadmaps', {});
  const [approvals, setApprovals] = usePersistentState<ApprovalItem[]>('maxicareer_approvals', []);
  const [sessions, setSessions] = usePersistentState<SessionItem[]>('maxicareer_sessions', DEFAULT_SESSIONS);

  const [roadmapFocus, setRoadmapFocus] = useState<string | null>(null);
  const [studentPrefilter, setStudentPrefilter] = useState<{ cohort?: string; status?: string } | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', email: '', phone: '+91 ', city: '', profession: 'college' as UserProfession, institutionOrCompany: '', planName: 'Step-Next career program', planPrice: 15999, mentorAssigned: 'Unassigned', detail: '' });

  const sessionRef = useRef<AdminSession | null>(null);
  sessionRef.current = session;

  /* ---------------- helpers ---------------- */

  const toast = useCallback((message: string, tone: 'default' | 'error' = 'default') => {
    const id = uid('t');
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4200);
  }, []);

  const addAudit = useCallback(
    (module: string, action: string, target: string) => {
      const entry: AuditEntry = { id: uid('log'), at: new Date().toISOString(), actor: sessionRef.current?.email || 'admin@maxicareer.com', module, action, target };
      setAuditEntries((prev) => [entry, ...prev].slice(0, 5000));
    },
    [setAuditEntries]
  );

  const notify = useCallback<AdminContextValue['notify']>(
    (n) => {
      const prefs = readStore<NotificationPrefs>('maxicareer_notification_prefs', DEFAULT_PREFS);
      if (prefs.categories?.[n.category]?.inApp === false) return;
      setNotifications((prev) => [{ id: n.id || uid('n'), title: n.title, body: n.body, category: n.category, link: n.link, priority: n.priority || 'normal', read: false, createdAt: new Date().toISOString() }, ...prev].slice(0, 300));
    },
    [setNotifications]
  );

  const go = useCallback(
    (tab: AdminTab) => {
      setActiveTab(tab);
      setMobileNav(false);
      setBellOpen(false);
      setUserMenu(false);
      if (typeof window !== 'undefined') window.scrollTo({ top: 0 });
    },
    [setActiveTab]
  );

  /* ---------------- students API ---------------- */

  const refreshStudents = useCallback(async (showIndicator = false) => {
    if (showIndicator) setIsRefreshing(true);
    setLoadError(null);
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.data || []);
        if (data.stats) setStats(data.stats);
      } else setLoadError(data.message || 'The server returned an error');
    } catch (err: any) {
      setLoadError(err?.message || 'Network error');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  const patchStudent = useCallback(async (id: string, patch: Partial<DbStudent>) => {
    setStudents((prev) => prev.map((s) => (s._id === id ? { ...s, ...patch } : s)));
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      const data = await res.json();
      if (data.success && data.data) setStudents((prev) => prev.map((s) => (s._id === id ? data.data : s)));
      if (data.stats) setStats(data.stats);
    } catch {
      toast("Couldn't save that change. Check your connection and try again.", 'error');
    }
  }, [toast]);

  const deleteStudent = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/students/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setStudents((prev) => prev.filter((s) => s._id !== id));
        if (data.stats) setStats(data.stats);
        setSelectedStudentId((cur) => (cur === id ? null : cur));
      }
    } catch {
      toast("Couldn't delete the student.", 'error');
    }
  }, [toast]);

  const createStudent = useCallback(async (body: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/students', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await res.json();
      if (data.success && data.data) {
        setStudents((prev) => [data.data, ...prev]);
        if (data.stats) setStats(data.stats);
        return data.data as DbStudent;
      }
    } catch {}
    return null;
  }, []);

  /* ---------------- mount ---------------- */

  useEffect(() => {
    setHasMounted(true);
    try {
      const stored = localStorage.getItem('maxicareer_admin_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.role === 'admin' && parsed.email) setSession(parsed);
      }
      // carry over audit entries saved by the previous version (no module field)
      const legacy = readStore<any[]>('maxicareer_audit_logs', []);
      if (legacy.some((e) => !e.module)) setAuditEntries(legacy.map((e) => ({ module: 'General', ...e })));
    } catch {}
    const h = new Date().getHours();
    setGreeting(h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening');
    refreshStudents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---------------- automatic notifications ---------------- */
  useEffect(() => {
    if (!session || isLoading) return;
    const seen = new Set(dismissedAuto);
    const fresh: AppNotification[] = [];
    const now = Date.now();
    const push = (id: string, n: Omit<AppNotification, 'id' | 'read'>) => {
      if (seen.has(id) || notifications.some((x) => x.id === id)) return;
      seen.add(id);
      fresh.push({ ...n, id, read: false });
    };
    students.forEach((s) => {
      const age = now - new Date(s.createdAt).getTime();
      if (age < 7 * DAY_MS) push(`auto-reg-${s._id}`, { title: `New registration: ${s.name}`, body: `${COHORT_LABEL[s.profession] || s.professionLabel} · ${s.planName.split('(')[0].trim()}`, category: 'students', priority: 'normal', createdAt: s.createdAt, link: 'students' });
    });
    sessions.forEach((s) => {
      const d = Math.round((new Date(s.date).getTime() - now) / DAY_MS);
      if (s.status === 'Upcoming' && d >= -1 && d <= 1) push(`auto-sess-${s.id}`, { title: `Session soon: ${s.studentName}`, body: `${s.topic}, ${formatDate(s.date)} at ${s.time} with ${s.mentor}`, category: 'sessions', priority: 'normal', createdAt: new Date().toISOString(), link: 'sessions' });
    });
    applications.forEach((a) => {
      if (!a.deadline || ['Offer', 'Rejected', 'Withdrawn'].includes(a.stage)) return;
      const d = Math.round((new Date(a.deadline).getTime() - now) / DAY_MS);
      if (d >= 0 && d <= 3) push(`auto-dl-${a.id}-${a.deadline}`, { title: `Deadline in ${d === 0 ? 'under a day' : `${d} day${d > 1 ? 's' : ''}`}`, body: `${a.studentName} → ${a.organisation}`, category: 'applications', priority: 'high', createdAt: new Date().toISOString(), link: 'applications' });
    });
    if (fresh.length) {
      const prefs = readStore<NotificationPrefs>('maxicareer_notification_prefs', DEFAULT_PREFS);
      setNotifications((prev) => [...fresh.filter((n) => prefs.categories?.[n.category]?.inApp !== false), ...prev].slice(0, 300));
      setDismissedAuto(Array.from(seen).slice(-1000));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isLoading, students, sessions, applications]);

  /* ---------------- auth ---------------- */

  const startSession = (email: string, name: string) => {
    const s: AdminSession = { email, name, role: 'admin', loggedInAt: Date.now() };
    setSession(s);
    try {
      localStorage.setItem('maxicareer_admin_session', JSON.stringify(s));
    } catch {}
    sessionRef.current = s;
    addAudit('Access', 'Signed in', email);
    onAdminAuthenticated?.(s);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    const email = loginEmail.trim().toLowerCase();
    const pass = loginPassword.trim();
    if (!email) return setLoginError('Enter your work email.');
    if (!pass) return setLoginError('Enter your password.');
    const known: Record<string, { pass: string; name: string }> = {
      'admin@maxicareer.com': { pass: 'admin123', name: 'Admin' },
      'mentor@maxicareer.com': { pass: 'mentor123', name: 'Lead Mentor' },
      'director@maxicareer.com': { pass: 'admin123', name: 'Program Director' },
    };
    const match = known[email];
    if (match) {
      if (pass !== match.pass) return setLoginError('That password is incorrect. Demo accounts use admin123 or mentor123.');
      return startSession(email, match.name);
    }
    const staff = readStore<{ email: string; name: string; tempPassword: string; active?: boolean }[]>('maxicareer_managed_users', []).find((u) => u.email === email);
    if (staff && staff.active !== false && staff.tempPassword === pass) return startSession(email, staff.name);
    if (email.endsWith('@maxicareer.com')) return startSession(email, email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()));
    setLoginError('Only Maxicareer staff accounts can sign in here.');
  };

  const handleLogout = () => {
    addAudit('Access', 'Signed out', session?.email || '');
    setSession(null);
    try {
      localStorage.removeItem('maxicareer_admin_session');
    } catch {}
  };

  /* ---------------- derived ---------------- */

  const unread = notifications.filter((n) => !n.read).length;
  const selectedStudent = students.find((s) => s._id === selectedStudentId) || null;

  const jumpResults = useMemo(() => {
    const q = jump.trim().toLowerCase();
    if (!q) return { pages: ALL_TABS.slice(0, 6), people: [] as DbStudent[] };
    return {
      pages: ALL_TABS.filter((t) => t.label.toLowerCase().includes(q) || tabGroup(t.id).toLowerCase().includes(q)).slice(0, 6),
      people: students.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)).slice(0, 5),
    };
  }, [jump, students]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.getElementById('mc-jump')?.focus();
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  /* ================================================================== */
  /* Render: loading                                                     */
  /* ================================================================== */

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[#0D1B3E] flex items-center justify-center">
        <div className="flex items-end gap-1 h-8" aria-label="Loading">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="w-2.5 rounded-sm bg-[#38BDF8] animate-pulse" style={{ height: `${(i + 1) * 25}%`, animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  /* ================================================================== */
  /* Render: login                                                       */
  /* ================================================================== */

  if (!session) {
    return (
      <div className="mc-admin min-h-screen bg-[#0D1B3E] text-white grid lg:grid-cols-[1.1fr_1fr]">
        <aside className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden">
          <div className="mc-grid-dark absolute inset-0 opacity-70" aria-hidden />
          <div className="relative">
            <BrandLogo variant="dark" className="h-9 w-auto" />
          </div>
          <div className="relative">
            <div className="flex items-end gap-3 h-[220px] mb-10" aria-hidden>
              {['Step-Ready', 'Step-Next', 'Step-In', 'Step-Up'].map((s, i) => (
                <div key={s} className="flex-1 flex flex-col justify-end h-full">
                  <span className="text-[13px] text-[#AFC0E3] mb-2">{s}</span>
                  <div className="rounded-t-[10px] bg-[#1A2C5C] border-t-[3px] border-[#38BDF8]" style={{ height: `${30 + i * 22}%` }} />
                </div>
              ))}
            </div>
            <h1 className="mc-display text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] max-w-md">Every learner's next step, in one place.</h1>
            <p className="mt-4 text-[15px] text-[#AFC0E3] max-w-md leading-relaxed">Students, roadmaps, applications and the website, run by the Maxicareer team.</p>
          </div>
          <button type="button" onClick={onBackToSite} className="relative self-start text-[13.5px] text-[#AFC0E3] hover:text-white">
            ← Back to maxicareer.com
          </button>
        </aside>

        <main className="bg-[#F3F6FB] text-[#0D1B3E] flex flex-col justify-center px-5 py-10 sm:px-12">
          <div className="w-full max-w-[400px] mx-auto">
            <div className="lg:hidden mb-8 flex items-center justify-between">
              <BrandLogo className="h-8 w-auto" />
              <button type="button" onClick={onBackToSite} className="text-[13px] text-[#5B6885]">
                ← Website
              </button>
            </div>
            <h2 className="mc-display text-[30px] font-semibold tracking-[-0.02em]">Sign in</h2>
            <p className="text-[14px] text-[#5B6885] mt-1.5">Use your Maxicareer staff account.</p>

            {currentUserProfile && (
              <div className="mt-6 rounded-[12px] border border-[#F4D49B] bg-[#FDF1DC] p-4 text-[13.5px] text-[#6B4100]">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4" /> You're signed in as a student
                </div>
                <p className="mt-1">
                  {currentUserProfile.name} ({currentUserProfile.email}) can't open the admin portal. Sign out first, then use a staff account.
                </p>
                {onStudentLogout && (
                  <Button size="sm" variant="dark" className="mt-3" onClick={onStudentLogout}>
                    Sign out student
                  </Button>
                )}
              </div>
            )}

            <form onSubmit={handleLogin} className="mt-7 space-y-4">
              {loginError && (
                <div className="flex items-start gap-2 rounded-[10px] bg-[#FCEBEC] px-3.5 py-3 text-[13.5px] text-[#B42F3B]" role="alert">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  {loginError}
                </div>
              )}
              <Field label="Work email">
                <Input type="email" autoComplete="username" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="you@maxicareer.com" className="h-11" />
              </Field>
              <Field label="Password">
                <div className="relative">
                  <Input type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7A869E] hover:text-[#0D1B3E]" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </Field>
              <Button type="submit" variant="primary" className="w-full h-11">
                Sign in
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[#DDE4EF]">
              <p className="text-[13px] text-[#5B6885] mb-2.5">Demo accounts</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['admin@maxicareer.com', 'Admin'],
                  ['mentor@maxicareer.com', 'Lead Mentor'],
                ].map(([email, name]) => (
                  <button key={email} type="button" onClick={() => startSession(email, name)} className="text-left rounded-[11px] border border-[#D3DBE8] bg-white px-3 py-2.5 hover:border-[#2563EB] group">
                    <div className="text-[13.5px] font-semibold flex items-center justify-between">
                      {name} <ArrowRight className="w-3.5 h-3.5 text-[#8C97AE] group-hover:text-[#2563EB]" />
                    </div>
                    <div className="text-[12px] text-[#7A869E] truncate">{email}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ================================================================== */
  /* Render: workspace                                                   */
  /* ================================================================== */

  const ctx: AdminContextValue = {
    session,
    go,
    toast,
    addAudit,
    notify,
    students,
    stats,
    isLoading,
    isRefreshing,
    loadError,
    refreshStudents,
    patchStudent,
    deleteStudent,
    createStudent,
    openStudent: (s) => setSelectedStudentId(s._id),
    notifications,
    setNotifications,
    auditEntries,
    setAuditEntries,
    applications,
    setApplications,
    templates,
    setTemplates,
    studentRoadmaps,
    setStudentRoadmaps,
    approvals,
    setApprovals,
    sessions,
    setSessions,
    roadmapFocus,
    setRoadmapFocus,
    studentPrefilter,
    setStudentPrefilter,
    openAddStudent: () => setAddOpen(true),
  };

  const badgeFor = (id: AdminTab): React.ReactNode => {
    if (id === 'notifications' && unread) return <span className="mc-num rounded-full bg-[#F2A93B] text-[#0D1B3E] text-[11px] font-semibold px-1.5 min-w-[20px] text-center">{unread > 99 ? '99+' : unread}</span>;
    if (id === 'students') return <span className="mc-num text-[11.5px] text-[#8FA3CC]">{students.length}</span>;
    if (id === 'approvals') {
      const n = approvals.filter((a) => a.status === 'Pending').length;
      return n ? <span className="mc-num rounded-full bg-[#F2A93B] text-[#0D1B3E] text-[11px] font-semibold px-1.5 min-w-[20px] text-center">{n}</span> : null;
    }
    if (id === 'applications') {
      const n = applications.filter((a) => !['Offer', 'Rejected', 'Withdrawn'].includes(a.stage)).length;
      return n ? <span className="mc-num text-[11.5px] text-[#8FA3CC]">{n}</span> : null;
    }
    return null;
  };

  const sidebar = (isMobile: boolean) => {
    const narrow = collapsed && !isMobile;
    return (
      <div className="flex h-full flex-col">
        <div className={cx('h-16 flex items-center shrink-0 border-b border-white/[0.07]', narrow ? 'justify-center px-2' : 'justify-between px-5')}>
          {!narrow && (
            <button type="button" onClick={() => go('dashboard')} aria-label="Dashboard">
              <BrandLogo variant="dark" className="h-7 w-auto" />
            </button>
          )}
          {isMobile ? (
            <button type="button" onClick={() => setMobileNav(false)} className="p-2 rounded-[8px] text-[#AFC0E3] hover:bg-white/10" aria-label="Close menu">
              <X className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={() => setCollapsed(!collapsed)} className="p-2 rounded-[8px] text-[#8FA3CC] hover:text-white hover:bg-white/10" aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
        </div>
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5 mc-scroll-dark" aria-label="Admin">
          {NAV_GROUPS.map((g) => (
            <div key={g.label}>
              {!narrow ? <div className="px-3 mb-1.5 text-[12px] font-medium text-[#7C8FB8]">{g.label}</div> : <div className="mx-3 mb-2 h-px bg-white/[0.08]" />}
              <ul className="space-y-0.5">
                {g.items.map((it) => {
                  const Icon = it.icon;
                  const active = activeTab === it.id;
                  return (
                    <li key={it.id}>
                      <button
                        type="button"
                        onClick={() => go(it.id)}
                        title={narrow ? it.label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={cx(
                          'relative w-full flex items-center gap-3 rounded-[9px] text-[13.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38BDF8]',
                          narrow ? 'justify-center h-10' : 'h-9 px-3',
                          active ? 'bg-white/[0.09] text-white font-semibold' : 'text-[#C3D0EA] hover:text-white hover:bg-white/[0.05] font-medium'
                        )}
                      >
                        {active && <span className="absolute left-0 top-2 bottom-2 w-[3px] rounded-r bg-[#38BDF8]" aria-hidden />}
                        <Icon className={cx('w-[17px] h-[17px] shrink-0', active ? 'text-[#38BDF8]' : 'text-[#8FA3CC]')} />
                        {!narrow && <span className="flex-1 text-left truncate">{it.label}</span>}
                        {!narrow && badgeFor(it.id)}
                        {narrow && it.id === 'notifications' && unread > 0 && <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-[#F2A93B]" />}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="shrink-0 border-t border-white/[0.07] p-3 space-y-0.5">
          <button
            type="button"
            onClick={() => go('settings')}
            className={cx('w-full flex items-center gap-3 rounded-[9px] text-[13.5px] font-medium', narrow ? 'justify-center h-10' : 'h-9 px-3', activeTab === 'settings' ? 'bg-white/[0.09] text-white' : 'text-[#C3D0EA] hover:text-white hover:bg-white/[0.05]')}
          >
            <SETTINGS_ITEM.icon className="w-[17px] h-[17px] text-[#8FA3CC]" />
            {!narrow && 'Settings'}
          </button>
          <button type="button" onClick={handleLogout} className={cx('w-full flex items-center gap-3 rounded-[9px] text-[13.5px] font-medium text-[#C3D0EA] hover:text-white hover:bg-white/[0.05]', narrow ? 'justify-center h-10' : 'h-9 px-3')}>
            <LogOut className="w-[17px] h-[17px] text-[#8FA3CC]" />
            {!narrow && 'Sign out'}
          </button>
        </div>
      </div>
    );
  };

  const page = (() => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard greeting={greeting} />;
      case 'notifications':
        return <Notifications />;
      case 'students':
        return <Students />;
      case 'counsellors':
        return <Counsellors />;
      case 'users':
        return <UserManagement />;
      case 'programs':
        return <Programs />;
      case 'services':
        return <Services />;
      case 'roadmaps':
        return <Roadmaps />;
      case 'sessions':
        return <Sessions />;
      case 'applications':
        return <Applications />;
      case 'reports':
        return <Reports />;
      case 'approvals':
        return <Approvals />;
      case 'audit':
        return <AuditLog />;
      case 'access':
        return <PageAccess />;
      case 'settings':
        return <SettingsPage onLogout={handleLogout} onBackToSite={onBackToSite} />;
      default:
        if (activeTab.startsWith('web-')) return <Website key={activeTab} tab={activeTab} />;
        return <Dashboard greeting={greeting} />;
    }
  })();

  const latest = [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 6);
  const studentRoadmap = selectedStudent ? studentRoadmaps[selectedStudent._id] : undefined;
  const studentApps = selectedStudent ? applications.filter((a) => a.studentId === selectedStudent._id || a.studentEmail.toLowerCase() === selectedStudent.email.toLowerCase()) : [];

  return (
    <AdminContext.Provider value={ctx}>
      <div className="mc-admin min-h-screen bg-[#F3F6FB] text-[#0D1B3E] flex">
        {/* Desktop sidebar */}
        <aside className={cx('hidden lg:block shrink-0 bg-[#0D1B3E] sticky top-0 h-screen transition-[width] duration-200 z-30', collapsed ? 'w-[72px]' : 'w-[248px]')}>{sidebar(false)}</aside>

        {/* Mobile sidebar */}
        <AnimatePresence>
          {mobileNav && (
            <div className="lg:hidden fixed inset-0 z-[60]">
              <motion.div className="absolute inset-0 bg-[#0D1B3E]/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileNav(false)} />
              <motion.aside className="absolute left-0 top-0 h-full w-[272px] bg-[#0D1B3E]" initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: 'tween', duration: 0.2 }}>
                {sidebar(true)}
              </motion.aside>
            </div>
          )}
        </AnimatePresence>

        <div className="flex-1 min-w-0 flex flex-col">
          {/* Top bar */}
          <header className="sticky top-0 z-40 h-16 bg-[#F3F6FB]/90 backdrop-blur-md border-b border-[#DDE4EF] flex items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button type="button" onClick={() => setMobileNav(true)} className="lg:hidden p-2 -ml-2 rounded-[8px] text-[#26355A] hover:bg-[#E9EEF5]" aria-label="Open menu">
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-[13.5px] min-w-0">
              <span className="text-[#7A869E]">{tabGroup(activeTab)}</span>
              <span className="text-[#B7C3D7]">/</span>
              <span className="font-semibold text-[#0D1B3E] truncate">{tabLabel(activeTab)}</span>
            </div>

            {/* Jump to */}
            <div className="relative ml-auto w-full max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C97AE]" />
              <input
                id="mc-jump"
                value={jump}
                onChange={(e) => setJump(e.target.value)}
                onFocus={() => setJumpOpen(true)}
                onBlur={() => setTimeout(() => setJumpOpen(false), 150)}
                placeholder="Jump to a page or student"
                className="w-full h-9 rounded-[10px] border border-[#D3DBE8] bg-white pl-9 pr-12 text-[13.5px] focus:outline-none focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/15"
                aria-label="Jump to a page or student"
              />
              <kbd className="hidden md:block absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#8C97AE] border border-[#DDE4EF] rounded px-1.5">Ctrl K</kbd>
              {jumpOpen && (
                <div className="absolute left-0 right-0 mt-2 rounded-[14px] border border-[#DDE4EF] bg-white shadow-[0_12px_32px_-12px_rgba(13,27,62,0.25)] py-2 z-50">
                  {jumpResults.pages.length > 0 && <div className="px-3 pb-1 text-[12px] text-[#7A869E]">Pages</div>}
                  {jumpResults.pages.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button key={p.id} type="button" onMouseDown={() => { go(p.id); setJump(''); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13.5px] hover:bg-[#F3F6FB]">
                        <Icon className="w-4 h-4 text-[#7A869E]" /> {p.label}
                        <span className="ml-auto text-[12px] text-[#8C97AE]">{tabGroup(p.id)}</span>
                      </button>
                    );
                  })}
                  {jumpResults.people.length > 0 && <div className="px-3 pt-2 pb-1 text-[12px] text-[#7A869E] border-t border-[#EAEFF6] mt-1">Students</div>}
                  {jumpResults.people.map((s) => (
                    <button key={s._id} type="button" onMouseDown={() => { setSelectedStudentId(s._id); setJump(''); }} className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-[13.5px] hover:bg-[#F3F6FB]">
                      <Avatar name={s.name} size={22} /> <span className="truncate">{s.name}</span>
                      <span className="ml-auto text-[12px] text-[#8C97AE] truncate max-w-[120px]">{s.email}</span>
                    </button>
                  ))}
                  {!jumpResults.pages.length && !jumpResults.people.length && <div className="px-3 py-3 text-[13px] text-[#5B6885]">No matches for "{jump}"</div>}
                </div>
              )}
            </div>

            {/* Bell */}
            <div className="relative">
              <button type="button" onClick={() => { setBellOpen(!bellOpen); setUserMenu(false); }} className="relative h-9 w-9 flex items-center justify-center rounded-[10px] text-[#26355A] hover:bg-[#E9EEF5]" aria-label={`Notifications, ${unread} unread`}>
                <Bell className="w-[18px] h-[18px]" />
                {unread > 0 && <span className="mc-num absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[#F2A93B] text-[#0D1B3E] text-[10.5px] font-bold flex items-center justify-center ring-2 ring-[#F3F6FB]">{unread > 9 ? '9+' : unread}</span>}
              </button>
              {bellOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setBellOpen(false)} />
                  <div className="absolute right-0 mt-2 w-[360px] max-w-[calc(100vw-2rem)] rounded-[16px] border border-[#DDE4EF] bg-white shadow-[0_16px_40px_-16px_rgba(13,27,62,0.3)] z-50 overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#EAEFF6]">
                      <span className="mc-display text-[15px] font-semibold">Notifications</span>
                      {unread > 0 && (
                        <button type="button" className="text-[12.5px] font-semibold text-[#2563EB] inline-flex items-center gap-1" onClick={() => setNotifications((p) => p.map((n) => ({ ...n, read: true })))}>
                          <Check className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>
                    <ul className="max-h-[360px] overflow-y-auto divide-y divide-[#EAEFF6]">
                      {latest.length === 0 && <li className="px-4 py-8 text-center text-[13px] text-[#5B6885]">Nothing new.</li>}
                      {latest.map((n) => {
                        const meta = CATEGORY_META[n.category];
                        const Icon = meta.icon;
                        return (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => {
                                setNotifications((p) => p.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
                                go(n.link || 'notifications');
                              }}
                              className={cx('w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-[#F7F9FC]', !n.read && 'bg-[#FFFBF3]')}
                            >
                              <span className={cx('h-8 w-8 shrink-0 rounded-[9px] flex items-center justify-center', meta.cls)}>
                                <Icon className="w-4 h-4" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className={cx('block text-[13.5px] truncate', n.read ? 'font-medium' : 'font-semibold')}>{n.title}</span>
                                <span className="block text-[12px] text-[#7A869E]">{timeAgo(n.createdAt)}</span>
                              </span>
                              {!n.read && <span className="mt-2 h-2 w-2 rounded-full bg-[#F2A93B] shrink-0" />}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                    <button type="button" onClick={() => go('notifications')} className="w-full px-4 py-3 text-[13px] font-semibold text-[#2563EB] border-t border-[#EAEFF6] hover:bg-[#F7F9FC]">
                      Open notifications
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* User */}
            <div className="relative">
              <button type="button" onClick={() => { setUserMenu(!userMenu); setBellOpen(false); }} className="flex items-center gap-2 rounded-[10px] p-1 pr-2 hover:bg-[#E9EEF5]" aria-label="Account menu">
                <Avatar name={session.name} size={30} tone="blue" />
                <span className="hidden md:block text-left">
                  <span className="block text-[13px] font-semibold leading-tight">{session.name}</span>
                  <span className="block text-[11.5px] text-[#7A869E] leading-tight">Administrator</span>
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#8C97AE]" />
              </button>
              {userMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenu(false)} />
                  <div className="absolute right-0 mt-2 w-60 rounded-[14px] border border-[#DDE4EF] bg-white shadow-[0_16px_40px_-16px_rgba(13,27,62,0.3)] p-1.5 z-50">
                    <div className="px-3 py-2.5 border-b border-[#EAEFF6] mb-1">
                      <div className="text-[13.5px] font-semibold">{session.name}</div>
                      <div className="text-[12px] text-[#7A869E] truncate">{session.email}</div>
                    </div>
                    <button type="button" onClick={() => { setUserMenu(false); onBackToSite(); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13.5px] hover:bg-[#F3F6FB]">
                      <ExternalLink className="w-4 h-4 text-[#7A869E]" /> View website
                    </button>
                    <button type="button" onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-[8px] text-[13.5px] text-[#B42F3B] hover:bg-[#FCEBEC]">
                      <LogOut className="w-4 h-4" /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          <main className="mc-canvas flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="max-w-[1320px] mx-auto">{page}</div>
          </main>
        </div>

        {/* Student drawer */}
        <Drawer
          open={!!selectedStudent}
          onClose={() => setSelectedStudentId(null)}
          title={selectedStudent?.name}
          subtitle={selectedStudent && <span className="mc-num">{selectedStudent.email}</span>}
          footer={
            selectedStudent && (
              <>
                <a href={`https://wa.me/${selectedStudent.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#0F9F6E] px-4 text-[13.5px] font-semibold text-white hover:bg-[#0B8A5F]">
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
                <a href={`mailto:${selectedStudent.email}`} className="inline-flex h-10 items-center gap-1.5 rounded-[10px] bg-[#2563EB] px-4 text-[13.5px] font-semibold text-white hover:bg-[#1D4FD7]">
                  <Mail className="w-4 h-4" /> Email
                </a>
              </>
            )
          }
        >
          {selectedStudent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <Select
                    value={selectedStudent.status}
                    onChange={(e) => {
                      patchStudent(selectedStudent._id, { status: e.target.value as DbStudent['status'] });
                      addAudit('Students', 'Changed status', `${selectedStudent.name} → ${STATUS_LABEL[e.target.value as DbStudent['status']]}`);
                    }}
                  >
                    {Object.entries(STATUS_LABEL).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </Select>
                </Field>
                <Field label="Mentor">
                  <Select
                    value={selectedStudent.mentorAssigned || 'Unassigned'}
                    onChange={(e) => {
                      patchStudent(selectedStudent._id, { mentorAssigned: e.target.value });
                      addAudit('Students', 'Assigned mentor', `${selectedStudent.name} → ${e.target.value}`);
                    }}
                  >
                    <option>Unassigned</option>
                    {MENTORS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-[13.5px]">
                {[
                  ['Phone', selectedStudent.phone || '—'],
                  ['City', selectedStudent.city || '—'],
                  ['Cohort', COHORT_LABEL[selectedStudent.profession] || selectedStudent.professionLabel],
                  ['Institution', selectedStudent.institutionOrCompany || '—'],
                  ['Program', selectedStudent.planName],
                  ['Fee', inr(selectedStudent.planPrice)],
                  ['Registered', formatDate(selectedStudent.createdAt)],
                  ['Source', selectedStudent.source.replace(/_/g, ' ')],
                ].map(([k, v]) => (
                  <div key={k}>
                    <dt className="text-[12.5px] text-[#7A869E]">{k}</dt>
                    <dd className="font-medium text-[#0D1B3E] break-words">{v}</dd>
                  </div>
                ))}
              </dl>

              {selectedStudent.detail && (
                <div>
                  <div className="text-[12.5px] text-[#7A869E] mb-1">Goals and background</div>
                  <p className="text-[13.5px] text-[#26355A] leading-relaxed">{selectedStudent.detail}</p>
                </div>
              )}

              <section className="rounded-[14px] border border-[#DDE4EF] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Route className="w-4 h-4 text-[#2563EB]" />
                    <span className="mc-display text-[15px] font-semibold">Roadmap</span>
                  </div>
                  <Button size="sm" onClick={() => { setRoadmapFocus(selectedStudent._id); setSelectedStudentId(null); go('roadmaps'); }}>
                    {studentRoadmap ? 'Edit roadmap' : 'Create roadmap'}
                  </Button>
                </div>
                {studentRoadmap ? (
                  <>
                    <div className="mt-3 flex items-end gap-3">
                      <StepMeter value={roadmapProgress(studentRoadmap)} steps={8} height={26} width={120} />
                      <span className="mc-display mc-num text-[22px] font-semibold leading-none">{roadmapProgress(studentRoadmap)}%</span>
                    </div>
                    <ul className="mt-3 space-y-1 text-[13px]">
                      {studentRoadmap.milestones.slice(0, 5).map((m) => (
                        <li key={m.id} className="flex items-center gap-2">
                          <span className={cx('h-2 w-2 rounded-full', m.status === 'done' ? 'bg-[#0F9F6E]' : m.status === 'doing' ? 'bg-[#2563EB]' : m.status === 'blocked' ? 'bg-[#D93F4C]' : 'bg-[#CBD4E2]')} />
                          <span className={m.status === 'done' ? 'text-[#7A869E] line-through' : 'text-[#26355A]'}>{m.title}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="mt-2 text-[13px] text-[#5B6885]">No personal roadmap yet.</p>
                )}
              </section>

              <section className="rounded-[14px] border border-[#DDE4EF] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <FileStack className="w-4 h-4 text-[#6D4AE0]" />
                    <span className="mc-display text-[15px] font-semibold">Applications</span>
                  </div>
                  <Button size="sm" onClick={() => { setSelectedStudentId(null); go('applications'); }}>
                    Open applications
                  </Button>
                </div>
                {studentApps.length ? (
                  <ul className="mt-3 space-y-2">
                    {studentApps.map((a) => (
                      <li key={a.id} className="flex items-center justify-between gap-2 text-[13px]">
                        <span className="truncate">
                          {a.organisation} <span className="text-[#7A869E]">· {a.role || a.type}</span>
                        </span>
                        <Badge tone={STAGE_TONE[a.stage]}>{a.stage}</Badge>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13px] text-[#5B6885]">None tracked yet.</p>
                )}
              </section>

              <Field label="Counsellor notes" hint="Saved when you click outside the box.">
                <Textarea
                  key={selectedStudent._id}
                  rows={4}
                  defaultValue={selectedStudent.notes}
                  onBlur={(e) => {
                    if (e.target.value !== selectedStudent.notes) {
                      patchStudent(selectedStudent._id, { notes: e.target.value });
                      addAudit('Students', 'Updated notes', selectedStudent.name);
                    }
                  }}
                  placeholder="Call summary, next steps, target universities, interview dates…"
                />
              </Field>
              <div className="flex items-center gap-2">
                <Badge tone={STATUS_TONE[selectedStudent.status]} dot>
                  {STATUS_LABEL[selectedStudent.status]}
                </Badge>
                <span className="mc-num text-[12px] text-[#8C97AE] truncate">ID {selectedStudent._id}</span>
              </div>
            </div>
          )}
        </Drawer>

        {/* Add student */}
        <Modal
          open={addOpen}
          onClose={() => setAddOpen(false)}
          title="Add student"
          description="For walk-ins, phone enquiries and referrals."
          width="max-w-xl"
          footer={
            <>
              <Button onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button
                variant="primary"
                disabled={!newStudent.name.trim() || !newStudent.email.trim()}
                onClick={async () => {
                  const created = await createStudent({ ...newStudent, professionLabel: PROFESSION_LABEL[newStudent.profession], source: 'admin_manual', notes: 'Added from the admin portal.' });
                  if (created) {
                    addAudit('Students', 'Added student', created.email);
                    toast(`${created.name} added.`);
                    setAddOpen(false);
                    setNewStudent({ ...newStudent, name: '', email: '', phone: '+91 ', city: '', institutionOrCompany: '', detail: '' });
                  } else toast("Couldn't add the student. Check the email and try again.", 'error');
                }}
              >
                Add student
              </Button>
            </>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Full name" className="sm:col-span-2">
              <Input value={newStudent.name} onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })} placeholder="Varun Chawla" />
            </Field>
            <Field label="Email">
              <Input type="email" value={newStudent.email} onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })} />
            </Field>
            <Field label="Phone / WhatsApp">
              <Input value={newStudent.phone} onChange={(e) => setNewStudent({ ...newStudent, phone: e.target.value })} />
            </Field>
            <Field label="City">
              <Input value={newStudent.city} onChange={(e) => setNewStudent({ ...newStudent, city: e.target.value })} />
            </Field>
            <Field label="Cohort">
              <Select
                value={newStudent.profession}
                onChange={(e) => {
                  const p = e.target.value as UserProfession;
                  const plan = { school: ['Step-Ready career program', 13999], college: ['Step-Next career program', 15999], fresher: ['Step-In career program', 15999], working_professional: ['Step-Up career program', 19999] }[p] as [string, number];
                  setNewStudent({ ...newStudent, profession: p, planName: plan[0], planPrice: plan[1] });
                }}
              >
                {Object.entries(COHORT_LABEL).map(([k, l]) => (
                  <option key={k} value={k}>
                    {l}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="School, college or company" className="sm:col-span-2">
              <Input value={newStudent.institutionOrCompany} onChange={(e) => setNewStudent({ ...newStudent, institutionOrCompany: e.target.value })} />
            </Field>
            <Field label="Program">
              <Input value={newStudent.planName} onChange={(e) => setNewStudent({ ...newStudent, planName: e.target.value })} />
            </Field>
            <Field label="Fee (₹)">
              <Input type="number" value={newStudent.planPrice} onChange={(e) => setNewStudent({ ...newStudent, planPrice: Number(e.target.value) || 0 })} />
            </Field>
            <Field label="Mentor">
              <Select value={newStudent.mentorAssigned} onChange={(e) => setNewStudent({ ...newStudent, mentorAssigned: e.target.value })}>
                <option>Unassigned</option>
                {MENTORS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="Goal" className="sm:col-span-2">
              <Textarea rows={2} value={newStudent.detail} onChange={(e) => setNewStudent({ ...newStudent, detail: e.target.value })} placeholder="What do they want help with?" />
            </Field>
          </div>
        </Modal>

        {/* Toasts */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90] flex flex-col items-center gap-2 w-[min(92vw,440px)]" aria-live="polite">
          <AnimatePresence>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className={cx('w-full rounded-[12px] px-4 py-3 text-[13.5px] font-medium shadow-[0_12px_32px_-12px_rgba(13,27,62,0.45)]', t.tone === 'error' ? 'bg-[#B42F3B] text-white' : 'bg-[#0D1B3E] text-white')}
              >
                {t.message}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </AdminContext.Provider>
  );
};
