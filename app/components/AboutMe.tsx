"use client";

import React from 'react';
import { User, Mail, Code, Globe, BookOpen, Quote } from 'lucide-react';

export default function AboutMe() {
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
                {/* Thay bằng <img src="/path-to-your-photo.jpg" alt="Profile" className="w-full h-full object-cover" /> */}
              </div>
            </div>
          </div>
          
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900">Tên</h1>
            <p className="text-amber-600 font-semibold uppercase tracking-wider text-sm">Title</p>
            <div className="flex justify-center gap-4 pt-4">
              <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                <Code size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                <Mail size={20} />
              </a>
              <a href="#" className="p-2 bg-slate-100 rounded-full text-slate-600 hover:bg-amber-100 hover:text-amber-600 transition-colors">
                <Globe size={20} />
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Short Bio */}
        <section className="md:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-200">
            <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900 mb-4">
              <BookOpen size={20} className="text-amber-500" />
              Tiểu sử
            </h2>
            <ul className="space-y-4 text-slate-600 text-sm">
              <li className="flex gap-3">
                <span className="font-bold text-slate-900">Vị trí:</span>
                Việt Nam
              </li>
              
            </ul>
          </div>
        </section>

        {/* Story */}
        <section className="md:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 relative">
            <Quote size={48} className="absolute top-4 right-4 text-slate-100" />
            <h2 className="text-2xl font-bold text-slate-900 mb-6 border-b-2 border-amber-400 inline-block pb-1">
              Câu chuyện của mình
            </h2>
            <div className="prose prose-slate max-w-none text-slate-600 space-y-4 leading-relaxed">
              

            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
