'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutSection } from './components/AboutSection';
import { ServicesSection } from './components/ServicesSection';
import { WhyChooseUs } from './components/WhyChooseUs';
import { HowItWorks } from './components/HowItWorks';
import { BenefitsSection } from './components/BenefitsSection';
import { Testimonials } from './components/Testimonials';
import { CTASection } from './components/CTASection';
import { ContactSection } from './components/ContactSection';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { WhatsAppButton } from './components/WhatsAppButton';
import { StudentPortalModal } from './components/StudentPortalModal';
import { StudentDashboard } from './components/StudentDashboard';
import { AdminPortal } from './components/AdminPortal';
import { CareerProgramsSection } from './components/CareerProgramsSection';
import { AddOnServicesSection } from './components/AddOnServicesSection';
import { scrollToSection } from './lib/utils';
import { StudentProfile, UserProfession } from './types';
import { DEMO_STUDENT_PROFILES } from './data/portalData';
import { GraduationCap, Briefcase, BookOpen, Sparkles, ArrowRight, ShieldCheck, UserCheck, LogIn, UserPlus } from 'lucide-react';

export default function App() {
  const [selectedService, setSelectedService] = useState<string>('Career Guidance');

  // Student Portal State
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);

  // Load from localStorage on client-side mount safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('maxicareer_student_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserProfile(parsed);
      }
    } catch {
      // safe fallback
    }
  }, []);

  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'admin'>('landing');

  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [portalMode, setPortalMode] = useState<'login' | 'register'>('login');
  const [portalProfession, setPortalProfession] = useState<UserProfession>('college');
  const [portalPlanId, setPortalPlanId] = useState<string | undefined>(undefined);

  const handleOpenStudentPortal = (
    mode: 'login' | 'register' = 'login',
    profession: UserProfession = 'college',
    planId?: string
  ) => {
    setPortalMode(mode);
    setPortalProfession(profession);
    setPortalPlanId(planId);
    setIsPortalModalOpen(true);
  };

  const handleSelectProgram = (profession: UserProfession, planId: string) => {
    handleOpenStudentPortal('register', profession, planId);
  };

  const handleLoginSuccess = (profile: StudentProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('maxicareer_student_user', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    setIsPortalModalOpen(false);
    setCurrentView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    setUserProfile(null);
    try {
      localStorage.removeItem('maxicareer_student_user');
    } catch (e) {
      console.error(e);
    }
    setCurrentView('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookConsultation = () => {
    if (currentView === 'dashboard') {
      setCurrentView('landing');
      setTimeout(() => {
        scrollToSection('#contact', 76);
      }, 100);
      return;
    }

    scrollToSection('#contact', 76);
    setTimeout(() => {
      const input = document.getElementById('contact-name');
      if (input) {
        input.focus();
      }
    }, 400);
  };

  const handleExploreServices = () => {
    if (currentView === 'dashboard') {
      setCurrentView('landing');
      setTimeout(() => {
        scrollToSection('#services', 76);
      }, 100);
      return;
    }
    scrollToSection('#services', 76);
  };

  const handleServiceSelect = (serviceTitle: string) => {
    setSelectedService(serviceTitle);
    scrollToSection('#contact', 76);
    setTimeout(() => {
      const select = document.getElementById('contact-service');
      if (select) {
        select.focus();
      }
    }, 400);
  };

  // If admin portal view is active
  if (currentView === 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] relative flex flex-col selection:bg-blue-600 selection:text-white">
        <AdminPortal
          onBackToSite={() => {
            setCurrentView('landing');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUserProfile={userProfile}
          onStudentLogout={handleLogout}
        />
        <WhatsAppButton />
      </div>
    );
  }

  // If user is viewing the student dashboard
  if (currentView === 'dashboard' && userProfile) {
    return (
      <div className="min-h-screen bg-slate-100 text-[#0F172A] relative flex flex-col selection:bg-blue-600 selection:text-white">
        <StudentDashboard
          profile={userProfile}
          onLogout={handleLogout}
          onReturnToSite={() => setCurrentView('landing')}
          onSwitchProfile={handleLoginSuccess}
        />
        <WhatsAppButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#1E293B] relative flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 
        The background of the website is intentionally plain.
        Animation is restricted to the top hero section (via HeroBackground in Hero.tsx).
      */}

      {/* Sticky Top Navbar */}
      <Navbar
        onBookConsultation={handleBookConsultation}
        onOpenStudentPortal={() => handleOpenStudentPortal('login')}
        onOpenSignIn={() => handleOpenStudentPortal('login')}
        onOpenRegister={() => handleOpenStudentPortal('register')}
        userProfile={userProfile}
        onOpenDashboard={() => setCurrentView('dashboard')}
        onLogout={handleLogout}
        onSwitchProfile={handleLoginSuccess}
        onOpenAdmin={() => {
          setCurrentView('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      {/* Main Sections */}
      <main id="main-content" className="flex-grow">
        {/* 1. Hero Section with animation strictly at the top */}
        <Hero
          onBookConsultation={handleBookConsultation}
          onExploreServices={handleExploreServices}
        />

        {/* 
          [MENTOR DIRECTIVE: KEPT IN CODE, HIDDEN FOR NOW]
          - Student Portal Quick Access Banner (Login / Registration)
          - Career Programs Section
          Students connect directly via WhatsApp and Email for consultation.
        */}
        {false && (
          <>
            {/* Dedicated Student Portal Quick Access Banner */}
            <section className="relative -mt-6 sm:-mt-10 mb-10 z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-900/5">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                  <div className="max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold mb-3">
                      <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Maxicareer Student &amp; Professional Portal</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-[#0F172A] tracking-tight">
                      Access Your Personalized Career Roadmap &amp; Mentorship
                    </h2>
                    <p className="mt-1.5 text-sm text-slate-600">
                      Select your profession to see specialized roadmaps, register to the portal, and submit your message via WhatsApp or Email for customized pricing &amp; 1:1 consultation.
                    </p>
                  </div>

                  {/* Action Buttons for all Categories */}
                  <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                    <button
                      type="button"
                      onClick={() => handleOpenStudentPortal('register', 'school')}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200 hover:border-blue-300 transition-all duration-200"
                    >
                      <BookOpen className="w-4 h-4 text-amber-500" />
                      <span>School Students</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStudentPortal('register', 'college')}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200 hover:border-blue-300 transition-all duration-200"
                    >
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                      <span>College Students</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStudentPortal('register', 'fresher')}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 border border-slate-200 hover:border-purple-300 transition-all duration-200"
                    >
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      <span>Freshers / PSW</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenStudentPortal('register', 'working_professional')}
                      className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-slate-50 hover:bg-blue-50 hover:text-[#2563EB] border border-slate-200 hover:border-blue-300 transition-all duration-200"
                    >
                      <Briefcase className="w-4 h-4 text-emerald-600" />
                      <span>Working Professionals</span>
                    </button>

                    {userProfile ? (
                      <button
                        type="button"
                        onClick={() => setCurrentView('dashboard')}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all duration-200"
                      >
                        <span>Open My Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          id="portal-banner-login-btn"
                          type="button"
                          onClick={() => handleOpenStudentPortal('login')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 transition-all duration-200 shadow-2xs"
                        >
                          <LogIn className="w-4 h-4 text-[#2563EB]" />
                          <span>Login</span>
                        </button>

                        <button
                          id="portal-banner-register-btn"
                          type="button"
                          onClick={() => handleOpenStudentPortal('register')}
                          className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-blue-500/25 transition-all duration-200"
                        >
                          <UserPlus className="w-4 h-4" />
                          <span>Register</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Career Programs & Pricing Grid */}
            <CareerProgramsSection onSelectProgram={handleSelectProgram} />
          </>
        )}

        {/* 2. Add-On Services (4 Columns: Resume, LinkedIn, Cover Letter, 1:1 Strategy Call) */}
        <AddOnServicesSection />

        {/* 4. About Section */}
        <AboutSection />

        {/* 5. Services Section */}
        <ServicesSection onSelectService={handleServiceSelect} />

        {/* 6. Why Choose Us */}
        <WhyChooseUs />

        {/* 7. How It Works */}
        <HowItWorks />

        {/* 8. Benefits Section */}
        <BenefitsSection />

        {/* 9. Student Feedback */}
        <Testimonials />

        {/* 10. Call to Action */}
        <CTASection
          onBookConsultation={handleBookConsultation}
          onContactClick={handleBookConsultation}
        />

        {/* 11. Contact / Consultation Form Section with WhatsApp & Direct Email */}
        <ContactSection preselectedService={selectedService} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Scroll to Top */}
      <ScrollToTop />

      {/* Floating WhatsApp Support Action Button (+91 9789730097) */}
      <WhatsAppButton />

      {/* Student Portal Login, Sign-up, Google Authentication & Registration Modal */}
      <StudentPortalModal
        isOpen={isPortalModalOpen}
        onClose={() => setIsPortalModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={portalMode}
        initialProfession={portalProfession}
        preselectedPlanId={portalPlanId}
      />
    </div>
  );
}
