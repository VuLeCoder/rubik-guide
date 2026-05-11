"use client";
import React from 'react';

const steps = [
  { id: 1, title: "B1: Dấu cộng trắng", content: "Làm bông hoa cúc tâm vàng cạnh trắng. Sau đó xoay từng cạnh về đúng tâm và F2.", formula: "F2", color: "border-slate-400" },
  { id: 2, title: "B2: Tầng 1", content: "Đưa các góc về đúng vị trí. Hướng mặt trắng xuống dưới.", formula: "U R U' R' | R U R' | R U2 R'", color: "border-blue-600" },
  { id: 3, title: "B3: Tầng 2", content: "Tìm viên cạnh không có màu vàng ở tầng 3 và đưa về tầng 2.", formula: "", color: "border-green-600" },
  { id: 4, title: "B4: Dấu cộng vàng", content: "Tạo dấu cộng vàng. Có 3 trường hợp: Chấm, chữ L, đường thẳng.", formula: "F R U R' U' F'", color: "border-yellow-500" },
  { id: 5, title: "B5: Mặt vàng", content: "Hoàn thiện mặt trên cùng màu vàng.", formula: "R U R' U R U2 R'", color: "border-orange-500" },
  { id: 6, title: "B6: Hoán vị", content: "Sắp xếp lại các góc và cạnh cuối cùng.", formula: "R U R' F' R U R' U' R' F R2 U' R'", color: "border-red-600" },
];

export default function Learn() {
  return (
    <div className="space-y-8 animate-in slide-in-from-bottom duration-700">
      <h2 className="text-3xl font-extrabold text-center text-slate-900 mb-10">Lộ trình 6 bước cơ bản</h2>
      <div className="grid gap-6 md:grid-cols-2">
        {steps.map((step) => (
          <div key={step.id} className={`bg-white p-6 rounded-2xl border border-slate-200 border-l-8 ${step.color} shadow-md hover:shadow-lg transition-shadow`}>
            <span className="text-sm font-mono text-slate-500 uppercase tracking-widest font-semibold">Step {step.id}</span>
            <h3 className="text-xl text-slate-900 font-extrabold mt-1 mb-3">{step.title}</h3>
            <p className="text-slate-700 text-sm mb-4 leading-relaxed font-medium">{step.content}</p>
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-300">
              <code className="text-amber-700 font-mono text-sm font-bold">{step.formula}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
