"use client";

import { FormEvent, useState } from "react";

type BookingForm = {
  customerName: string;
  phone: string;
  vehicle: string;
  service: string;
  preferredDate: string;
  notes: string;
};

const initialForm: BookingForm = {
  customerName: "",
  phone: "",
  vehicle: "",
  service: "صيانة دورية",
  preferredDate: "",
  notes: "",
};

export default function BookPage() {
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  function update<K extends keyof BookingForm>(key: K, value: BookingForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSubmitted(false);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <main className="min-h-screen px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <a href="/" className="text-sm font-bold text-neutral-600 hover:text-black">→ الرئيسية</a>
        <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 shadow-sm sm:p-8">
          <span className="inline-flex rounded-full bg-[#FFD100] px-3 py-1 text-xs font-black">طلب موعد</span>
          <h1 className="mt-4 text-3xl font-black">حجز موعد صيانة</h1>
          <p className="mt-2 leading-7 text-neutral-600">أدخل بياناتك وبيانات المركبة، وسيتمكن فريق الورشة من مراجعة الطلب بعد تفعيل الحفظ.</p>
          <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="customerName" className="mb-2 block text-sm font-bold">اسم العميل *</label>
              <input id="customerName" required maxLength={100} autoComplete="name" value={form.customerName} onChange={(e) => update("customerName", e.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black focus:ring-2 focus:ring-[#FFD100]" />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-bold">رقم الجوال *</label>
              <input id="phone" required inputMode="tel" autoComplete="tel" pattern="[0-9+()\- ]{8,20}" value={form.phone} onChange={(e) => update("phone", e.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black focus:ring-2 focus:ring-[#FFD100]" />
            </div>
            <div>
              <label htmlFor="vehicle" className="mb-2 block text-sm font-bold">نوع المركبة والموديل *</label>
              <input id="vehicle" required maxLength={120} placeholder="مثال: هيونداي سنتافي ٢٠١٩" value={form.vehicle} onChange={(e) => update("vehicle", e.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-300 px-4 outline-none focus:border-black focus:ring-2 focus:ring-[#FFD100]" />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="service" className="mb-2 block text-sm font-bold">نوع الخدمة *</label>
                <select id="service" value={form.service} onChange={(e) => update("service", e.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-300 bg-white px-3">
                  <option>صيانة دورية</option><option>فحص كمبيوتر</option><option>كهرباء سيارات</option><option>فحص قبل الشراء</option><option>أخرى</option>
                </select>
              </div>
              <div>
                <label htmlFor="preferredDate" className="mb-2 block text-sm font-bold">التاريخ المفضل</label>
                <input id="preferredDate" type="date" min={new Date().toISOString().slice(0, 10)} value={form.preferredDate} onChange={(e) => update("preferredDate", e.target.value)} className="min-h-12 w-full rounded-xl border border-neutral-300 px-3" />
              </div>
            </div>
            <div>
              <label htmlFor="notes" className="mb-2 block text-sm font-bold">وصف مختصر للمشكلة (اختياري)</label>
              <textarea id="notes" rows={3} maxLength={1000} value={form.notes} onChange={(e) => update("notes", e.target.value)} className="w-full rounded-xl border border-neutral-300 px-4 py-3 outline-none focus:border-black focus:ring-2 focus:ring-[#FFD100]" />
            </div>
            <button type="submit" className="min-h-12 w-full rounded-xl bg-[#FFD100] px-5 py-3 font-black transition hover:bg-yellow-400">مراجعة الطلب</button>
          </form>
          {submitted && <p role="status" className="mt-5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-7">تم التحقق من الحقول في هذه الواجهة التجريبية فقط. لم يُرسل الطلب ولم تُحفظ البيانات. سيتم تفعيل الإرسال بعد ربط API وقاعدة البيانات.</p>}
        </div>
      </div>
    </main>
  );
}
