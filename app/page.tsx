"use client";

import React, { useState } from 'react';
import { Menu, X, Box, BookOpen, Timer as TimerIcon } from 'lucide-react';

import Learn from './components/Learn'; 
import Timer from './components/Timer';
import Simulator from './components/Simulator';

export default function Home() {
  const [activeTab, setActiveTab] = useState('simulator');
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { id: 'simulator', name: 'Simulator', icon: <Box size={18} /> },
    { id: 'learn', name: 'Learn', icon: <BookOpen size={18} /> },
    { id: 'timer', name: 'Timer', icon: <TimerIcon size={18} /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'simulator':
        return <Simulator />;
      case 'timer':
        return <Timer />;
      case 'learn':
      default:
        return <Learn />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF0] text-slate-900 font-sans">
      {/* NAVIGATION BAR */}
      <nav className="bg-[#FFFBF0] border-b border-slate-300 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <img src="logo_rubik.jpg" alt="RubikCommunity Logo" className="h-12 w-auto" />
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
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
          <div className="md:hidden bg-[#FFFBF0] border-b border-slate-300 px-2 pt-2 pb-3 space-y-1 shadow-lg">
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
          </div>
        )}
      </nav>

      <main className="max-w-5xl mx-auto p-6 md:p-10">
        <div className="transition-all duration-500">
          {renderContent()}
        </div>
      </main>

      <footer className="text-center py-10 border-t border-slate-300 text-slate-600 text-xs font-medium">
        © 2026 RubikCommunity • Connecting Cubes, Building Community
      </footer>
    </div>
  );
}
