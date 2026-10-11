import React, { useState } from 'react';
import { Compass, Code2, Users, FileText, ArrowRight, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { SectionHeading } from './SectionHeading';
import { ServiceDetailModal } from './ServiceDetailModal';
import { ServiceItem } from '../types';
import { ServicesBackground } from './SectionBackgrounds';

interface ServicesSectionProps {
  onSelectService: (serviceTitle: string) => void;
}

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  const services: ServiceItem[] = [
    {
      id: 'career-guidance',
      title: 'Career Guidance',
      shortDescription:
        'Understand your strengths, explore high-growth opportunities, and map a personalized roadmap for your career journey.',
      fullDescription:
        'Comprehensive career mapping tailored to your strengths, academic background, and personal ambitions. We eliminate confusion by analyzing growth sectors, defining clear trajectories, and formulating an actionable milestone plan.',
      features: [
        'Personalized strength & interest evaluation',
        'Industry career path mapping (0 to 5 year forecast)',
        'Academic vs. industry transition strategies',
        'Actionable quarterly milestones checklist',
      ],
      deliverables: [
        'Custom 12-Month Career Blueprint Document',
        'Role-specific competency checklist',
        'Recommended target certifications and credentials',
      ],
      iconName: 'Compass',
      badge: 'Foundation',
    },
    {
      id: 'skill-development',
      title: 'Skill Development',
      shortDescription:
        'Learn practical technical and professional skills aligned with current industry expectations and modern tools.',
      fullDescription:
        'Avoid outdated tutorials. We curate structured skill development roadmaps based on what modern tech, business, and creative companies actively demand. Focus your study time on high-leverage tools, methodologies, and frameworks.',
      features: [
        'Curated hands-on project briefs with real codebases',
        'Tooling mastery (Git, Cloud, modern tech stacks)',
        'Communication & executive presentation skills',
        'Code and project architecture critiques',
      ],
      deliverables: [
        'Industry-grade portfolio project templates',
        'Curated learning resources & practice modules',
        'Peer and mentor review checklists',
      ],
      iconName: 'Code2',
      badge: 'Practical Skills',
    },
    {
      id: 'one-to-one-mentorship',
      title: 'One-to-One Mentorship',
      shortDescription:
        'Connect directly with experienced mentors who provide personalized advice, direct feedback, and career accountability.',
      fullDescription:
        'Direct, unfiltered access to seasoned mentors who have walked the path you are on. Get regular check-ins, targeted feedback on your work, strategic career answers, and continuous support when dealing with career decisions.',
      features: [
        'Dedicated 1-on-1 video sessions with active practitioners',
        'Goal tracking and weekly accountability prompts',
        'Direct messaging for pressing career doubts',
        'Constructive, honest feedback on your projects',
      ],
      deliverables: [
        'Post-session recap notes and action commitments',
        'Priority access to mentor office hours',
        'Networking and introduction guidelines',
      ],
      iconName: 'Users',
      badge: 'High Impact',
    },
    {
      id: 'interview-resume-preparation',
      title: 'Interview and Resume Preparation',
      shortDescription:
        'Master behavioral and technical interviews while crafting an ATS-optimized resume that gets noticed by recruiters.',
      fullDescription:
        'Turn your skills into real career opportunities. We optimize your resume for applicant tracking systems (ATS), coach you through behavioral and technical interview scenarios, polish your professional portfolio, and guide your negotiation strategy.',
      features: [
        'ATS-optimized resume and LinkedIn profile review',
        'Simulated mock interviews with recorded critiques',
        'Portfolio website and project presentation polish',
        'Offer evaluation and negotiation advisory',
      ],
      deliverables: [
        'Polished modern resume in multiple formats',
        'Personal interview answer bank with STAR framework',
        'Tailored outreach templates for recruiters',
      ],
      iconName: 'FileText',
      badge: 'Job Ready',
    },
  ];

  const getIcon = (name: string) => {
    switch (name) {
      case 'Compass':
        return Compass;
      case 'Code2':
        return Code2;
      case 'Users':
        return Users;
      case 'FileText':
      default:
        return FileText;
    }
  };

  return (
    <section id="services" className="py-20 lg:py-28 bg-[#F8FAFC] relative overflow-hidden">
      {/* Background Subtle Elements */}
      <ServicesBackground />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          badge="What We Offer"
          title="Comprehensive"
          highlight="Career Services"
          description="Tailored guidance, modern skill programs, and dedicated mentorship designed to support you at every milestone of your career."
        />

        {/* 4 Cards in Responsive Grid: 4 columns on desktop, 2 on tablet, 1 on mobile */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
          {services.map((service, index) => {
            const Icon = getIcon(service.iconName);
            return (
              <motion.div
                key={service.id}
                id={`service-card-${service.id}`}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.45, delay: index * 0.1, ease: 'easeOut' }}
                className="group flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 relative h-full"
              >
                <div>
                  {/* Top Bar: Icon + Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB] group-hover:bg-[#2563EB] group-hover:text-white group-hover:scale-110 transition-all duration-300 shadow-xs">
                      <Icon className="w-6 h-6 transition-transform duration-300" />
                    </div>
                    <span className="text-[11px] font-bold text-[#2563EB] bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full">
                      {service.badge}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-[#0F172A] mb-3 group-hover:text-[#2563EB] transition-colors duration-200">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 border-t border-slate-100 mt-auto">
                  <button
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] group-hover:translate-x-0.5 transition-all focus:outline-none"
                  >
                    <span>Learn More</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Service Detail Modal */}
      {selectedService && (
        <ServiceDetailModal
          service={selectedService}
          onClose={() => setSelectedService(null)}
          onBookService={(title) => {
            setSelectedService(null);
            onSelectService(title);
          }}
        />
      )}
    </section>
  );
};
