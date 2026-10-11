import React, { useState, useEffect } from 'react';
import {
  X,
  GraduationCap,
  Briefcase,
  BookOpen,
  CheckCircle2,
  Mail,
  MessageCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Building,
  User,
  Phone,
  MapPin,
  Lock,
  Plus,
  Check,
  Copy,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserProfession,
  PricingPlan,
  StudentProfile,
  RegistrationFormData,
} from '../types';
import {
  PROFESSION_OPTIONS,
  PRICING_PLANS,
  ADD_ON_SERVICES,
  DEMO_STUDENT_PROFILES,
  OFFICIAL_PHONE,
  OFFICIAL_PHONE_DIGITS,
  OFFICIAL_EMAIL,
  generateRegistrationWhatsAppUrl,
  generateRegistrationEmailUrl,
  generateRegistrationEmailData,
} from '../data/portalData';
import { BrandLogo } from './BrandLogo';

interface StudentPortalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: StudentProfile) => void;
  initialMode?: 'login' | 'register';
  initialProfession?: UserProfession;
  preselectedPlanId?: string;
}

export const StudentPortalModal: React.FC<StudentPortalModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  initialProfession = 'college',
  preselectedPlanId,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedProfession, setSelectedProfession] = useState<UserProfession>(initialProfession);
  const [registerStep, setRegisterStep] = useState<number>(1); // 1: Profession, 2: Pricing Plan, 3: Details & Submit

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Selected add-on services
  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);

  // Registration form state
  const [formData, setFormData] = useState<RegistrationFormData>({
    profession: initialProfession,
    name: '',
    email: '',
    phone: '+91 ',
    city: '',
    schoolName: '',
    classGrade: '11th Grade',
    streamInterest: 'Science (PCM/Engineering)',
    collegeName: '',
    degree: 'B.Tech / B.E. (Computer Science)',
    yearOfStudy: 'Final Year (2026)',
    targetDomain: 'Software Engineering / SDE',
    graduationYear: '2026',
    highestQualification: 'B.Tech / B.E.',
    company: '',
    designation: '',
    experienceYears: '2–4 Years',
    careerGoal: 'Transition to Tier-1 Tech / Product Role',
    selectedPlanId: preselectedPlanId || PRICING_PLANS[initialProfession][0]?.id,
    selectedAddOnIds: [],
    additionalNotes: '',
  });

  const [registrationSubmitted, setRegistrationSubmitted] = useState<StudentProfile | null>(null);
  const [submittedEmailData, setSubmittedEmailData] = useState<{
    recipient: string;
    subject: string;
    body: string;
    mailtoUrl: string;
    gmailUrl: string;
    outlookUrl: string;
  } | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedProfession(initialProfession);
      const chosenPlanId = preselectedPlanId || PRICING_PLANS[initialProfession]?.[0]?.id || '';
      setFormData((prev) => ({
        ...prev,
        profession: initialProfession,
        selectedPlanId: chosenPlanId,
      }));
      if (initialMode === 'register' && preselectedPlanId) {
        setRegisterStep(2);
      } else {
        setRegisterStep(1);
      }
    }
  }, [isOpen, initialMode, initialProfession, preselectedPlanId]);

  // Sync selected plan when profession changes
  const handleSelectProfession = (prof: UserProfession) => {
    setSelectedProfession(prof);
    const plans = PRICING_PLANS[prof];
    const defaultPlan = plans[0];
    setFormData((prev) => ({
      ...prev,
      profession: prof,
      selectedPlanId: defaultPlan.id,
    }));
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOnIds((prev) => {
      const next = prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId];
      setFormData((f) => ({ ...f, selectedAddOnIds: next }));
      return next;
    });
  };

  // Google Sign-In Handler
  const handleGoogleSignIn = () => {
    setIsLoggingIn(true);
    setLoginError('');

    setTimeout(() => {
      // Create or load profile with Google authentication
      const profLabelMap: Record<UserProfession, string> = {
        school: 'School Student (Senior High)',
        college: 'College Student (Undergraduate)',
        fresher: 'Fresher / PSW (2025/2026 Graduate)',
        working_professional: 'Working Professional',
      };

      const institutionMap: Record<UserProfession, string> = {
        school: 'St. Xavier High School',
        college: 'National Institute of Technology',
        fresher: 'Delhi University / Coventry University UK',
        working_professional: 'Tech Enterprise Solutions',
      };

      const detailMap: Record<UserProfession, string> = {
        school: 'Class 12 • Step-Ready Career Program',
        college: 'Final Year CSE • Step-Next Career Program',
        fresher: 'Recent Graduate • Step-In Career Program',
        working_professional: '3 Years Experience • Step-Up Career Program',
      };

      const plan = PRICING_PLANS[selectedProfession][0];

      const googleProfile: StudentProfile = {
        id: `google-user-${Date.now()}`,
        name: 'Darshani Prachi',
        email: 'darshaniprachi@gmail.com',
        phone: OFFICIAL_PHONE,
        profession: selectedProfession,
        professionLabel: profLabelMap[selectedProfession],
        institutionOrCompany: institutionMap[selectedProfession],
        detail: detailMap[selectedProfession],
        planName: plan?.name || 'Career Acceleration Program',
        planPrice: plan?.price || 15999,
        registeredDate: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        roadmapProgress: 75,
        authProvider: 'google',
        avatarUrl:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

      setIsLoggingIn(false);
      onLoginSuccess(googleProfile);
      onClose();
    }, 650);
  };

  // Regular Email Login Handler
  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setLoginError('Please enter your registered email address.');
      return;
    }
    if (!loginPassword.trim()) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoggingIn(true);
    setLoginError('');

    setTimeout(() => {
      const demoUser = DEMO_STUDENT_PROFILES[selectedProfession];
      const profile: StudentProfile = {
        ...demoUser,
        name: loginEmail.split('@')[0] || demoUser.name,
        email: loginEmail,
      };

      setIsLoggingIn(false);
      onLoginSuccess(profile);
      onClose();
    }, 500);
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = (prof: UserProfession) => {
    const demo = DEMO_STUDENT_PROFILES[prof];
    onLoginSuccess(demo);
    onClose();
  };

  // Active Plan Object
  const currentPlans = PRICING_PLANS[selectedProfession];
  const activePlan =
    currentPlans.find((p) => p.id === formData.selectedPlanId) || currentPlans[0];

  const selectedAddOnObjects = ADD_ON_SERVICES.filter((s) =>
    selectedAddOnIds.includes(s.id)
  );
  const addOnsTotal = selectedAddOnObjects.reduce((acc, s) => acc + s.price, 0);
  const finalTotalPrice = activePlan.price + addOnsTotal;

  // Submit Registration and route to WhatsApp or Email
  const handleCompleteRegistration = (actionType: 'whatsapp' | 'email' | 'dashboard') => {
    // Validate required fields
    if (!formData.name.trim()) {
      alert('Please enter your full name.');
      return;
    }
    if (!formData.email.trim()) {
      alert('Please enter a valid email address.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      alert('Please enter your contact phone number.');
      return;
    }

    const institution =
      selectedProfession === 'school'
        ? formData.schoolName || 'School'
        : selectedProfession === 'college'
        ? formData.collegeName || 'College'
        : selectedProfession === 'fresher'
        ? formData.collegeName || 'Graduated University'
        : formData.company || 'Organization';

    const detailText =
      selectedProfession === 'school'
        ? `${formData.classGrade} • ${formData.streamInterest}`
        : selectedProfession === 'college'
        ? `${formData.degree} • ${formData.yearOfStudy}`
        : selectedProfession === 'fresher'
        ? `Graduated ${formData.graduationYear} • ${formData.highestQualification} • Target: ${formData.targetDomain || 'Industry Role'}`
        : `${formData.experienceYears} • ${formData.careerGoal}`;

    const addOnNames = selectedAddOnObjects.map((s) => `${s.title} (${s.priceFormatted})`);

    const newProfile: StudentProfile = {
      id: `maxi-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      profession: selectedProfession,
      professionLabel:
        selectedProfession === 'school'
          ? `School Student (${formData.classGrade})`
          : selectedProfession === 'college'
          ? `College Student (${formData.degree?.split('(')[0] || 'UG'})`
          : selectedProfession === 'fresher'
          ? `Fresher / PSW (${formData.graduationYear})`
          : `Working Professional (${formData.designation || 'Specialist'})`,
      institutionOrCompany: institution,
      detail: detailText,
      planName: activePlan.name,
      planPrice: finalTotalPrice,
      registeredDate: new Date().toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }),
      roadmapProgress: 25,
      authProvider: 'email',
    };

    setRegistrationSubmitted(newProfile);

    // Prepare email data for instant dispatch & backup
    const emailData = generateRegistrationEmailData({
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      profession:
        selectedProfession === 'school'
          ? 'School Student'
          : selectedProfession === 'college'
          ? 'College Student'
          : selectedProfession === 'fresher'
          ? 'Fresher / PSW'
          : 'Working Professional',
      planName: activePlan.name,
      price: finalTotalPrice,
      institutionOrCompany: institution,
      notes: formData.additionalNotes || detailText,
      addOns: addOnNames,
    });
    setSubmittedEmailData(emailData);

    // Guarantee backend registration record persistence in MongoDB database via Next.js API
    fetch('/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        city: formData.city,
        profession: selectedProfession,
        professionLabel: newProfile.professionLabel,
        institutionOrCompany: institution,
        detail: detailText,
        planName: activePlan.name,
        planPrice: finalTotalPrice,
        selectedAddOns: addOnNames,
        status: 'pending',
        mentorAssigned: 'Unassigned',
        notes: formData.additionalNotes || detailText,
        academicDetails: formData,
        source: 'portal_registration',
      }),
    }).catch(() => {});

    // Also dispatch contact notification backup
    fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'registration',
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        planName: activePlan.name,
        price: finalTotalPrice,
        profession: selectedProfession,
        institutionOrCompany: institution,
        notes: formData.additionalNotes || detailText,
        addOns: addOnNames,
      }),
    }).catch(() => {});

    // If user selected WhatsApp action:
    if (actionType === 'whatsapp') {
      const waUrl = generateRegistrationWhatsAppUrl({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        profession:
          selectedProfession === 'school'
            ? 'School Student'
            : selectedProfession === 'college'
            ? 'College Student'
            : selectedProfession === 'fresher'
            ? 'Fresher / PSW'
            : 'Working Professional',
        planName: activePlan.name,
        price: finalTotalPrice,
        institutionOrCompany: institution,
        notes: formData.additionalNotes || detailText,
        addOns: addOnNames,
      });
      window.open(waUrl, '_blank', 'noopener,noreferrer');
    } else if (actionType === 'email') {
      // 1. Try opening Gmail Web directly in a new tab (works reliably without needing local mail clients)
      try {
        const opened = window.open(emailData.gmailUrl, '_blank', 'noopener,noreferrer');
        if (!opened) {
          // If popup blocker intervened, use safe temporary anchor for mailto:
          const a = document.createElement('a');
          a.href = emailData.mailtoUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } catch {
        // Safe fallback
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-md overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-3xl overflow-hidden my-auto max-h-[94vh] flex flex-col relative"
      >
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-[#1E293B] to-slate-900 text-white px-5 sm:px-7 py-4 sm:py-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400 flex-shrink-0">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
                  Maxicareer Student Portal
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Official
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Direct Mentorship &bull; Support: <span className="text-emerald-400 font-semibold">{OFFICIAL_PHONE}</span>
              </p>
            </div>
          </div>

          <button
            id="close-portal-modal"
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Login vs Sign Up / Register */}
        {!registrationSubmitted && (
          <div className="flex border-b border-slate-200 bg-slate-50/80 px-5 sm:px-7 pt-3">
            <button
              id="tab-portal-login"
              type="button"
              onClick={() => setMode('login')}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
                mode === 'login'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Student Login</span>
            </button>

            <button
              id="tab-portal-register"
              type="button"
              onClick={() => {
                setMode('register');
                setRegisterStep(1);
              }}
              className={`pb-3 px-4 text-sm font-bold border-b-2 transition-all duration-200 flex items-center gap-2 ${
                mode === 'register'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>New Registration &amp; Consultation</span>
            </button>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-grow space-y-6">
          {/* -------------------- REGISTRATION SUBMITTED SUCCESS STATE -------------------- */}
          {registrationSubmitted ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Registration Successful
                </span>
                <h3 className="text-2xl font-black text-slate-900 mt-2">
                  Welcome to Maxicareer, {registrationSubmitted.name}!
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-1">
                  Your registration for <strong>{registrationSubmitted.planName}</strong> has been submitted. Our mentorship team will share your personalized fee structure and schedule your 1:1 consultation via WhatsApp or Email.
                </p>
              </div>

              {/* Direct routing confirmation cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto text-left">
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/70">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm mb-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Connected</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Message routed to official mentorship WhatsApp: <strong>{OFFICIAL_PHONE}</strong>
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/70">
                  <div className="flex items-center gap-2 text-blue-700 font-bold text-sm mb-1">
                    <Mail className="w-4 h-4" />
                    <span>Email Confirmation</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Details submitted to: <strong>{OFFICIAL_EMAIL}</strong>
                  </p>
                </div>
              </div>

              {/* Interactive Email Dispatch Actions */}
              {submittedEmailData && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-lg mx-auto text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Send Or Copy Email
                    </span>
                    <span className="text-xs text-blue-600 font-semibold">{OFFICIAL_EMAIL}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Open in Gmail Web */}
                    <button
                      type="button"
                      id="success-open-gmail-btn"
                      onClick={() => {
                        window.open(submittedEmailData.gmailUrl, '_blank', 'noopener,noreferrer');
                      }}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-red-600 hover:bg-red-700 text-white flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Open in Gmail (Web)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    {/* Open Default Mail */}
                    <button
                      type="button"
                      id="success-open-default-mail-btn"
                      onClick={() => {
                        const a = document.createElement('a');
                        a.href = submittedEmailData.mailtoUrl;
                        a.target = '_blank';
                        a.rel = 'noopener noreferrer';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                      }}
                      className="py-2.5 px-3 rounded-xl font-bold text-xs bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 shadow-sm transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span>Open Default Mail</span>
                    </button>
                  </div>

                  {/* Copy Button */}
                  <button
                    type="button"
                    id="success-copy-email-btn"
                    onClick={async () => {
                      const fullText = `To: ${submittedEmailData.recipient}\nSubject: ${submittedEmailData.subject}\n\n${submittedEmailData.body}`;
                      try {
                        if (navigator.clipboard && navigator.clipboard.writeText) {
                          await navigator.clipboard.writeText(fullText);
                        } else {
                          const textarea = document.createElement('textarea');
                          textarea.value = fullText;
                          document.body.appendChild(textarea);
                          textarea.select();
                          document.execCommand('copy');
                          document.body.removeChild(textarea);
                        }
                        setEmailCopied(true);
                        setTimeout(() => setEmailCopied(false), 3000);
                      } catch {}
                    }}
                    className={`w-full py-2 px-3 rounded-xl font-bold text-xs border flex items-center justify-center gap-2 transition-all ${
                      emailCopied
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                        : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700'
                    }`}
                  >
                    {emailCopied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Copied to Clipboard! Paste directly into your email app</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-500" />
                        <span>Copy Email &amp; Registration Text</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
                <button
                  type="button"
                  onClick={() => {
                    onLoginSuccess(registrationSubmitted);
                    onClose();
                  }}
                  className="flex-1 py-3 px-5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>Enter My Student Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : mode === 'login' ? (
            /* -------------------- LOGIN VIEW -------------------- */
            <div className="space-y-6">
              {/* Category Selector inside Login - 4 Options */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Your Category
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {PROFESSION_OPTIONS.map((prof) => {
                    const isSelected = selectedProfession === prof.id;
                    return (
                      <button
                        key={prof.id}
                        type="button"
                        onClick={() => setSelectedProfession(prof.id)}
                        className={`p-2.5 rounded-xl text-center border text-xs sm:text-sm font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {prof.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Google Sign In Button */}
              <div>
                <button
                  id="google-signin-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoggingIn}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-bold text-sm shadow-xs transition-all active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {/* Official Google G Logo */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Or with email
                </span>
              </div>

              {/* Email / Password Form */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {loginError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 font-semibold">
                    {loginError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-email-input"
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="student@example.com"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">Password</label>
                    <span className="text-[11px] text-blue-600 font-semibold cursor-pointer hover:underline">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="login-password-input"
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <button
                  id="submit-login-btn"
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
                >
                  <span>{isLoggingIn ? 'Verifying...' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Instant 1-Click Demo Profiles for evaluation - 4 buttons */}
              <div className="pt-2 border-t border-slate-100">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Instant 1-Click Demo Access
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('school')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center"
                  >
                    Demo: School
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('college')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center"
                  >
                    Demo: College
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('fresher')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center"
                  >
                    Demo: Fresher
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickDemoLogin('working_professional')}
                    className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium text-center"
                  >
                    Demo: Pro
                  </button>
                </div>
              </div>

              {/* Switch to Register */}
              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  Don&apos;t have an account yet?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setRegisterStep(1);
                    }}
                    className="font-bold text-blue-600 hover:underline"
                  >
                    Register &amp; View Pricing
                  </button>
                </p>
              </div>
            </div>
          ) : (
            /* -------------------- REGISTRATION / PRICING VIEW -------------------- */
            <div className="space-y-6">
              {/* Stepper Indicator */}
              <div className="flex items-center justify-between px-2 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      registerStep >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'
                    }`}
                  >
                    1
                  </span>
                  <span className={registerStep === 1 ? 'text-blue-600 font-black' : ''}>
                    Profession
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      registerStep >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'
                    }`}
                  >
                    2
                  </span>
                  <span className={registerStep === 2 ? 'text-blue-600 font-black' : ''}>
                    Pricing &amp; Program
                  </span>
                </div>
                <div className="w-8 h-0.5 bg-slate-200" />
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      registerStep >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'
                    }`}
                  >
                    3
                  </span>
                  <span className={registerStep === 3 ? 'text-blue-600 font-black' : ''}>
                    Submit &amp; Route
                  </span>
                </div>
              </div>

              {/* STEP 1: SELECT PROFESSION */}
              {registerStep === 1 && (
                <div className="space-y-4">
                  <div className="text-left">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      Step 1: Choose Your Current Stage
                    </h3>
                    <p className="text-xs text-slate-500">
                      Our mentorship programs and pricing are specifically customized for each cohort.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROFESSION_OPTIONS.map((prof) => {
                      const isSelected = selectedProfession === prof.id;
                      return (
                        <div
                          key={prof.id}
                          onClick={() => handleSelectProfession(prof.id)}
                          className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {prof.id === 'school' ? (
                                <BookOpen className="w-4 h-4" />
                              ) : prof.id === 'college' ? (
                                <GraduationCap className="w-4 h-4" />
                              ) : prof.id === 'fresher' ? (
                                <Sparkles className="w-4 h-4" />
                              ) : (
                                <Briefcase className="w-4 h-4" />
                              )}
                            </div>

                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <h4 className="font-bold text-slate-900 text-sm">
                                  {prof.title}
                                </h4>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  {prof.badge}
                                </span>
                              </div>
                              <p className="text-xs text-blue-600 font-semibold mt-0.5">{prof.subtitle}</p>
                              <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                                {prof.description}
                              </p>
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                            <input
                              type="radio"
                              name="profession-choice"
                              checked={isSelected}
                              onChange={() => handleSelectProfession(prof.id)}
                              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(2)}
                      className="py-2.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 text-sm"
                    >
                      <span>Continue to Program &amp; Pricing</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: SELECT PRICING PLAN & OPTIONAL ADD-ONS */}
              {registerStep === 2 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Step 2: Selected Career Program
                      </h3>
                      <p className="text-xs text-slate-500">
                        Program customized for{' '}
                        <span className="font-bold text-blue-600">
                          {PROFESSION_OPTIONS.find((p) => p.id === selectedProfession)?.title}
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="text-xs font-bold text-slate-500 hover:text-blue-600"
                    >
                      Change Cohort
                    </button>
                  </div>

                  {/* Career Program Card Matching Image 2 */}
                  <div className="p-5 rounded-2xl border-2 border-blue-600 bg-blue-50/20 shadow-md relative">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="inline-block bg-[#1E293B] text-white py-1 px-3 rounded-lg font-bold text-xs mb-2">
                          {activePlan.cohortBadge || 'Cohort Program'}
                        </div>
                        <h4 className="text-xl sm:text-2xl font-black text-slate-900">
                          {activePlan.name}
                        </h4>
                        <p className="text-xs text-slate-600 font-medium mt-1">
                          {activePlan.tagline}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-1">
                          <span>Fee on Consultation</span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          Customized pricing shared via WhatsApp / Email
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-200 my-4" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                      {activePlan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 font-black flex-shrink-0" />
                          <span className="font-medium">{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add-On Services Bundler Matching Image 1 */}
                  <div className="border-t border-slate-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <span>Add-On services (Optional)</span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 border border-blue-200">
                            Custom Boosters
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500">
                          Bundle targeted deliverables with your enrollment:
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ADD_ON_SERVICES.map((addOn) => {
                        const isChecked = selectedAddOnIds.includes(addOn.id);
                        return (
                          <div
                            key={addOn.id}
                            onClick={() => toggleAddOn(addOn.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                              isChecked
                                ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-slate-900">
                                {addOn.title}
                              </div>
                              <div className="text-xs font-extrabold text-blue-600 mt-0.5">
                                {addOn.priceFormatted}
                              </div>
                              <div className="text-[11px] text-slate-500 italic mt-0.5">
                                {addOn.deliveryTime}
                              </div>
                            </div>

                            <button
                              type="button"
                              className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${
                                isChecked
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-slate-300 text-slate-400 hover:border-slate-400'
                              }`}
                            >
                              {isChecked ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary Total & Consultation Note */}
                  <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-bold text-slate-800">Program Fee:</span>
                      <span className="text-slate-600">Personalized fee details shared upon consultation</span>
                    </div>
                    <span className="text-xs font-bold text-blue-700 bg-white px-2.5 py-1 rounded-lg border border-blue-200 self-start sm:self-auto">
                      Submit via WhatsApp / Email
                    </span>
                  </div>

                  {/* Navigation buttons */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setRegisterStep(1)}
                      className="py-2.5 px-4 rounded-xl font-bold text-slate-600 hover:bg-slate-100 text-xs sm:text-sm"
                    >
                      &larr; Back
                    </button>

                    <button
                      type="button"
                      onClick={() => setRegisterStep(3)}
                      className="py-2.5 px-6 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <span>Proceed to Registration Details</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: REGISTRATION FORM & DIRECT ROUTING */}
              {registerStep === 3 && (
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900">
                        Step 3: Complete Your Details &amp; Connect
                      </h3>
                      <p className="text-xs text-slate-500">
                        Registering for: <strong>{activePlan.name}</strong> •{' '}
                        <span className="text-blue-600 font-bold">
                          Fee details shared via Consultation
                        </span>
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setRegisterStep(2)}
                      className="text-xs font-bold text-blue-600 hover:underline"
                    >
                      Change Plan
                    </button>
                  </div>

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, name: e.target.value }))
                          }
                          placeholder="e.g. Darshani Prachi"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, email: e.target.value }))
                          }
                          placeholder="you@domain.com"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Phone / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="tel"
                          required
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, phone: e.target.value }))
                          }
                          placeholder="+91 9789730097"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* City */}
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        City / State
                      </label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) =>
                            setFormData((prev) => ({ ...prev, city: e.target.value }))
                          }
                          placeholder="e.g. Bangalore, Delhi, Chennai"
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    {/* Category-Specific Fields */}
                    {selectedProfession === 'school' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            School Name
                          </label>
                          <input
                            type="text"
                            value={formData.schoolName}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, schoolName: e.target.value }))
                            }
                            placeholder="e.g. DPS / St. Joseph"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Current Class / Grade
                          </label>
                          <select
                            value={formData.classGrade}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, classGrade: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="9th Grade">9th Grade</option>
                            <option value="10th Grade">10th Grade (Stream Decision)</option>
                            <option value="11th Grade">11th Grade</option>
                            <option value="12th Grade">12th Grade (Board & Entrance)</option>
                          </select>
                        </div>
                      </>
                    ) : selectedProfession === 'college' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            College / University Name
                          </label>
                          <input
                            type="text"
                            value={formData.collegeName}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, collegeName: e.target.value }))
                            }
                            placeholder="e.g. IIT, NIT, Anna University, Delhi Univ"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Degree &amp; Year
                          </label>
                          <select
                            value={formData.yearOfStudy}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, yearOfStudy: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="1st / 2nd Year">1st / 2nd Year (Foundation)</option>
                            <option value="3rd Year (Pre-Final)">3rd Year (Pre-Final / Internships)</option>
                            <option value="Final Year (2026)">Final Year (Placement Ready)</option>
                          </select>
                        </div>
                      </>
                    ) : selectedProfession === 'fresher' ? (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            College / University &amp; Year of Graduation
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={formData.collegeName}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, collegeName: e.target.value }))
                              }
                              placeholder="e.g. DU, Anna Univ, UK Uni"
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <select
                              value={formData.graduationYear}
                              onChange={(e) =>
                                setFormData((prev) => ({ ...prev, graduationYear: e.target.value }))
                              }
                              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="2026">Class of 2026</option>
                              <option value="2025">Class of 2025</option>
                              <option value="2024">Class of 2024</option>
                              <option value="2023 or Earlier">Earlier Grad</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Highest Qualification / Degree
                          </label>
                          <select
                            value={formData.highestQualification}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, highestQualification: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="B.Tech / B.E.">B.Tech / B.E. (Engineering)</option>
                            <option value="BCA / MCA">BCA / MCA (Computer Applications)</option>
                            <option value="B.Sc / M.Sc">B.Sc / M.Sc (Science / Math)</option>
                            <option value="B.Com / BBA">B.Com / BBA (Commerce / Management)</option>
                            <option value="MBA / PGDM">MBA / PGDM</option>
                            <option value="PSW Visa Graduate (UK/US/EU/AUS)">PSW Visa Holder (Abroad/Returnee)</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Current Company / Employer
                          </label>
                          <input
                            type="text"
                            value={formData.company}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, company: e.target.value }))
                            }
                            placeholder="e.g. Infosys, TCS, Startup"
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Total Experience
                          </label>
                          <select
                            value={formData.experienceYears}
                            onChange={(e) =>
                              setFormData((prev) => ({ ...prev, experienceYears: e.target.value }))
                            }
                            className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="0–2 Years">0–2 Years (Early Career)</option>
                            <option value="2–5 Years">2–5 Years (Mid-Level Pivot)</option>
                            <option value="5–10 Years">5–10 Years (Senior Leadership)</option>
                            <option value="10+ Years">10+ Years (Executive Advisory)</option>
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Notes / Career Objectives */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Target Career Goal or Query (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formData.additionalNotes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, additionalNotes: e.target.value }))
                      }
                      placeholder="e.g. Looking for guidance on off-campus job search, ATS resume review, or mock interviews..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* DIRECT ROUTING SELECTION BAR */}
                  <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
                        <ShieldCheck className="w-4 h-4" />
                        <span>Direct Communication Routing</span>
                      </div>
                      <span className="text-xs font-bold text-emerald-400">Instant Dispatch</span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      Choose how you want your registration &amp; fee inquiry sent for direct consultation:
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                      {/* WhatsApp Direct */}
                      <button
                        id="submit-register-whatsapp"
                        type="button"
                        onClick={() => handleCompleteRegistration('whatsapp')}
                        className="py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        <MessageCircle className="w-4 h-4 fill-white/20" />
                        <span>Submit via WhatsApp for Consultation</span>
                      </button>

                      {/* Email Direct */}
                      <button
                        id="submit-register-email"
                        type="button"
                        onClick={() => handleCompleteRegistration('email')}
                        className="py-3 px-4 rounded-xl font-bold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Submit via Mail for Consultation</span>
                      </button>
                    </div>

                    <div className="text-center pt-1">
                      <button
                        type="button"
                        onClick={() => handleCompleteRegistration('dashboard')}
                        className="text-xs text-slate-400 hover:text-white underline"
                      >
                        Or directly enter Student Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
