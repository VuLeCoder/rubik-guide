"use client";

import { Analytics } from "@vercel/analytics/next"
import React, { useState } from 'react';
import Image from 'next/image';
import rubikLogo from '@/public/logo_rubik.jpg';
import { Menu, X, Box, BookOpen, Timer as TimerIcon, User } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/app/context/LanguageContext';

import dynamic from 'next/dynamic';

const Simulator = dynamic(() => import('./components/simulator/Simulator'), { 
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center text-slate-400 font-bold animate-pulse">Loading Simulator...</div>
});
const Learn = dynamic(() => import('./components/learn/Learn'), { 
  ssr: false,
  loading: () => <div className="h-96 flex items-center justify-center text-slate-400 font-bold animate-pulse">Loading Lessons...</div>
});
const Timer = dynamic(() => import('./components/Timer'), { ssr: false });
const AboutMe = dynamic(() => import('./components/about-me/AboutMe'), { ssr: false });

function MainApp() {
  const [activeTab, setActiveTab] = useState('about');
  const [isOpen, setIsOpen] = useState(false);
  const { language, setLanguage, t } = useLanguage();

  const navItems = [
    { id: 'simulator', name: t.nav.simulator, icon: <Box size={18} /> },
    { id: 'learn', name: t.nav.learn, icon: <BookOpen size={18} /> },
    { id: 'timer', name: t.nav.timer, icon: <TimerIcon size={18} /> },
    { id: 'about', name: t.nav.about, icon: <User size={18} /> },
  ];

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-slate-900 font-sans">
      {/* ... (nav stays same) ... */}
      <nav className="bg-[#FFFBF0] border-b border-slate-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              {/* <img src="logo_rubik.jpg" alt="RubikCommunity Logo" className="h-12 w-auto" /> */}
              <Image 
                src={rubikLogo} 
                alt="RubikCommunity Logo" 
                className="h-12 w-auto" 
                priority
              />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-all ${
                      activeTab === item.id 
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' 
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>

              {/* Language Switcher */}
              <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-100">
                <button
                  onClick={() => setLanguage('vi')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    language === 'vi' 
                      ? 'bg-white text-slate-950 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  VI
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition-all ${
                    language === 'en' 
                      ? 'bg-white text-slate-950 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  EN
                </button>
              </div>
            </div>

            {/* Mobile Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-600 hover:text-slate-950 hover:bg-slate-100 focus:outline-none"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden bg-[#FFFBF0] border-b border-slate-300 px-2 pt-2 pb-4 space-y-1 shadow-lg">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={`flex w-full items-center gap-3 px-3 py-4 rounded-md text-base font-bold transition-colors ${
                  activeTab === item.id ? 'bg-amber-400 text-slate-950' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {item.icon}
                {item.name}
              </button>
            ))}

            {/* Mobile Language Switcher */}
            <div className="flex items-center justify-between px-3 py-4 border-t border-slate-200 mt-2">
              <span className="text-sm font-bold text-slate-600">{t.nav.language}</span>
              <div className="flex items-center border border-slate-300 rounded-lg p-0.5 bg-slate-100">
                <button
                  onClick={() => setLanguage('vi')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    language === 'vi' 
                      ? 'bg-white text-slate-950 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  Tiếng Việt
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${
                    language === 'en' 
                      ? 'bg-white text-slate-950 shadow-sm' 
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  English
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 md:px-10">
        <div className="transition-all duration-300">
          {activeTab === 'simulator' && <Simulator />}
          {activeTab === 'learn' && <Learn />}
          {activeTab === 'timer' && <Timer />}
          {activeTab === 'about' && <AboutMe />}
        </div>
      </main>

      <footer className="text-center py-8 md:py-10 border-t border-slate-300 text-slate-600 text-[10px] md:text-xs font-medium px-4">
        {t.footer}
      </footer>
      <Analytics />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <MainApp />
    </LanguageProvider>
  );
}

