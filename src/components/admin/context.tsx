import React, { createContext, useContext } from 'react';
import {
  LayoutDashboard,
  Bell,
  Users,
  UserRound,
  UserCog,
  Layers,
  Briefcase,
  CalendarClock,
  Route,
  FileStack,
  BarChart3,
  CheckCircle2,
  History,
  ShieldCheck,
  Home,
  Menu,
  PanelBottom,
  Contact,
  Megaphone,
  Image as ImageIcon,
  Search,
  Share2,
  Settings,
} from 'lucide-react';
import { DbStudent, MongoStats } from '../../types';

export interface AdminSession {
  email: string;
  name: string;
  role: 'admin';
  loggedInAt: number;
}

export type AdminTab =
  | 'dashboard'
  | 'notifications'
  | 'students'
  | 'counsellors'
  | 'users'
  | 'programs'
  | 'services'
  | 'roadmaps'
  | 'sessions'
  | 'applications'
  | 'reports'
  | 'web-home'
  | 'web-nav'
  | 'web-footer'
  | 'web-contact'
  | 'web-cta'
  | 'web-articles'
  | 'web-seo'
  | 'web-social'
  | 'approvals'
  | 'audit'
  | 'access'
  | 'settings';

export interface NavItem {
  id: AdminTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    label: 'People',
    items: [
      { id: 'students', label: 'Students', icon: Users },
      { id: 'counsellors', label: 'Counsellors', icon: UserRound },
      { id: 'users', label: 'User management', icon: UserCog },
    ],
  },
  {
    label: 'Learning',
    items: [
      { id: 'programs', label: 'Programs & plans', icon: Layers },
      { id: 'services', label: 'Services', icon: Briefcase },
      { id: 'roadmaps', label: 'Roadmaps', icon: Route },
    ],
  },
  {
    label: 'Operations',
    items: [
      { id: 'applications', label: 'Applications', icon: FileStack },
      { id: 'sessions', label: 'Sessions', icon: CalendarClock },
      { id: 'reports', label: 'Reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Website',
    items: [
      { id: 'web-home', label: 'Homepage', icon: Home },
      { id: 'web-nav', label: 'Navigation', icon: Menu },
      { id: 'web-footer', label: 'Footer', icon: PanelBottom },
      { id: 'web-contact', label: 'Contact page', icon: Contact },
      { id: 'web-cta', label: 'Calls to action', icon: Megaphone },
      { id: 'web-articles', label: 'Article covers', icon: ImageIcon },
      { id: 'web-seo', label: 'SEO', icon: Search },
      { id: 'web-social', label: 'Social links', icon: Share2 },
    ],
  },
  {
    label: 'Governance',
    items: [
      { id: 'approvals', label: 'Approvals', icon: CheckCircle2 },
      { id: 'audit', label: 'Audit log', icon: History },
      { id: 'access', label: 'Page access', icon: ShieldCheck },
    ],
  },
];

export const SETTINGS_ITEM: NavItem = { id: 'settings', label: 'Settings', icon: Settings };

export const ALL_TABS: NavItem[] = [...NAV_GROUPS.flatMap((g) => g.items), SETTINGS_ITEM];

export const tabLabel = (id: AdminTab) => ALL_TABS.find((t) => t.id === id)?.label || id;
export const tabGroup = (id: AdminTab) => NAV_GROUPS.find((g) => g.items.some((i) => i.id === id))?.label || 'Workspace';

/* ------------------------------------------------------------------ */
/* Domain types                                                        */
/* ------------------------------------------------------------------ */

export interface AuditEntry {
  id: string;
  at: string;
  actor: string;
  module: string;
  action: string;
  target: string;
}

export type NotificationCategory = 'students' | 'applications' | 'sessions' | 'approvals' | 'website' | 'system';

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  priority: 'normal' | 'high';
  read: boolean;
  createdAt: string;
  link?: AdminTab;
}

export type ApplicationStage = 'Draft' | 'Submitted' | 'Shortlisted' | 'Interview' | 'Offer' | 'Rejected' | 'Withdrawn';
export type ApplicationType = 'Job' | 'Internship' | 'University' | 'Scholarship' | 'Visa / PSW';

export interface Application {
  id: string;
  studentId?: string;
  studentName: string;
  studentEmail: string;
  type: ApplicationType;
  organisation: string;
  role: string;
  location: string;
  stage: ApplicationStage;
  appliedOn: string;
  deadline: string;
  owner: string;
  link: string;
  notes: string;
  updatedAt: string;
}

