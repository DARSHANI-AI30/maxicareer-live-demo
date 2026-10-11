import React, { useMemo, useState } from 'react';
import { Mail, Plus, Pencil, Trash2, KeyRound, Copy, CalendarClock, Download, Briefcase, UserCog, Check, LogOut, ExternalLink, Database } from 'lucide-react';
import { useAdmin, COUNSELLORS, COHORT_LABEL, MENTORS, SessionItem } from '../context';
import { PageHeader, Panel, Button, IconButton, Badge, Input, Textarea, Select, Field, Segmented, Stat, StepMeter, Avatar, Empty, Modal, Th, Td, cx } from '../ui';
import { formatDate, inr, uid, usePersistentState, daysUntil, DAY_MS, downloadCsv } from '../lib';
import { CAREER_PROGRAMS_LIST } from '../../../data/portalData';
import { exportStudents, STATUS_LABEL } from './Students';
import { STAGES, STAGE_TONE } from './Applications';

/* ------------------------------------------------------------------ */
/* Counsellors                                                         */
/* ------------------------------------------------------------------ */

export const Counsellors: React.FC = () => {
  const { students, sessions, go } = useAdmin();
  return (
    <div className="space-y-5">
      <PageHeader title="Counsellors" description="Who's mentoring whom, and how close each counsellor is to a full caseload." />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {COUNSELLORS.map((c) => {
          const mine = students.filter((s) => s.mentorAssigned === c.name);
          const load = Math.round(((c.activeMentees + mine.length) / c.capacity) * 100);
          const upcoming = sessions.filter((s) => s.mentor === c.name && s.status === 'Upcoming').length;
          return (
            <Panel key={c.id}>
              <div className="flex items-start gap-3">
                <Avatar name={c.name} size={48} tone="ink" />
                <div className="min-w-0 flex-1">
                  <h3 className="mc-display text-[18px] font-semibold text-[#0D1B3E]">{c.name}</h3>
                  <p className="text-[13px] text-[#5B6885]">{c.role}</p>
                </div>
                <Badge tone="mint" dot>
                  Active
                </Badge>
              </div>
              <p className="mt-3 text-[13.5px] text-[#26355A]">{c.specialty}</p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                {[
                  ['Mentees', c.activeMentees + mine.length],
                  ['Sessions', upcoming],
                  ['Rating', c.rating.toFixed(1)],
                ].map(([l, v]) => (
                  <div key={l as string} className="rounded-[10px] bg-[#F5F7FB] py-2.5">
                    <div className="mc-display mc-num text-[20px] font-semibold text-[#0D1B3E]">{v}</div>
                    <div className="text-[12px] text-[#5B6885]">{l}</div>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <div className="flex justify-between text-[12.5px] mb-1.5">
                  <span className="text-[#5B6885]">Caseload</span>
                  <span className={cx('mc-num font-semibold', load >= 100 ? 'text-[#B42F3B]' : load >= 85 ? 'text-[#94570A]' : 'text-[#26355A]')}>
                    {c.activeMentees + mine.length} of {c.capacity}
                  </span>
                </div>
                <StepMeter value={Math.min(100, load)} steps={10} height={20} tone={load >= 100 ? 'marigold' : 'blue'} label={`${c.name} caseload`} />
              </div>
              <div className="mt-4 flex gap-2">
                <a href={`mailto:${c.email}`} className="flex-1 inline-flex h-9 items-center justify-center gap-1.5 rounded-[10px] border border-[#D3DBE8] text-[13px] font-semibold text-[#0D1B3E] hover:bg-[#F8FAFD]">
                  <Mail className="w-4 h-4" /> Email
                </a>
                <Button size="md" className="flex-1 h-9" onClick={() => go('sessions')}>
                  Sessions
                </Button>
              </div>
            </Panel>
          );
        })}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* User management                                                     */
/* ------------------------------------------------------------------ */

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tempPassword: string;
  createdAt: string;
  active?: boolean;
}

const makePassword = () => `MC-${Math.random().toString(36).slice(2, 6).toUpperCase()}-${Math.random().toString(36).slice(2, 6)}`;

export const UserManagement: React.FC = () => {
  const { addAudit } = useAdmin();
  const [users, setUsers] = usePersistentState<ManagedUser[]>('maxicareer_managed_users', []);
  const [form, setForm] = useState({ name: '', email: '', role: 'Counsellor' });
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);

  return (
    <div className="space-y-5">
      <PageHeader title="User management" description="Create staff accounts and issue one-time passwords. Staff change it on first sign-in." />
      <Panel title="Add a staff member">
        <form
          className="grid grid-cols-1 md:grid-cols-[1fr_1fr_180px_auto] gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            const email = form.email.trim().toLowerCase();
            if (!form.name.trim() || !email) return;
            if (users.some((u) => u.email === email)) {
              setIssued(null);
              window.alert('Someone with that email already has an account.');
              return;
            }
            const password = makePassword();
            setUsers([{ id: uid('u'), name: form.name.trim(), email, role: form.role, tempPassword: password, createdAt: new Date().toISOString(), active: true }, ...users]);
            addAudit('Users', 'Created account', `${form.role}: ${email}`);
            setIssued({ email, password });
            setForm({ name: '', email: '', role: form.role });
          }}
        >
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" required aria-label="Full name" />
          <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@maxicareer.com" required aria-label="Email" />
          <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} aria-label="Role">
            {['Counsellor', 'Mentor', 'Content editor', 'Admin'].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </Select>
          <Button type="submit" variant="primary" icon={Plus}>
            Create account
          </Button>
        </form>
      </Panel>
      <Panel flush title="Staff accounts" description={`${users.length} account${users.length === 1 ? '' : 's'}`}>
        {users.length === 0 ? (
          <Empty icon={UserCog} title="No staff accounts yet" body="Add counsellors and mentors above. They'll get a one-time password to sign in." />
        ) : (
          <ul className="divide-y divide-[#EAEFF6] border-t border-[#EAEFF6]">
            {users.map((u) => (
              <li key={u.id} className={cx('flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5', u.active === false && 'opacity-60')}>
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Avatar name={u.name} />
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-[#0D1B3E] truncate">{u.name}</div>
                    <div className="text-[12.5px] text-[#5B6885] truncate">
                      {u.email} · added {formatDate(u.createdAt)}
                    </div>
                  </div>
                </div>
                <Badge tone={u.role === 'Admin' ? 'ink' : u.role === 'Content editor' ? 'violet' : 'blue'}>{u.role}</Badge>
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    icon={KeyRound}
                    onClick={() => {
                      const password = makePassword();
                      setUsers(users.map((x) => (x.id === u.id ? { ...x, tempPassword: password } : x)));
                      addAudit('Users', 'Reset password', u.email);
                      setIssued({ email: u.email, password });
                    }}
                  >
                    Reset password
                  </Button>
                  <Button
                    size="sm"
                    variant={u.active === false ? 'secondary' : 'ghost'}
                    onClick={() => {
                      setUsers(users.map((x) => (x.id === u.id ? { ...x, active: x.active === false } : x)));
                      addAudit('Users', u.active === false ? 'Reactivated account' : 'Deactivated account', u.email);
                    }}
                  >
                    {u.active === false ? 'Reactivate' : 'Deactivate'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>
      <Modal
        open={!!issued}
        onClose={() => {
          setIssued(null);
          setCopied(false);
        }}
        title="One-time password"
        description={issued ? `For ${issued.email}. It's shown only once, so share it securely now.` : ''}
        footer={<Button variant="primary" onClick={() => setIssued(null)}>Done</Button>}
      >
        <div className="flex items-center gap-2">
          <div className="mc-num flex-1 rounded-[10px] bg-[#0D1B3E] text-white text-[18px] tracking-wider px-4 py-3 select-all">{issued?.password}</div>
          <Button
            icon={copied ? Check : Copy}
            onClick={() => {
              navigator.clipboard?.writeText(issued?.password || '');
              setCopied(true);
            }}
          >
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Programs                                                            */
/* ------------------------------------------------------------------ */

const PROGRAM_ORDER = ['school', 'college', 'fresher', 'working_professional'];

export const Programs: React.FC = () => {
  const { students, setStudentPrefilter, go } = useAdmin();
  const programs = [...CAREER_PROGRAMS_LIST].sort((a, b) => PROGRAM_ORDER.indexOf(a.profession) - PROGRAM_ORDER.indexOf(b.profession));
  return (
    <div className="space-y-5">
      <PageHeader title="Programs & plans" description="Four programs, one for each stage of a career. Prices match what visitors see on the website." />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:items-start">
        {programs.map((p, i) => {
          const learners = students.filter((s) => s.profession === p.profession);
          const enrolled = learners.filter((s) => s.status === 'enrolled' || s.status === 'completed').length;
          const revenue = learners.reduce((a, s) => a + (s.planPrice || 0), 0);
          return (
            <section key={p.id} className="flex flex-col">
              <div className="xl:block hidden" style={{ height: (3 - i) * 28 }} aria-hidden />
              <div className="rounded-[14px] border border-[#DDE4EF] bg-white overflow-hidden flex flex-col flex-1">
                <div className="bg-[#0D1B3E] text-white px-5 pt-4 pb-5 relative">
                  <div className="flex items-end gap-[3px] h-5 mb-3" aria-hidden>
                    {[0, 1, 2, 3].map((k) => (
                      <span key={k} className="w-3 rounded-[2px]" style={{ height: `${(k + 1) * 25}%`, background: k <= i ? '#38BDF8' : '#22356A' }} />
                    ))}
                  </div>
                  <div className="text-[12.5px] text-[#AFC0E3]">{COHORT_LABEL[p.profession]}</div>
                  <h3 className="mc-display text-[21px] font-semibold leading-tight mt-0.5">{p.name.replace(' career program', '')}</h3>
                  <p className="text-[13px] text-[#D6E0F5] mt-1">{p.tagline}</p>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="mc-display mc-num text-[28px] font-semibold text-[#0D1B3E]">{inr(p.price)}</span>
                    <span className="mc-num text-[13px] text-[#8C97AE] line-through">{inr(p.originalPrice)}</span>
                  </div>
                  {p.launchOffer && <span className="text-[12px] text-[#94570A] mt-0.5">Launch offer, {Math.round((1 - p.price / p.originalPrice) * 100)}% off</span>}
                  <ul className="mt-4 space-y-1.5 text-[13px] text-[#26355A] flex-1">
                    {p.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check className="w-4 h-4 text-[#0F9F6E] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 pt-3 border-t border-[#EAEFF6] grid grid-cols-3 gap-2 text-center">
                    {[
                      ['Learners', learners.length],
                      ['Enrolled', enrolled],
                      ['Value', revenue >= 100000 ? `₹${(revenue / 100000).toFixed(1)}L` : inr(revenue)],
                    ].map(([l, v]) => (
                      <div key={l as string}>
                        <div className="mc-display mc-num text-[17px] font-semibold text-[#0D1B3E]">{v}</div>
                        <div className="text-[11.5px] text-[#5B6885]">{l}</div>
                      </div>
                    ))}
                  </div>
                  <Button
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setStudentPrefilter({ cohort: p.profession });
                      go('students');
                    }}
                  >
                    View learners
                  </Button>
                </div>
              </div>
            </section>
          );
        })}
      </div>
      <p className="text-[12.5px] text-[#7A869E]">To change prices or features, edit CAREER_PROGRAMS_LIST in src/data/portalData.ts so the website and this page stay in sync.</p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Services                                                            */
/* ------------------------------------------------------------------ */

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  price: string;
  duration: string;
  status: 'Active' | 'Draft';
}

const DEFAULT_SERVICES: Service[] = [
  { id: 'svc-1', name: 'Career Discovery & Guidance', category: 'Career guidance', description: 'Strengths assessment, career options, and a personalised action plan.', price: '₹1,499', duration: '2 sessions', status: 'Active' },
  { id: 'svc-2', name: 'Skills & Portfolio Accelerator', category: 'Skill development', description: 'Practical skills, guided projects, and portfolio feedback.', price: '₹4,999', duration: '6 weeks', status: 'Active' },
  { id: 'svc-3', name: '1:1 Mentor Coaching', category: 'Mentorship', description: 'Focused mentor sessions with goals, feedback, and accountability.', price: '₹999', duration: '60 minutes', status: 'Active' },
  { id: 'svc-4', name: 'Resume & Interview Sprint', category: 'Job readiness', description: 'ATS resume review, mock interviews, and actionable feedback.', price: '₹1,999', duration: '2 weeks', status: 'Draft' },
];

export const Services: React.FC = () => {
  const { addAudit } = useAdmin();
  const [services, setServices] = usePersistentState<Service[]>('maxicareer_services', DEFAULT_SERVICES);
  const [filter, setFilter] = useState<'all' | 'Active' | 'Draft'>('all');
  const [editing, setEditing] = useState<Service | null>(null);
  const shown = services.filter((s) => filter === 'all' || s.status === filter);
  const categories = Array.from(new Set(services.map((s) => s.category)));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Services"
        description="Stand-alone services learners can buy on their own or add to a program."
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setEditing({ id: '', name: '', category: categories[0] || 'Career guidance', description: '', price: '', duration: '', status: 'Draft' })}>
            Add service
          </Button>
        }
      />
      <Segmented
        value={filter}
        onChange={setFilter}
        options={[
          { value: 'all', label: 'All', count: services.length },
          { value: 'Active', label: 'Live', count: services.filter((s) => s.status === 'Active').length },
          { value: 'Draft', label: 'Drafts', count: services.filter((s) => s.status === 'Draft').length },
        ]}
      />
      <div className="bg-white border border-[#DDE4EF] rounded-[14px] divide-y divide-[#EAEFF6]">
        {shown.length === 0 && <Empty icon={Briefcase} title="No services here" />}
        {shown.map((s) => (
          <div key={s.id} className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 px-5 py-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <span className="h-10 w-10 shrink-0 rounded-[10px] bg-[#E8F0FE] text-[#1D4FD7] flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[15px] font-semibold text-[#0D1B3E]">{s.name}</h3>
                  <Badge tone={s.status === 'Active' ? 'mint' : 'marigold'} dot>
                    {s.status === 'Active' ? 'Live' : 'Draft'}
                  </Badge>
                </div>
                <p className="text-[13px] text-[#5B6885] mt-0.5">{s.description || 'No description yet.'}</p>
                <p className="text-[12px] text-[#7A869E] mt-1">{s.category}</p>
              </div>
            </div>
            <div className="flex md:flex-col md:items-end gap-3 md:gap-0 md:w-32 shrink-0">
              <span className="mc-display mc-num text-[18px] font-semibold text-[#0D1B3E]">{s.price || '—'}</span>
              <span className="text-[12.5px] text-[#5B6885]">{s.duration}</span>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                size="sm"
                onClick={() => {
                  setServices(services.map((x) => (x.id === s.id ? { ...x, status: x.status === 'Active' ? 'Draft' : 'Active' } : x)));
                  addAudit('Services', s.status === 'Active' ? 'Moved to draft' : 'Made live', s.name);
                }}
              >
                {s.status === 'Active' ? 'Move to draft' : 'Make live'}
              </Button>
              <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(s)} />
              <IconButton
                icon={Trash2}
                tone="danger"
                label="Delete"
                onClick={() => {
                  if (!window.confirm(`Delete "${s.name}"?`)) return;
                  setServices(services.filter((x) => x.id !== s.id));
                  addAudit('Services', 'Deleted service', s.name);
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit service' : 'Add service'}
        footer={
          <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!editing?.name.trim()}
              onClick={() => {
                if (!editing) return;
                if (editing.id) {
                  setServices(services.map((x) => (x.id === editing.id ? editing : x)));
                  addAudit('Services', 'Edited service', editing.name);
                } else {
                  setServices([{ ...editing, id: uid('svc') }, ...services]);
                  addAudit('Services', 'Added service', editing.name);
                }
                setEditing(null);
              }}
            >
              Save service
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Name" className="sm:col-span-2">
              <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
            </Field>
            <Field label="Category">
              <Input list="svc-cats" value={editing.category} onChange={(e) => setEditing({ ...editing, category: e.target.value })} />
              <datalist id="svc-cats">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </Field>
            <Field label="Status">
              <Select value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as Service['status'] })}>
                <option value="Draft">Draft</option>
                <option value="Active">Live</option>
              </Select>
            </Field>
            <Field label="Price">
              <Input value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value })} placeholder="₹1,999" />
            </Field>
            <Field label="Duration">
              <Input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="2 weeks" />
            </Field>
            <Field label="Description" className="sm:col-span-2">
              <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Sessions                                                            */
/* ------------------------------------------------------------------ */

export const Sessions: React.FC = () => {
  const { sessions, setSessions, students, addAudit, notify } = useAdmin();
  const [view, setView] = useState<'Upcoming' | 'Completed' | 'Cancelled'>('Upcoming');
  const [editing, setEditing] = useState<SessionItem | null>(null);
  const shown = sessions.filter((s) => s.status === view).sort((a, b) => (view === 'Upcoming' ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)));

  const byDay = useMemo(() => {
    const m = new Map<string, SessionItem[]>();
    shown.forEach((s) => m.set(s.date, [...(m.get(s.date) || []), s]));
    return Array.from(m.entries());
  }, [shown]);

  const dayLabel = (iso: string) => {
    const d = daysUntil(iso);
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    if (d === -1) return 'Yesterday';
    return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
  };

  const setStatus = (s: SessionItem, status: SessionItem['status']) => {
    setSessions((prev) => prev.map((x) => (x.id === s.id ? { ...x, status } : x)));
    addAudit('Sessions', status === 'Completed' ? 'Marked session done' : 'Cancelled session', `${s.studentName}, ${formatDate(s.date)}`);
    if (status === 'Cancelled') notify({ title: `Session cancelled: ${s.studentName}`, body: `${s.topic} on ${formatDate(s.date)}`, category: 'sessions', link: 'sessions' });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        title="Sessions"
        description="One-to-one counselling calls between students and mentors."
        actions={
          <Button
            variant="primary"
            icon={Plus}
            onClick={() => setEditing({ id: '', date: new Date(Date.now() + DAY_MS).toISOString().slice(0, 10), time: '17:00', studentName: '', topic: '', mentor: MENTORS[0], mode: 'Video call', status: 'Upcoming' })}
          >
            Schedule session
          </Button>
        }
      />
      <Segmented value={view} onChange={setView} options={(['Upcoming', 'Completed', 'Cancelled'] as const).map((v) => ({ value: v, label: v, count: sessions.filter((s) => s.status === v).length }))} />
      {byDay.length === 0 ? (
        <Panel>
          <Empty icon={CalendarClock} title={`No ${view.toLowerCase()} sessions`} />
        </Panel>
      ) : (
        <div className="space-y-5">
          {byDay.map(([date, items]) => (
            <section key={date}>
              <h3 className="mc-display text-[15px] font-semibold text-[#0D1B3E] mb-2" suppressHydrationWarning>
                {dayLabel(date)}
              </h3>
              <div className="bg-white border border-[#DDE4EF] rounded-[14px] divide-y divide-[#EAEFF6]">
                {items
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((s) => (
                    <div key={s.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5">
                      <div className="mc-display mc-num text-[17px] font-semibold text-[#0D1B3E] w-20 shrink-0">{s.time}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-semibold text-[#0D1B3E]">{s.studentName}</div>
                        <div className="text-[13px] text-[#5B6885]">
                          {s.topic} · {s.mode} with {s.mentor}
                        </div>
                      </div>
                      {s.status === 'Upcoming' && (
                        <div className="flex gap-1">
                          <Button size="sm" icon={Check} onClick={() => setStatus(s, 'Completed')}>
                            Mark done
                          </Button>
                          <IconButton icon={Pencil} label="Edit" onClick={() => setEditing(s)} />
                          <Button size="sm" variant="ghost" onClick={() => window.confirm('Cancel this session?') && setStatus(s, 'Cancelled')}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </section>
          ))}
        </div>
      )}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing?.id ? 'Edit session' : 'Schedule session'}
        footer={
          <>
            <Button onClick={() => setEditing(null)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!editing?.studentName.trim() || !editing?.date}
              onClick={() => {
                if (!editing) return;
                if (editing.id) {
                  setSessions((prev) => prev.map((x) => (x.id === editing.id ? editing : x)));
                  addAudit('Sessions', 'Edited session', `${editing.studentName}, ${formatDate(editing.date)}`);
                } else {
                  setSessions((prev) => [...prev, { ...editing, id: uid('sess') }]);
                  addAudit('Sessions', 'Scheduled session', `${editing.studentName} with ${editing.mentor}, ${formatDate(editing.date)} ${editing.time}`);
                  notify({ title: `Session booked: ${editing.studentName}`, body: `${editing.topic || 'Counselling'} on ${formatDate(editing.date)} at ${editing.time}`, category: 'sessions', link: 'sessions' });
                }
                setEditing(null);
              }}
            >
              Save session
            </Button>
          </>
        }
      >
        {editing && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Student" className="sm:col-span-2">
              <Input list="sess-students" value={editing.studentName} onChange={(e) => setEditing({ ...editing, studentName: e.target.value })} />
              <datalist id="sess-students">
                {students.map((s) => (
                  <option key={s._id} value={s.name} />
                ))}
              </datalist>
            </Field>
            <Field label="Topic" className="sm:col-span-2">
              <Input value={editing.topic} onChange={(e) => setEditing({ ...editing, topic: e.target.value })} placeholder="Mock HR interview" />
            </Field>
            <Field label="Date">
              <Input type="date" value={editing.date} onChange={(e) => setEditing({ ...editing, date: e.target.value })} />
            </Field>
            <Field label="Time">
              <Input type="time" value={editing.time} onChange={(e) => setEditing({ ...editing, time: e.target.value })} />
            </Field>
            <Field label="Mentor">
              <Select value={editing.mentor} onChange={(e) => setEditing({ ...editing, mentor: e.target.value })}>
                {MENTORS.map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </Select>
            </Field>
            <Field label="How">
              <Select value={editing.mode} onChange={(e) => setEditing({ ...editing, mode: e.target.value as SessionItem['mode'] })}>
                <option>Video call</option>
                <option>Phone</option>
                <option>In person</option>
              </Select>
            </Field>
          </div>
        )}
      </Modal>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

export const Reports: React.FC = () => {
  const { students, applications, stats, addAudit } = useAdmin();

  const months = useMemo(() => {
    const out: { key: string; label: string; n: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      out.push({ key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString('en-IN', { month: 'short' }), n: 0 });
    }
    students.forEach((s) => {
      const d = new Date(s.createdAt);
      const m = out.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (m) m.n++;
    });
    return out;
  }, [students]);
  const maxMonth = Math.max(1, ...months.map((m) => m.n));

  const byStatus = (Object.keys(STATUS_LABEL) as (keyof typeof STATUS_LABEL)[]).map((k) => ({ k, label: STATUS_LABEL[k], n: students.filter((s) => s.status === k).length }));
  const byProgram = useMemo(() => {
    const m = new Map<string, { n: number; value: number }>();
    students.forEach((s) => {
      const name = s.planName.split('(')[0].trim();
      const cur = m.get(name) || { n: 0, value: 0 };
      m.set(name, { n: cur.n + 1, value: cur.value + (s.planPrice || 0) });
    });
    return Array.from(m.entries()).sort((a, b) => b[1].value - a[1].value);
  }, [students]);
  const total = stats?.totalPipelineRevenue || students.reduce((a, s) => a + (s.planPrice || 0), 0);
  const realised = students.filter((s) => s.status === 'enrolled' || s.status === 'completed').reduce((a, s) => a + (s.planPrice || 0), 0);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Reports"
        description="Registrations, revenue and outcomes. Export any of it for your own spreadsheets."
        actions={
          <>
            <Button
              icon={Download}
              onClick={() => {
                exportStudents(students);
                addAudit('Reports', 'Exported students to CSV', `${students.length} rows`);
              }}
            >
              Students CSV
            </Button>
            <Button
              icon={Download}
              onClick={() => {
                downloadCsv(
                  `maxicareer_report_summary_${new Date().toISOString().slice(0, 10)}.csv`,
                  ['Metric', 'Value'],
                  [
                    ['Total students', students.length],
                    ...byStatus.map((s) => [`Status: ${s.label}`, s.n]),
                    ['Pipeline value (INR)', total],
                    ['Enrolled + completed value (INR)', realised],
                    ...STAGES.map((st) => [`Applications: ${st}`, applications.filter((a) => a.stage === st).length]),
                  ]
                );
                addAudit('Reports', 'Exported summary report', 'CSV');
              }}
            >
              Summary CSV
            </Button>
          </>
        }
      />
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <Stat label="Pipeline value" value={<span className="text-[26px]">{inr(total)}</span>} hint="All registrations" />
        <Stat label="Enrolled value" value={<span className="text-[26px]">{inr(realised)}</span>} hint={`${total ? Math.round((realised / total) * 100) : 0}% of pipeline`} />
        <Stat label="Average fee" value={<span className="text-[26px]">{inr(students.length ? Math.round(total / students.length) : 0)}</span>} />
        <Stat label="Offers" value={applications.filter((a) => a.stage === 'Offer').length} hint={`From ${applications.length} applications`} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Panel title="New registrations" description="Last six months">
          <div className="flex items-end gap-3 h-44 pt-4">
            {months.map((m) => (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                <span className="mc-num text-[12.5px] font-semibold text-[#26355A]">{m.n}</span>
                <div className="w-full max-w-[44px] rounded-t-[6px] bg-[#2563EB]" style={{ height: `${Math.max(4, (m.n / maxMonth) * 100)}%`, opacity: m.n ? 1 : 0.2 }} />
                <span className="text-[12px] text-[#5B6885]">{m.label}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Where students are">
          <ul className="space-y-3">
            {byStatus.map((s) => (
              <li key={s.k} className="flex items-center gap-3">
                <span className="w-24 text-[13.5px] text-[#26355A]">{s.label}</span>
                <div className="flex-1 h-2.5 rounded-full bg-[#EEF2F7] overflow-hidden">
                  <div className="h-full rounded-full bg-[#2563EB]" style={{ width: `${students.length ? (s.n / students.length) * 100 : 0}%` }} />
                </div>
                <span className="mc-num w-10 text-right text-[13px] font-semibold text-[#0D1B3E]">{s.n}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title="Revenue by program" flush>
          <table className="w-full">
            <thead>
              <tr>
                <Th>Program</Th>
                <Th className="text-right">Learners</Th>
                <Th className="text-right">Value</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EAEFF6]">
              {byProgram.map(([name, v]) => (
                <tr key={name}>
                  <Td>{name}</Td>
                  <Td className="mc-num text-right">{v.n}</Td>
                  <Td className="mc-num text-right font-semibold">{inr(v.value)}</Td>
                </tr>
              ))}
            </tbody>
          </table>
          {byProgram.length === 0 && <Empty title="No data yet" />}
        </Panel>
        <Panel title="Application outcomes">
          <ul className="space-y-2.5">
            {STAGES.map((st) => {
              const n = applications.filter((a) => a.stage === st).length;
              return (
                <li key={st} className="flex items-center justify-between">
                  <Badge tone={STAGE_TONE[st]} dot>
                    {st}
                  </Badge>
                  <span className="mc-num text-[13.5px] font-semibold text-[#0D1B3E]">{n}</span>
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export const SettingsPage: React.FC<{ onLogout: () => void; onBackToSite: () => void }> = ({ onLogout, onBackToSite }) => {
  const { session, stats } = useAdmin();
  return (
    <div className="space-y-5 max-w-3xl">
      <PageHeader title="Settings" description="Your account and how this workspace connects to data." />
      <Panel title="Your account">
        <div className="flex items-center gap-4">
          <Avatar name={session.name} size={52} tone="blue" />
          <div className="flex-1">
            <div className="text-[16px] font-semibold text-[#0D1B3E]">{session.name}</div>
            <div className="text-[13px] text-[#5B6885]">{session.email}</div>
            <div className="text-[12.5px] text-[#7A869E] mt-0.5">Signed in {formatDate(new Date(session.loggedInAt).toISOString(), true)}</div>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          <Button icon={ExternalLink} onClick={onBackToSite}>
            View website
          </Button>
          <Button variant="danger" icon={LogOut} onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </Panel>
      <Panel title="Database" actions={<Database className="w-4 h-4 text-[#8C97AE]" />}>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-[13.5px]">
          {[
            ['Status', stats ? (stats.isRealMongo ? 'Connected to MongoDB' : 'Using local fallback data') : 'Unknown'],
            ['Database', stats?.dbName || '—'],
            ['Collection', stats?.collection || 'students'],
            ['Host', stats?.uriHost || '—'],
            ['Records', stats?.totalStudents ?? '—'],
            ['Last ping', stats?.lastPingMs !== undefined ? `${stats.lastPingMs} ms` : '—'],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-[12.5px] text-[#5B6885]">{k}</dt>
              <dd className="font-medium text-[#0D1B3E] break-all">{v}</dd>
            </div>
          ))}
        </dl>
      </Panel>
      <Panel title="Where admin data is kept">
        <p className="text-[13.5px] text-[#26355A] leading-relaxed">
          Students are stored in the database. Applications, roadmaps, notifications, website content, sessions and the audit log are saved in this browser for now, so other admins won't see them until
          they're moved to the database. Export regularly from Applications and Audit log to keep a copy.
        </p>
      </Panel>
    </div>
  );
};
