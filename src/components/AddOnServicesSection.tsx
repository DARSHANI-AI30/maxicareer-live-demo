import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ADD_ON_SERVICES, OFFICIAL_PHONE, OFFICIAL_PHONE_DIGITS, OFFICIAL_EMAIL, generateAddOnWhatsAppUrl } from '../data/portalData';
import { AddOnService } from '../types';
import { Check, Clock, X, MessageCircle, Mail, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { EmailModal, EmailModalData } from './EmailModal';

interface AddOnServicesSectionProps {
  onBuyService?: (service: AddOnService) => void;
}

export const AddOnServicesSection: React.FC<AddOnServicesSectionProps> = ({
  onBuyService,
}) => {
  const [selectedService, setSelectedService] = useState<AddOnService | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+91 ');
  const [customerEmail, setCustomerEmail] = useState('');
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailModalData, setEmailModalData] = useState<EmailModalData | null>(null);

  const handleOpenBuyModal = (service: AddOnService) => {
    if (onBuyService) {
      onBuyService(service);
      return;
    }
    setSelectedService(service);
  };

  const handleDirectWhatsApp = (service: AddOnService) => {
    const text = `*Maxicareer Add-On Service Inquiry* ⚡\n----------------------------------------\n*Service:* ${service.title}\n*Turnaround:* ${service.deliveryTime}\nHello Maxicareer Team, I am interested in *${service.title}*. Please share pricing and how to proceed!`;
    window.open(`https://wa.me/${OFFICIAL_PHONE_DIGITS}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleDirectEmail = (service: AddOnService, name?: string) => {
    setEmailModalData({
      recipient: OFFICIAL_EMAIL,
      subject: `Maxicareer Service Inquiry: ${service.title}`,
      body: `Dear Maxicareer Team,\n\nI am interested in your ${service.title} service (${service.deliveryTime}).\n${
        name ? `Name: ${name}\n` : ''
      }${customerPhone ? `Phone: ${customerPhone}\n` : ''}${
        customerEmail ? `Email: ${customerEmail}\n` : ''
      }\nPlease provide details on pricing tiers, requirements, and next steps.\n\nThank you!`,
      title: `Inquire: ${service.title}`,
      subtitle: `Direct to ${OFFICIAL_EMAIL}`,
      category: service.title,
    });
    setEmailModalOpen(true);
  };

  return (
    <section id="addon-services" className="py-20 bg-white relative border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Targeted Career Boosters</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-[#0F172A] tracking-tight">
            Specialized Career Services
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
            Need focused deliverables? Connect with our mentors for resume writing, LinkedIn optimization, cover letters, and private 1:1 strategy calls. Contact directly via WhatsApp or Email.
          </p>
        </div>

        {/* 4 Cards in Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ADD_ON_SERVICES.map((service, index) => {
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-300 transition-all duration-300"
              >
                <div>
                  {/* Card Title */}
                  <h3 className="text-base sm:text-lg font-bold text-[#0F172A] min-h-[48px] line-clamp-2">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-600 italic leading-relaxed min-h-[52px] my-4">
                    {service.description}
                  </p>

                  {/* Consultation / Booking Action Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenBuyModal(service)}
                    className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-[#2563EB] hover:bg-[#1D4ED8] shadow-md shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 mb-2"
                  >
                    <span>Request Service</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Direct Contact Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => handleDirectWhatsApp(service)}
                      className="py-2 px-2.5 rounded-lg text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-1.5 transition-colors"
                      title="Inquire via WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDirectEmail(service)}
                      className="py-2 px-2.5 rounded-lg text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center justify-center gap-1.5 transition-colors"
                      title="Inquire via Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email</span>
                    </button>
                  </div>
                </div>

                {/* Footer Delivery / Availability Badge */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center text-xs font-medium text-slate-600">
                  {service.isScheduleBased ? (
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <span>⏳</span>
                      <span className="italic">{service.deliveryTime}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-slate-600">
                      <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-emerald-100 text-emerald-700 text-[10px] font-black">
                        ✓
                      </span>
                      <span className="italic">{service.deliveryTime}</span>
                    </span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Direct Inquiry & Booking Modal for Add-On Service */}
      <AnimatePresence>
        {selectedService && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedService(null)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="pr-6">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  Service Consultation
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                  {selectedService.title}
                </h3>
                <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Clock className="w-3.5 h-3.5 text-blue-600" />
                  <span>Turnaround: {selectedService.deliveryTime}</span>
                </div>
              </div>

              <div className="my-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <div className="font-bold text-slate-800 mb-1">What&apos;s Included:</div>
                {selectedService.features?.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>

              {/* Quick Customer Info */}
              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+91 9789730097"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons: WhatsApp and Email */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const text = `*Maxicareer Service Inquiry* ⚡\n----------------------------------------\n*Service:* ${selectedService.title}\n*Turnaround:* ${selectedService.deliveryTime}\n${customerName ? `*Customer Name:* ${customerName}\n` : ''}${customerPhone ? `*Phone:* ${customerPhone}\n` : ''}----------------------------------------\nHello Maxicareer Team, I would like to consult for *${selectedService.title}*. Please share the pricing details, fee structure, and consultation availability!`;
                    window.open(`https://wa.me/${OFFICIAL_PHONE_DIGITS}?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-white/20" />
                  <span>Inquire via WhatsApp ({OFFICIAL_PHONE})</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectEmail(selectedService, customerName)}
                  className="w-full py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all flex items-center justify-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  <span>Send Mail ({OFFICIAL_EMAIL})</span>
                </button>
              </div>

              <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-slate-500">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Immediate response from our senior mentors</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Interactive Email Dispatch Modal */}
      <EmailModal
        isOpen={emailModalOpen}
        data={emailModalData}
        onClose={() => setEmailModalOpen(false)}
      />
    </section>
  );
};
