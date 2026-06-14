'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export default function SuggestionsPage() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    suggestion: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to a server
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", phone: "", email: "", suggestion: "" });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Spacing */}
      <div className="h-24" />

      {/* Hero Section */}
      <section className="relative w-full px-4 sm:px-8 py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#FFD100] to-yellow-300 bg-clip-text text-transparent text-right">
            💡 اقتراحاتك مهمة لنا
          </h1>
          <p className="text-gray-400 text-lg text-right mb-8">
            ساعدنا في تحسين خدماتنا من خلال مشاركة اقتراحاتك وملاحظاتك
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="w-full px-4 sm:px-8 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-right mb-2 font-bold">الاسم</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="أدخل اسمك"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-right placeholder-gray-500 focus:outline-none focus:border-[#FFD100]"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-right mb-2 font-bold">رقم الجوال</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+966 5X XXXX XXXX"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-right placeholder-gray-500 focus:outline-none focus:border-[#FFD100]"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-right mb-2 font-bold">البريد الإلكتروني</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-right placeholder-gray-500 focus:outline-none focus:border-[#FFD100]"
                />
              </div>

              {/* Suggestion */}
              <div>
                <label className="block text-right mb-2 font-bold">اقتراحك أو ملاحظتك</label>
                <textarea
                  value={formData.suggestion}
                  onChange={(e) => setFormData({ ...formData, suggestion: e.target.value })}
                  placeholder="شارك معنا اقتراحك أو ملاحظتك..."
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-right placeholder-gray-500 focus:outline-none focus:border-[#FFD100] resize-none"
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="flex-1 bg-[#FFD100] hover:bg-yellow-500 text-black font-bold py-3 rounded-lg transition-all"
                >
                  {submitted ? "✅ تم الإرسال بنجاح!" : "📤 إرسال الاقتراح"}
                </button>
                <Link href="/" className="flex-1">
                  <button
                    type="button"
                    className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition-all"
                  >
                    إلغاء
                  </button>
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-4 sm:px-8 py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-right mb-8">لماذا نستمع لاقتراحاتك؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "🎯", title: "تحسين الخدمة", desc: "اقتراحاتك تساعدنا في تطوير خدماتنا" },
              { icon: "👥", title: "صوتك مهم", desc: "رأيك يعكس احتياجات العملاء الفعلية" },
              { icon: "🚀", title: "نمو معاً", desc: "معاً نبني خدمة أفضل وأكثر احترافية" },
            ].map((feature, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-8 py-12">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">تواصل معنا</h2>
          <p className="text-gray-400 mb-8">إذا كنت تفضل التواصل المباشر</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-lg">
                ← الرئيسية
              </Button>
            </Link>
            <a href="https://wa.me/966XXXXXXXXX" target="_blank" rel="noopener noreferrer">
              <Button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold">
                💬 واتساب
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-24" />
    </div>
  );
}
