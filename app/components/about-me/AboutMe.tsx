"use client";

import React from 'react';
import { User, Mail, Code, Globe, BookOpen, Quote, Trophy } from 'lucide-react';
import { ABOUT_ME_CONTENT } from './constants';

const IconMap = {
  Code,
  Mail,
  Globe,
};

export default function AboutMe() {
  const { name, title, socialLinks, bio, personalBest, story } = ABOUT_ME_CONTENT;

  return (
    <div className="max-w-4xl mx-auto py-8 space-y-12">
      {/* Profile Header */}
      <section className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
        <div className="h-32 bg-amber-400"></div>
        <div className="px-6 pb-8">
          <div className="relative flex justify-center -mt-16 mb-6">
            <div className="p-1 bg-white rounded-full shadow-lg">
              <div className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white flex items-center justify-center overflow-hidden">
                <User size={64} className="text-slate-400" />
                {/* <img src="/path-to-your-photo.jpg" alt={name} className="w-full h-full object-cover" /> */}
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">{name}</h1>
            <p className="text-amber-600 font-semibold uppercase tracking-wider text-sm">{title}</p>
            <div className="flex justify-center gap-4 pt-4">
              {socialLinks.map((link) => {
                const Icon = IconMap[link.icon as keyof typeof IconMap] || Globe;
                return (
                  <a 
                    key={link.id}
                    href={link.url} 
                    className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Icon size={20} />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-8">
          {/* Short Bio */}
          <section className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <BookOpen size={20} className="text-amber-500" />
              Tiểu sử
            </h2>
            <ul className="space-y-4 text-slate-600 text-sm">
              {bio.map((item, idx) => (
                <li key={idx} className="flex gap-3 border-b border-slate-50 pb-2 last:border-0">
                  <span className="font-bold text-slate-900 min-w-[80px]">{item.label}:</span>
                  <span>{item.value}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Personal Best */}
          <section className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <Trophy size={20} className="text-amber-500" />
              Kỷ lục cá nhân
            </h2>
            <ul className="space-y-4 text-slate-600 text-sm">
              {personalBest.map((item, idx) => (
                <li key={idx} className="flex justify-between items-center border-b border-slate-50 pb-2 last:border-0">
                  <span className="font-semibold text-slate-900">{item.label}</span>
                  <span className="text-emerald-600 font-bold">{item.value}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Story */}
        <section className="md:col-span-2">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 relative h-full">
            <Quote size={48} className="absolute top-4 right-4 text-slate-100" />
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b-2 border-amber-400 inline-block pb-1">
              Câu chuyện của mình
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed">
              {story.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
