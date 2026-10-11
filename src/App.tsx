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
import { AddOnServicesSection } from './components/AddOnServicesSection';
import { CourseRegistrationModal } from './components/CourseRegistrationModal';
import { scrollToSection } from './lib/utils';
import { StudentProfile, UserProfession } from './types';

export default function App() {
  const [selectedService, setSelectedService] = useState<string>('Career Guidance');

  // Student Profile State
  const [userProfile, setUserProfile] = useState<StudentProfile | null>(null);

  // Load from localStorage safely on client mount
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

  // Modal states
  const [isPortalModalOpen, setIsPortalModalOpen] = useState(false);
  const [portalMode, setPortalMode] = useState<'login' | 'register'>('login');
  const [portalProfession, setPortalProfession] = useState<UserProfession>('college');
  const [portalPlanId, setPortalPlanId] = useState<string | undefined>(undefined);

  // Course Registration Modal State
  const [isCourseRegOpen, setIsCourseRegOpen] = useState(false);
  const [courseRegProfession, setCourseRegProfession] = useState<UserProfession>('college');
  const [courseRegProgramName, setCourseRegProgramName] = useState<string>('Step-Next career program');

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

  const handleOpenRegisterCourse = (profession: UserProfession, programName: string) => {
    setCourseRegProfession(profession);
    setCourseRegProgramName(programName);
    setIsCourseRegOpen(true);
  };

  const handleLoginSuccess = (profile: StudentProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('maxicareer_student_user', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
    setIsPortalModalOpen(false);
  };

  const handleRegistrationSuccess = (profile: StudentProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('maxicareer_student_user', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
    }
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

      {/* Main Content */}
      <main id="main-content" className="flex-grow">
        {/* 1. Hero Section */}
        <Hero
          onBookConsultation={handleBookConsultation}
          onExploreServices={handleExploreServices}
        />

        {/* 2. Services Section: 4 Specialized Career Programs + Core Services */}
        <ServicesSection
          onSelectService={handleServiceSelect}
          onOpenRegisterProgram={handleOpenRegisterCourse}
        />

        {/* 4. Add-On Services (Resume, LinkedIn, Cover Letter, 1:1 Strategy Call) */}
        <AddOnServicesSection />

        {/* 5. About Section */}
        <AboutSection />

        {/* 6. Why Choose Us */}
        <WhyChooseUs />

        {/* 7. How It Works */}
        <HowItWorks />

        {/* 8. Benefits Section */}
        <BenefitsSection />

        {/* 9. Student Feedback / Testimonials */}
        <Testimonials />

        {/* 10. Call to Action */}
        <CTASection
          onBookConsultation={handleBookConsultation}
          onContactClick={handleBookConsultation}
        />

        {/* 11. Contact / Consultation Form Section */}
        <ContactSection preselectedService={selectedService} />
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Scroll to Top */}
      <ScrollToTop />

      {/* Floating WhatsApp Support Action Button (+91 9789730097) */}
      <WhatsAppButton />

      {/* Course Registration Modal (With direct WhatsApp & Email actions) */}
      <CourseRegistrationModal
        isOpen={isCourseRegOpen}
        onClose={() => setIsCourseRegOpen(false)}
        initialProfession={courseRegProfession}
        initialProgramName={courseRegProgramName}
        currentUserProfile={userProfile}
        onRegistrationSuccess={handleRegistrationSuccess}
        onOpenDashboard={() => setCurrentView('dashboard')}
      />

      {/* Student Portal Modal */}
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
