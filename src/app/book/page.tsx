"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { bookingRepository } from "@/lib/bookings/bookingRepository";
import { buildGeneralWhatsAppLink } from "@/lib/bookings/whatsapp";
import type { Booking, BookingInput } from "@/lib/bookings/types";

type BooleanField = "isDrivable" | "hasCheckEngineLight";

interface ServiceOption {
  id: string;
  label: string;
  description: string;
  icon: string;
}

const SERVICES: ServiceOption[] = [
  {
    id: "engine_light",
    label: "فحص لمبة المكينة",
    description: "تشخيص أسباب إضاءة لمبة فحص المحرك",
    icon: "🚨",
  },
  {
    id: "electrical",
    label: "كهرباء سيارات",
    description: "تشخيص وإصلاح أعطال الكهرباء",
    icon: "⚡",
  },
  {
    id: "ac",
    label: "فحص مكيف",
    description: "فحص أداء وتبريد نظام التكييف",
    icon: "❄️",
  },
  {
    id: "transmission",
    label: "فحص قير",
    description: "فحص أداء ناقل الحركة وأعطاله",
    icon: "⚙️",
  },
  {
    id: "programming",
    label: "برمجة / إعادة تعلم",
    description: "برمجة وحدات التحكم والمفاتيح",
    icon: "💻",
  },
  {
    id: "full_inspection",
    label: "فحص شامل",
    description: "فحص كامل لجميع أنظمة السيارة",
    icon: "🔍",
  },
];

interface FormState {
  customerFullName: string;
  phone: string;
  carMake: string;
  carModel: string;
  carYear: string;
  plateNumber: string;
  selectedService: string | null;
  problemDescription: string;
  isDrivable: boolean | null;
  hasCheckEngineLight: boolean | null;
  preferredDate: string;
  preferredTime: string;
  notes: string;
}

