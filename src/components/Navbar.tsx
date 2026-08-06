import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Menu as MenuIcon, X, ShieldCheck, MapPin } from 'lucide-react';
import { CartItem } from '../types';

interface NavbarProps {
  cartItems: CartItem[];
  onOpenCart: () => void;
  onOpenReservation: () => void;
  onOpenAdminPortal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItems,
  onOpenCart,
  onOpenReservation,
  onOpenAdminPortal
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      id="main-navbar"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#FAF6F0]/95 backdrop-blur-md shadow-md py-3 border-b border-[#E5982A]/20'
          : 'bg-gradient-to-b from-[#2B231D]/80 via-[#2B231D]/40 to-transparent text-white py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#hero"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('hero');
          }}
          className="group flex items-center gap-3 text-left"
        >
          <div className="w-10 h-10 rounded-full bg-[#C23B22] p-0.5 shadow-inner group-hover:scale-105 transition-transform overflow-hidden border border-[#E5982A]">
            <img src="/favicon.svg" alt="Sher E Punjab Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div>
            <span
              className={`block font-serif text-xl sm:text-2xl font-bold tracking-tight leading-none ${
                isScrolled ? 'text-[#1C3A27]' : 'text-white'
              }`}
            >
              Sher E Punjab
            </span>
            <span
              className={`text-[10px] tracking-widest uppercase font-sans font-medium block mt-0.5 ${
                isScrolled ? 'text-[#C23B22]' : 'text-[#E5982A]'
              }`}
            >
              Quito • Fusion Indio-Andina
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <button
            onClick={() => scrollToSection('our-story')}
            className={`transition-colors hover:text-[#C23B22] ${
              isScrolled ? 'text-[#2B231D]' : 'text-white/90'
            }`}
          >
            Our Story
          </button>
          <button
            onClick={() => scrollToSection('fusion-highlights')}
            className={`transition-colors hover:text-[#C23B22] ${
              isScrolled ? 'text-[#2B231D]' : 'text-white/90'
            }`}
          >
            Signature Dishes
          </button>
          <button
            onClick={() => scrollToSection('menu-section')}
            className={`transition-colors hover:text-[#C23B22] ${
              isScrolled ? 'text-[#2B231D]' : 'text-white/90'
            }`}
          >
            Menu
          </button>
          <button
            onClick={() => scrollToSection('ingredient-map')}
            className={`transition-colors hover:text-[#C23B22] ${
              isScrolled ? 'text-[#2B231D]' : 'text-white/90'
            }`}
          >
            Ingredient Map
          </button>
          <button
            onClick={() => scrollToSection('footer-location')}
            className={`transition-colors hover:text-[#C23B22] flex items-center gap-1 ${
              isScrolled ? 'text-[#2B231D]' : 'text-white/90'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-[#C23B22]" /> Cumbayá
          </button>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Reservation Button */}
          <button
            onClick={onOpenReservation}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1C3A27] text-white hover:bg-[#2A5239] transition-all text-xs sm:text-sm font-medium shadow-sm active:scale-95"
          >
            <Calendar className="w-4 h-4 text-[#E5982A]" />
            <span>Reserve Table</span>
          </button>

          {/* Cart Icon Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className={`relative p-2.5 rounded-full transition-all active:scale-95 ${
              isScrolled
                ? 'bg-[#FAF6F0] text-[#2B231D] hover:bg-[#E5982A]/20 border border-[#E5982A]/30'
                : 'bg-white/20 backdrop-blur-md text-white hover:bg-white/30'
            }`}
            aria-label="Open Order Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalCartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#C23B22] text-white text-[11px] font-bold flex items-center justify-center animate-bounce shadow-md">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-lg transition-colors ${
              isScrolled ? 'text-[#2B231D]' : 'text-white'
            }`}
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#FAF6F0] border-b border-[#E5982A]/30 px-4 py-6 shadow-xl space-y-4 text-center animate-fadeIn">
          <button
            onClick={() => scrollToSection('our-story')}
            className="block w-full py-2 text-[#2B231D] font-medium text-lg border-b border-gray-200/50"
          >
            Our Story
          </button>
          <button
            onClick={() => scrollToSection('fusion-highlights')}
            className="block w-full py-2 text-[#2B231D] font-medium text-lg border-b border-gray-200/50"
          >
            Signature Dishes
          </button>
          <button
            onClick={() => scrollToSection('menu-section')}
            className="block w-full py-2 text-[#2B231D] font-medium text-lg border-b border-gray-200/50"
          >
            Menu
          </button>
          <button
            onClick={() => scrollToSection('ingredient-map')}
            className="block w-full py-2 text-[#2B231D] font-medium text-lg border-b border-gray-200/50"
          >
            Ingredient Map
          </button>
          <button
            onClick={() => scrollToSection('footer-location')}
            className="block w-full py-2 text-[#2B231D] font-medium text-lg border-b border-gray-200/50"
          >
            Location & Hours
          </button>

          <div className="pt-2 flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenReservation();
              }}
              className="w-full py-3 rounded-xl bg-[#1C3A27] text-white font-medium flex items-center justify-center gap-2"
            >
              <Calendar className="w-5 h-5 text-[#E5982A]" />
              Reserve a Table
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdminPortal();
              }}
              className="text-xs text-[#6B5E54] hover:text-[#C23B22] flex items-center justify-center gap-1 pt-2"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Management Access
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