export interface RoadmapTemplate {
  id: string;
  cohort?: string;
  title: string;
  audience: string;
  duration: string;
  milestones: string[];
  status: 'Published' | 'Draft';
}

export type MilestoneStatus = 'todo' | 'doing' | 'done' | 'blocked';

export interface Milestone {
  id: string;
  title: string;
  status: MilestoneStatus;
  due: string;
  note: string;
}

export interface StudentRoadmap {
  studentId: string;
  templateId: string | null;
  goal: string;
  milestones: Milestone[];
  updatedAt: string;
}

export interface ApprovalItem {
  id: string;
  title: string;
  requester: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt?: string;
}

export interface SessionItem {
  id: string;
  date: string; // ISO date
  time: string;
  studentName: string;
  topic: string;
  mentor: string;
  mode: 'Video call' | 'Phone' | 'In person';
  status: 'Upcoming' | 'Completed' | 'Cancelled';
}

export const MENTORS = ['Dr. Priya Nair', 'Sneha Sen', 'Rajesh Kumar', 'Amitav Ghosh'];

export const COUNSELLORS = [
  { id: 'c-1', name: 'Dr. Priya Nair', role: 'Lead academic & study abroad mentor', specialty: 'School and undergraduate stream selection', activeMentees: 14, rating: 4.9, email: 'priya.nair@maxicareer.com', capacity: 20 },
  { id: 'c-2', name: 'Sneha Sen', role: 'Senior campus placement lead', specialty: 'College engineering and data analytics', activeMentees: 19, rating: 5.0, email: 'sneha.sen@maxicareer.com', capacity: 20 },
  { id: 'c-3', name: 'Amitav Ghosh', role: 'Executive transition strategist', specialty: 'Working professionals and product management', activeMentees: 12, rating: 4.9, email: 'amitav.ghosh@maxicareer.com', capacity: 15 },
];

export const COHORT_LABEL: Record<string, string> = {
  school: 'School students',
  college: 'College students',
  fresher: 'Freshers / PSW',
  working_professional: 'Working professionals',
};

/* ------------------------------------------------------------------ */
/* Context                                                             */
/* ------------------------------------------------------------------ */

export interface AdminContextValue {
  session: AdminSession;
  go: (tab: AdminTab) => void;
  toast: (message: string, tone?: 'default' | 'error') => void;
  addAudit: (module: string, action: string, target: string) => void;
  notify: (n: Omit<AppNotification, 'id' | 'read' | 'createdAt' | 'priority'> & { priority?: 'normal' | 'high'; id?: string }) => void;

  students: DbStudent[];
  stats: MongoStats | null;
  isLoading: boolean;
  isRefreshing: boolean;
  loadError: string | null;
  refreshStudents: (showIndicator?: boolean) => Promise<void>;
  patchStudent: (id: string, patch: Partial<DbStudent>) => Promise<void>;
  deleteStudent: (id: string) => Promise<void>;
  createStudent: (data: Record<string, unknown>) => Promise<DbStudent | null>;
  openStudent: (s: DbStudent) => void;

  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  auditEntries: AuditEntry[];
  setAuditEntries: React.Dispatch<React.SetStateAction<AuditEntry[]>>;
  applications: Application[];
  setApplications: React.Dispatch<React.SetStateAction<Application[]>>;
  templates: RoadmapTemplate[];
  setTemplates: React.Dispatch<React.SetStateAction<RoadmapTemplate[]>>;
  studentRoadmaps: Record<string, StudentRoadmap>;
  setStudentRoadmaps: React.Dispatch<React.SetStateAction<Record<string, StudentRoadmap>>>;
  approvals: ApprovalItem[];
  setApprovals: React.Dispatch<React.SetStateAction<ApprovalItem[]>>;
  sessions: SessionItem[];
  setSessions: React.Dispatch<React.SetStateAction<SessionItem[]>>;
  roadmapFocus: string | null;
  setRoadmapFocus: (id: string | null) => void;
  studentPrefilter: { cohort?: string; status?: string } | null;
  setStudentPrefilter: (f: { cohort?: string; status?: string } | null) => void;
  openAddStudent: () => void;
}

export const AdminContext = createContext<AdminContextValue | null>(null);

export function useAdmin() {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminContext');
  return ctx;
}

export function roadmapProgress(r?: StudentRoadmap | null) {
  if (!r || r.milestones.length === 0) return 0;
  const done = r.milestones.filter((m) => m.status === 'done').length;
  const doing = r.milestones.filter((m) => m.status === 'doing').length;
  return Math.round(((done + doing * 0.5) / r.milestones.length) * 100);
}
