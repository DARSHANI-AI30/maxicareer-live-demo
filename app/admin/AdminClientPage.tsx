'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AdminPortal } from '@/src/components/AdminPortal';
import { StudentProfile } from '@/src/types';

export default function AdminClientPage() {
  const router = useRouter();
  const [studentUser, setStudentUser] = useState<StudentProfile | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('maxicareer_student_user');
      if (stored) {
        setStudentUser(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleBackToSite = () => {
    router.push('/');
  };

  const handleStudentLogout = () => {
    try {
      localStorage.removeItem('maxicareer_student_user');
    } catch {}
    setStudentUser(null);
  };

  return (
    <AdminPortal
      onBackToSite={handleBackToSite}
      currentUserProfile={studentUser}
      onStudentLogout={handleStudentLogout}
    />
  );
}