const initialForm: FormState = {
  customerFullName: "",
  phone: "",
  carMake: "",
  carModel: "",
  carYear: "",
  plateNumber: "",
  selectedService: null,
  problemDescription: "",
  isDrivable: null,
  hasCheckEngineLight: null,
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

// Car year options (newest first), from next model year down to 1980.
const CURRENT_YEAR = new Date().getFullYear();
const OLDEST_CAR_YEAR = 1980;
const CAR_YEARS: string[] = Array.from(
  { length: CURRENT_YEAR + 1 - OLDEST_CAR_YEAR + 1 },
  (_, i) => String(CURRENT_YEAR + 1 - i)
);

// Saudi mobile number: accepts 05XXXXXXXX, 9665XXXXXXXX, or +9665XXXXXXXX
// (spaces and dashes are ignored).
const SAUDI_MOBILE_REGEX = /^(\+?966|0)?5\d{8}$/;

const SUCCESS_WHATSAPP_MESSAGE =
  "السلام عليكم، أرسلت طلب حجز من الموقع. أريد تأكيد أقرب موعد مناسب لفحص السيارة.";

// Shared classes for dark, big, easy-to-tap fields (also keeps inputs at 16px
// on iOS so Safari doesn't zoom in on focus).
const LABEL_CLASS = "text-sm font-bold text-white/80";
const INPUT_CLASS =
  "mt-1.5 w-full rounded-md border border-white/10 bg-[#18181b] px-4 py-3 text-base text-white outline-none transition-colors placeholder:text-white/30 focus:border-brand focus:ring-2 focus:ring-brand [font-size:16px] sm:text-base";
const TEXTAREA_CLASS = `${INPUT_CLASS} resize-none min-h-24`;
const SELECT_CLASS = `${INPUT_CLASS} [color-scheme:dark]`;
const DATE_TIME_CLASS = `${INPUT_CLASS} [color-scheme:dark]`;

export default function BookPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedBooking, setSavedBooking] = useState<Booking | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleService(id: string) {
    setForm((prev) => ({
      ...prev,
      selectedService: prev.selectedService === id ? null : id,
    }));
  }

  function validate(): Record<string, string> {
    const next: Record<string, string> = {};
    const required: [keyof FormState, string][] = [
      ["customerFullName", "الاسم الكامل مطلوب"],
      ["phone", "رقم الجوال مطلوب"],
      ["carMake", "نوع السيارة مطلوب"],
      ["carModel", "موديل السيارة مطلوب"],
      ["carYear", "سنة الصنع مطلوبة"],
      ["problemDescription", "وصف المشكلة مطلوب"],
      ["preferredDate", "التاريخ المفضل مطلوب"],
      ["preferredTime", "الوقت المفضل مطلوب"],
    ];

    for (const [field, message] of required) {
      if (!String(form[field] ?? "").trim()) {
        next[field] = message;
      }
    }

    // Name validation: minimum 3 characters
    if (form.customerFullName.trim().length > 0 && form.customerFullName.trim().length < 3) {
      next.customerFullName = "الاسم يجب أن يكون 3 أحرف على الأقل";
    }

    // Phone validation
    const phoneDigits = form.phone.replace(/[\s-]/g, "");
    if (form.phone.trim()) {
      if (!SAUDI_MOBILE_REGEX.test(phoneDigits)) {
        next.phone = "رقم جوال سعودي غير صحيح (مثال: 05XXXXXXXX أو 966501234567)";
      }
    }

    // Car make and model: minimum 2 characters
    if (form.carMake.trim().length > 0 && form.carMake.trim().length < 2) {
      next.carMake = "نوع السيارة يجب أن يكون حرفين على الأقل";
    }
    if (form.carModel.trim().length > 0 && form.carModel.trim().length < 2) {
      next.carModel = "موديل السيارة يجب أن يكون حرفين على الأقل";
    }

    // Problem description: minimum 5 characters
    if (form.problemDescription.trim().length > 0 && form.problemDescription.trim().length < 5) {
      next.problemDescription = "وصف المشكلة يجب أن يكون 5 أحرف على الأقل";
    }

    // Date validation: not in the past
    const selectedDate = new Date(form.preferredDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (form.preferredDate && selectedDate < today) {
      next.preferredDate = "يجب اختيار تاريخ مستقبلي";
    }

    // Boolean fields validation
    if (form.isDrivable === null) {
      next.isDrivable = "يرجى تحديد ما إذا كانت السيارة تسير";
    }
    if (form.hasCheckEngineLight === null) {
      next.hasCheckEngineLight = "يرجى تحديد حالة لمبة الفحص";
    }

    return next;
  }

  async function handleSubmit(e: React.FormEvent | React.MouseEvent) {
    e.preventDefault();
    if (loading) return;
    setSubmitError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      // Scroll the first invalid field into view so the user notices it.
      const firstField = Object.keys(validationErrors)[0];
      document
        .getElementById(firstField)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setLoading(true);
    try {
      const selectedService = SERVICES.find(
        (s) => s.id === form.selectedService
      );
      const notes = [
        selectedService ? `الخدمة المطلوبة: ${selectedService.label}` : null,
        form.notes.trim() || null,
      ]
        .filter(Boolean)
        .join("\n");

      const input: BookingInput = {
        customerFullName: form.customerFullName.trim(),
        phone: form.phone.trim(),
        carMake: form.carMake.trim(),
        carModel: form.carModel.trim(),
        carYear: form.carYear.trim(),
        plateNumber: form.plateNumber.trim() || undefined,
        problemDescription: form.problemDescription.trim(),
        isDrivable: form.isDrivable === true,
        hasCheckEngineLight: form.hasCheckEngineLight === true,
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime,
        notes: notes || undefined,
      };

      const booking = await bookingRepository.create(input);
      setSavedBooking(booking);
    } catch {
      setSubmitError("تعذر إرسال الطلب. تأكد من البيانات أو حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
    setSubmitError(null);
    setSavedBooking(null);
  }

  // ---- Success view -----------------------------------------------------
  if (savedBooking) {
    const selectedService = SERVICES.find(
      (s) => s.id === form.selectedService
    );
    const whatsappMessage = [
      SUCCESS_WHATSAPP_MESSAGE,
      selectedService ? `الخدمة: ${selectedService.label}` : null,
      `السيارة: ${savedBooking.carMake} ${savedBooking.carModel} - ${savedBooking.carYear}`,
      `المشكلة: ${savedBooking.problemDescription}`,
      "",
      "📍 موقعنا: حفرالباطن - الصناعية",
    ]
      .filter(Boolean)
      .join("\n");
    const whatsappLink = buildGeneralWhatsAppLink(whatsappMessage);

    return (
      <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0d0f] p-4 text-white sm:p-6">
        <div className="rounded-xl border-2 border-brand bg-gradient-to-br from-brand/15 to-transparent p-5">
          <span className="inline-flex w-fit items-center rounded-full bg-brand px-3 py-1 text-sm font-bold text-ink">
            تم استلام طلبك بنجاح
          </span>

          <ul className="mt-4 space-y-3">
            <li className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
              <span aria-hidden>📅</span>
              <span>سيتم مراجعة طلبك وتحديد أقرب موعد مناسب.</span>
            </li>
            <li className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
              <span aria-hidden>✅</span>
              <span>سيصلك تأكيد الموعد عبر واتساب.</span>
            </li>
            <li className="flex items-start gap-2 text-sm leading-relaxed text-white/80">
              <span aria-hidden>🚗</span>
              <span>
                عند وصولك سيكون موظف الاستقبال على علم ببيانات سيارتك
                ومشكلتك مسبقًا.
              </span>
            </li>
          </ul>
        </div>

        {/* Booking summary */}
        <div className="rounded-xl border border-white/10 bg-[#18181b] p-4">
          <h2 className="text-sm font-extrabold text-white/80">ملخص الطلب</h2>
          <dl className="mt-3 space-y-2 text-sm">
            {selectedService && (
              <div className="flex items-center justify-between gap-3">
                <dt className="text-white/50">الخدمة</dt>
                <dd className="font-bold">
                  {selectedService.icon} {selectedService.label}
                </dd>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <dt className="text-white/50">السيارة</dt>
              <dd className="font-bold">
                {savedBooking.carMake} {savedBooking.carModel}{" "}
                {savedBooking.carYear}
              </dd>
            </div>
            <div className="flex items-start justify-between gap-3">
              <dt className="text-white/50">المشكلة</dt>
              <dd className="max-w-[65%] text-right font-bold leading-relaxed">
                {savedBooking.problemDescription}
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <Button className="w-full py-3.5 text-base">
              تأكيد عبر واتساب
            </Button>
          </a>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="block flex-1">
              <Button variant="secondary" className="w-full py-3.5 text-base">
                العودة للرئيسية
              </Button>
            </Link>
            <Link href="/services" className="block flex-1">
              <Button variant="outline" className="w-full py-3.5 text-base">
                استعراض الخدمات
              </Button>
            </Link>
          </div>
          <Button
            variant="outline"
            onClick={resetForm}
            type="button"
            className="w-full py-3.5 text-base"
          >
            حجز موعد جديد
          </Button>
        </div>
      </div>
    );
  }

  // ---- Form view --------------------------------------------------------
  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#0d0d0f] p-4 pb-[calc(9rem+env(safe-area-inset-bottom))] text-white sm:p-6 md:pb-28">
      {/* Hero */}
      <header className="rounded-xl border border-white/10 bg-gradient-to-br from-[#1c1c1f] to-[#0d0d0f] p-4 sm:p-5">
        <h1 className="text-xl font-extrabold sm:text-2xl">
          احجز موعد فحص سيارتك
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-white/70">
          املأ البيانات وسيتم مراجعة أقرب موعد مناسب والتواصل معك عبر واتساب.
        </p>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-brand/30 bg-brand/10 p-3 text-xs leading-relaxed text-brand">
          <span aria-hidden>✅</span>
          <span>
            عند وصولك سيكون موظف الاستقبال على علم ببيانات سيارتك ومشكلتك.
          </span>
        </div>
        <div className="mt-3 text-xs text-white/60">
          <span className="font-bold text-white/80">ملاحظة:</span> الحقول المعلّمة بـ * مطلوبة
        </div>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Service cards */}
        <div className="rounded-xl border border-white/10 bg-[#18181b] p-4">
          <h2 className="mb-3 text-sm font-bold text-white/80">
            ما نوع الخدمة المطلوبة؟ (اختياري)
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SERVICES.map((service) => {
              const selected = form.selectedService === service.id;
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggleService(service.id)}
                  aria-pressed={selected}
                  className={`flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-xl border-2 px-2 py-3 text-center transition-colors ${
                    selected
                      ? "border-brand bg-brand text-ink"
                      : "border-white/10 bg-[#0d0d0f] text-white/70 hover:border-white/30"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {service.icon}
                  </span>
                  <span className="text-sm font-bold">{service.label}</span>
                  <span
                    className={`text-[11px] leading-snug ${
                      selected ? "text-ink/70" : "text-white/50"
                    }`}
                  >
                    {service.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Customer & vehicle details */}
        <div className="rounded-xl border border-white/10 bg-[#18181b] p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.customerFullName}>
              <label htmlFor="customerFullName" className={LABEL_CLASS}>
                الاسم الكامل *
              </label>
              <input
                id="customerFullName"
                value={form.customerFullName}
                onChange={(e) => update("customerFullName", e.target.value)}
                placeholder="مثال: أحمد محمد"
                className={INPUT_CLASS}
              />
            </Field>

            <Field error={errors.phone}>
              <label htmlFor="phone" className={LABEL_CLASS}>
                رقم الجوال *
              </label>
              <input
                id="phone"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="مثال: 05XXXXXXXX"
                className={INPUT_CLASS}
              />
            </Field>

            <Field error={errors.carMake}>
              <label htmlFor="carMake" className={LABEL_CLASS}>
                نوع السيارة *
              </label>
              <input
                id="carMake"
                value={form.carMake}
                onChange={(e) => update("carMake", e.target.value)}
                placeholder="مثال: تويوتا"
                className={INPUT_CLASS}
              />
            </Field>

            <Field error={errors.carModel}>
              <label htmlFor="carModel" className={LABEL_CLASS}>
                الموديل *
              </label>
              <input
                id="carModel"
                value={form.carModel}
                onChange={(e) => update("carModel", e.target.value)}
                placeholder="مثال: كامري"
                className={INPUT_CLASS}
              />
            </Field>

            <Field error={errors.carYear}>
              <label htmlFor="carYear" className={LABEL_CLASS}>
                سنة الصنع *
              </label>
              <select
                id="carYear"
                value={form.carYear}
                onChange={(e) => update("carYear", e.target.value)}
                className={SELECT_CLASS}
              >
                <option value="">اختر السنة</option>
                {CAR_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </Field>

            <Field>
              <label htmlFor="plateNumber" className={LABEL_CLASS}>
                رقم اللوحة (اختياري)
              </label>
              <input
                id="plateNumber"
                value={form.plateNumber}
                onChange={(e) => update("plateNumber", e.target.value)}
                placeholder="مثال: أ ب ج 1234"
                className={INPUT_CLASS}
              />
            </Field>

            <Field error={errors.preferredDate}>
              <label htmlFor="preferredDate" className={LABEL_CLASS}>
                التاريخ المفضل *
              </label>
              <input
                id="preferredDate"
                type="date"
                value={form.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
                className={DATE_TIME_CLASS}
              />
            </Field>

            <Field error={errors.preferredTime}>
              <label htmlFor="preferredTime" className={LABEL_CLASS}>
                الوقت المفضل *
              </label>
              <input
                id="preferredTime"
                type="time"
                value={form.preferredTime}
                onChange={(e) => update("preferredTime", e.target.value)}
                className={DATE_TIME_CLASS}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field error={errors.problemDescription}>
              <label htmlFor="problemDescription" className={LABEL_CLASS}>
                وصف المشكلة *
              </label>
              <textarea
                id="problemDescription"
                value={form.problemDescription}
                onChange={(e) => update("problemDescription", e.target.value)}
                rows={3}
                placeholder="اشرح المشكلة بإيجاز..."
                className={TEXTAREA_CLASS}
              />
            </Field>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <BooleanQuestion
              label="هل السيارة تسير؟ *"
              name="isDrivable"
              value={form.isDrivable}
              onChange={(v) => update("isDrivable", v)}
              error={errors.isDrivable}
            />
            <BooleanQuestion
              label="هل لمبة فحص المحرك مضيئة؟ *"
              name="hasCheckEngineLight"
              value={form.hasCheckEngineLight}
              onChange={(v) => update("hasCheckEngineLight", v)}
              error={errors.hasCheckEngineLight}
            />
          </div>

          <div className="mt-4">
            <Field>
              <label htmlFor="notes" className={LABEL_CLASS}>
                ملاحظات (اختياري)
              </label>
              <textarea
                id="notes"
                value={form.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
                placeholder="أي معلومات إضافية..."
                className={TEXTAREA_CLASS}
              />
            </Field>
          </div>

          {submitError && (
            <p
              role="alert"
              className="mt-4 rounded-lg border border-red-500/40 bg-red-500/15 px-4 py-4 text-base font-bold text-red-300 flex items-start gap-3"
            >
              <span className="text-xl">❌</span>
              <span>{submitError}</span>
            </p>
          )}
        </div>
      </form>

      {/* Sticky submit bar — sits above the bottom nav (which already
          reserves env(safe-area-inset-bottom)), always reachable */}
      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 border-t border-white/10 bg-[#0d0d0f]/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-[#0d0d0f]/80 md:bottom-0 md:[padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-5xl px-1">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 py-5 text-lg font-bold transition-all disabled:opacity-70"
          >
            {loading && (
              <span
                aria-hidden
                className="h-5 w-5 animate-spin rounded-full border-2 border-ink/30 border-t-ink"
              />
            )}
            {loading ? "⏳ جاري إرسال الطلب..." : "✅ إرسال طلب الحجز"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Small local helpers (kept in-file; scoped to the /book page only).
// ---------------------------------------------------------------------------

function Field({
  children,
  error,
}: {
  children: React.ReactNode;
  error?: string;
}) {
  return (
    <div className="flex flex-col">
      {children}
      {error && (
        <span className="mt-2 text-sm font-bold text-red-400 flex items-center gap-1.5">
          <span>⚠️</span>
          {error}
        </span>
      )}
    </div>
  );
}

function BooleanQuestion({
  label,
  name,
  value,
  onChange,
  error,
}: {
  label: string;
  name: BooleanField;
  value: boolean | null;
  onChange: (v: boolean) => void;
  error?: string;
}) {
  return (
    <Field error={error}>
      <span className={LABEL_CLASS}>{label}</span>
      <div className="mt-1.5 flex gap-2">
        {[
          { label: "نعم", val: true },
          { label: "لا", val: false },
        ].map((opt) => {
          const selected = value === opt.val;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onChange(opt.val)}
              className={`flex-1 rounded-md border-2 px-4 py-4 text-base font-bold transition-colors ${
                selected
                  ? "border-brand bg-brand text-ink"
                  : "border-white/15 bg-[#0d0d0f] text-white/70 hover:border-white/40"
              }`}
              aria-pressed={selected}
              name={name}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </Field>
  );
}
