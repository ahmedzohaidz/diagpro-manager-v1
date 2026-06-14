'use client';

import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BlogPage() {
  const blogs = [
    {
      id: 1,
      title: "كيفية الحفاظ على صحة محرك السيارة",
      excerpt: "نصائح مهمة للحفاظ على محرك سيارتك في أفضل حالة",
      date: "2026-06-01",
      icon: "⚙️",
    },
    {
      id: 2,
      title: "فهم مؤشرات لوحة التحكم",
      excerpt: "شرح شامل لجميع الأضواء والتحذيرات في سيارتك",
      date: "2026-05-25",
      icon: "🚨",
    },
    {
      id: 3,
      title: "أسباب ارتفاع درجة حرارة السيارة",
      excerpt: "تعرف على أسباب ارتفاع الحرارة وكيفية معالجتها",
      date: "2026-05-18",
      icon: "🔥",
    },
    {
      id: 4,
      title: "متى تحتاج لتغيير زيت السيارة؟",
      excerpt: "جدول صيانة دوري وعلامات تحذيرية مهمة",
      date: "2026-05-10",
      icon: "🛢️",
    },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header Spacing */}
      <div className="h-24" />

      {/* Blog Hero */}
      <section className="relative w-full px-4 sm:px-8 py-12 bg-gradient-to-b from-gray-900 to-black">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 bg-gradient-to-r from-[#FFD100] to-yellow-300 bg-clip-text text-transparent text-right">
            📝 مدونة ديجينو
          </h1>
          <p className="text-gray-400 text-lg text-right mb-8">
            نصائح واستشارات حول صيانة السيارات والفحص الدوري
          </p>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="w-full px-4 sm:px-8 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog.id}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 hover:border-[#FFD100] transition-all duration-300 hover:shadow-lg hover:shadow-[#FFD100]/20"
              >
                <div className="text-5xl mb-4">{blog.icon}</div>
                <h3 className="text-xl font-bold mb-2 text-right">{blog.title}</h3>
                <p className="text-gray-400 text-sm mb-4 text-right">{blog.excerpt}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{blog.date}</p>
                  <button className="text-[#FFD100] font-bold text-sm hover:underline">
                    اقرأ المزيد →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full px-4 sm:px-8 py-12 bg-gray-950">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">هل لديك سؤال؟</h2>
          <p className="text-gray-400 mb-8">تواصل معنا عبر الواتس أو احجز موعد الآن</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button className="bg-gray-800 hover:bg-gray-700 px-8 py-3 rounded-lg">
                ← العودة للرئيسية
              </Button>
            </Link>
            <Link href="/book">
              <Button className="bg-[#FFD100] hover:bg-yellow-500 text-black font-bold px-8 py-3 rounded-lg">
                📅 احجز موعد
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Spacer */}
      <div className="h-24" />
    </div>
  );
}
