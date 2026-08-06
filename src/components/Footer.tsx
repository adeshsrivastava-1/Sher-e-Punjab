import React, { useState } from 'react';
import { MapPin, Phone, Clock, Shield } from 'lucide-react';
import { RestaurantConfig } from '../types';

interface FooterProps {
  config: RestaurantConfig;
  onOpenAdminPortal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ config, onOpenAdminPortal }) => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      setNewsletterEmail('');
    }
  };

  return (
    <footer id="footer-location" className="bg-[#1C3A27] text-white pt-16 pb-12 border-t border-[#E5982A]/30 relative overflow-hidden">
      
      {/* Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pb-12 border-b border-white/10 text-left">
          
          {/* Col 1: Brand Info & Hours */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#C23B22] p-0.5 overflow-hidden border border-[#E5982A] shadow-inner">
                <img src="/favicon.svg" alt="Sher E Punjab Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#FAF6F0]">
                {config.restaurantName}
              </h3>
            </div>

            <p className="text-xs text-white/80 leading-relaxed max-w-sm">
              Authentic Indian Heritage meets Vibrant Ecuadorian Flavor. High-altitude tandoori delights, coastal encocado biryanis, and artisanal beverages in Cumbayá.
            </p>

            <div className="pt-2 space-y-2 text-xs text-white/90">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-[#E5982A] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#E5982A] block">Operating Hours:</span>
                  <span>Weekdays: {config.openingHours.weekdays}</span>
                  <span className="block">Weekends: {config.openingHours.weekends}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Phone className="w-4 h-4 text-[#C23B22]" />
                <a
                  href={`https://wa.me/${config.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline font-semibold text-[#E5982A]"
                >
                  WhatsApp: +{config.whatsappNumber}
                </a>
              </div>
            </div>
          </div>

          {/* Col 2: Embedded Google Map & Exact Location Details */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#E5982A] flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C23B22]" />
                <span>Exact Location (La Mariscal, Quito)</span>
              </span>
              <a
                href={config.googleMapsCidUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] text-[#E5982A] hover:text-white underline font-medium"
              >
                Open in Google Maps ↗
              </a>
            </div>

            {/* Google Map iframe pointing to Juan León Mera N26-77 y La Pinta, Quito */}
            <div className="w-full h-44 rounded-2xl overflow-hidden border border-white/20 shadow-md bg-gray-800">
              <iframe
                title="Sher E Punjab Quito Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.7891234!2d-78.4897193!3d-0.1989841!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91d59a6c5488b57f%3A0x4ae3c72657a8d207!2sSher%20E%20Punjab!5e0!3m2!1sen!2sec!4v1700000000000!5m2!1sen!2sec"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="text-xs text-white/90 leading-relaxed font-medium bg-white/5 p-2.5 rounded-xl border border-white/10">
              <p className="font-bold text-[#E5982A]">Sher E Punjab Quito:</p>
              <p>{config.address}, {config.city}</p>
            </div>
          </div>

          {/* Col 3: Newsletter & Direct Links */}
          <div className="lg:col-span-3 space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#E5982A] block">
              Fusion Gastronomy Club
            </span>

            <p className="text-xs text-white/80">
              Subscribe to receive invitations to special chef tasting dinners & seasonal fusion menus.
            </p>

            {subscribed ? (
              <div className="bg-white/10 p-3 rounded-xl text-xs text-[#E5982A] font-semibold">
                ✓ Thank you for subscribing!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="space-y-2">
                <input
                  type="email"
                  required
                  placeholder="Your Email Address"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/10 text-white placeholder-white/50 text-xs border border-white/20 focus:outline-none focus:ring-1 focus:ring-[#E5982A]"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-[#C23B22] hover:bg-[#A52F1A] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  Join Tasting List
                </button>
              </form>
            )}
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} Sher E Punjab. All Rights Reserved. Quito, Ecuador.</p>

          <button
            onClick={onOpenAdminPortal}
            className="flex items-center gap-1.5 text-white/50 hover:text-[#E5982A] transition-colors cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Management Portal (/management-portal-sep)</span>
          </button>
        </div>

      </div>
    </footer>
  );
};
