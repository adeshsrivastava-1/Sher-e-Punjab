import React, { useState } from 'react';
import { X, Calendar, Clock, Users, MapPin, CheckCircle, Send, Sparkles } from 'lucide-react';
import { ReservationData, RestaurantConfig } from '../types';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RestaurantConfig;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  isOpen,
  onClose,
  config
}) => {
  const [formData, setFormData] = useState<ReservationData>({
    name: '',
    phone: '',
    email: '',
    date: new Date().toISOString().split('T')[0],
    time: '19:30',
    guests: 2,
    seatingArea: 'garden-terrace',
    specialRequests: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in your name and phone number.');
      return;
    }
    setIsSubmitted(true);
  };

  const handleWhatsAppReservation = () => {
    const areaLabels = {
      'garden-terrace': 'Garden Terrace (Open Air)',
      'main-dining': 'Main Dining Room',
      'private-lounge': 'Private Lounge'
    };

    const text = `*TABLE RESERVATION - Sher E Punjab Cumbayá*
----------------------------------
• *Name:* ${formData.name}
• *Phone:* ${formData.phone}
• *Email:* ${formData.email || 'N/A'}
• *Date:* ${formData.date}
• *Time:* ${formData.time}
• *Guests:* ${formData.guests} Persons
• *Seating Area:* ${areaLabels[formData.seatingArea]}
• *Special Requests:* ${formData.specialRequests || 'None'}
----------------------------------
_Please confirm my table reservation. Thank you!_`;

    const encoded = encodeURIComponent(text);
    const targetPhone = config.whatsappNumber.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${targetPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div
        className="bg-[#FAF6F0] rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-[#E5982A]/40 shadow-2xl relative text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#1C3A27] text-white p-6 rounded-t-2xl relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#E5982A] uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4 text-[#C23B22]" />
            <span>Table Reservation</span>
          </div>
          <h2 className="font-serif text-2xl font-bold">Sher E Punjab Cumbayá</h2>
          <p className="text-xs text-white/80 mt-1">
            Join us in Cumbayá for an authentic Indian & Fusion dining experience.
          </p>
        </div>

        {/* Modal Content */}
        <div className="p-6 sm:p-8">
          {isSubmitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 mx-auto flex items-center justify-center shadow-inner">
                <CheckCircle className="w-10 h-10" />
              </div>

              <h3 className="font-serif text-2xl font-bold text-[#1C3A27]">
                Reservation Request Received!
              </h3>

              <p className="text-xs text-[#6B5E54] max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.name}</strong>. We have registered your reservation request for <strong>{formData.guests} guests</strong> on <strong>{formData.date} at {formData.time}</strong>.
              </p>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={handleWhatsAppReservation}
                  className="w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1EBE5B] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Confirm Instantly via WhatsApp</span>
                </button>

                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    onClose();
                  }}
                  className="text-xs text-[#6B5E54] hover:underline"
                >
                  Close Window
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mateo Benítez"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-sm text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                    WhatsApp Phone *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+593 98 765 4321"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 bg-[#FFFDF9] text-sm text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                    Guests *
                  </label>
                  <select
                    value={formData.guests}
                    onChange={(e) => setFormData({ ...formData, guests: Number(e.target.value) })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15].map((n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? 'Guest' : 'Guests'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Seating Area Selection */}
              <div>
                <label className="block text-xs font-semibold text-[#2B231D] mb-2">
                  Preferred Seating Atmosphere
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { id: 'garden-terrace', label: 'Garden Terrace', icon: '🌿' },
                    { id: 'main-dining', label: 'Main Dining', icon: '🕯️' },
                    { id: 'private-lounge', label: 'Private Lounge', icon: '✨' },
                  ].map((area) => (
                    <button
                      type="button"
                      key={area.id}
                      onClick={() => setFormData({ ...formData, seatingArea: area.id as any })}
                      className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                        formData.seatingArea === area.id
                          ? 'bg-[#1C3A27] text-white border-[#1C3A27] shadow-sm'
                          : 'bg-[#FFFDF9] text-[#2B231D] border-gray-200 hover:border-[#1C3A27]'
                      }`}
                    >
                      <span>{area.icon}</span>
                      <span>{area.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Special Requests */}
              <div>
                <label className="block text-xs font-semibold text-[#2B231D] mb-1">
                  Special Instructions / Dietary Allergies
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Birthday celebration, severe nut allergy, quiet table..."
                  value={formData.specialRequests}
                  onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 bg-[#FFFDF9] text-xs text-[#2B231D] focus:ring-2 focus:ring-[#C23B22] focus:outline-none"
                />
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl bg-[#C23B22] hover:bg-[#A52F1A] text-white font-bold text-sm shadow-lg active:scale-95 transition-all"
                >
                  Submit Reservation
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
};
