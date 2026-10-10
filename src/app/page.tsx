import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="flex items-center justify-between gap-4 border-b border-black/10 pb-5">
          <div>
            <p className="text-sm font-bold tracking-wide text-neutral-600">DIAGPRO MANAGER</p>
            <h1 className="mt-1 text-2xl font-black sm:text-3xl">إدارة ورشتك تبدأ من هنا</h1>
          </div>
          <span className="rounded-full bg-[#FFD100] px-3 py-2 text-xs font-bold">الإصدار الأول</span>
        </header>
        <section className="grid gap-6 py-10 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div>
            <h2 className="text-3xl font-black leading-tight sm:text-5xl">حجوزات الصيانة، <span className="underline decoration-[#FFD100] decoration-8 underline-offset-4">بشكل أوضح.</span></h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-neutral-600">نقطة بداية بسيطة لتنظيم طلبات العملاء قبل تحويلها إلى أوامر عمل داخل الورشة.</p>
            <Link href="/book" className="mt-7 inline-flex min-h-12 items-center justify-center rounded-xl bg-black px-6 py-3 font-bold text-white transition hover:bg-neutral-800">احجز موعد صيانة <span className="mr-2" aria-hidden="true">←</span></Link>
          </div>
          <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold text-neutral-500">نطاق المرحلة الحالية</p>
            <ul className="mt-4 space-y-4">
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FFD100] font-black">١</span><span><strong>استقبال الحجز</strong><br/><small className="text-neutral-500">بيانات العميل والمركبة والخدمة</small></span></li>
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-black">٢</span><span><strong>مراجعة الحجوزات</strong><br/><small className="text-neutral-500">لوحة المشرف في المرحلة التالية</small></span></li>
              <li className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 font-black">٣</span><span><strong>ربط قاعدة البيانات</strong><br/><small className="text-neutral-500">Supabase بعد ضبط البيئة والصلاحيات</small></span></li>
            </ul>
          </div>
        </section>
        <footer className="border-t border-black/10 pt-5 text-sm text-neutral-500">نسخة تأسيسية — لا تُحفظ الحجوزات في قاعدة بيانات حتى الآن.</footer>
      </div>
    </main>
  );
}
