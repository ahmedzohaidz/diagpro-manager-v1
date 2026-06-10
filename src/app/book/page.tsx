"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { bookingRepository } from "@/lib/bookings/bookingRepository";
import { buildWhatsAppLink } from "@/lib/bookings/whatsapp";
import type { Booking, BookingInput } from "@/lib/bookings/types";

type BooleanField = "isDrivable" | "hasCheckEngineLight";

interface ServiceOption {
  id: string;
  label: string;
  icon: string;
}

const SERVICES: ServiceOption[] = [
  { id: "engine_light", label: "فحص لمبة المكينة", icon: "🚨" },
  { id: "electrical", label: "كهرباء سيارات", icon: "⚡" },
  { id: "ac", label: "فحص مكيف", icon: "❄️" },
  { id: "transmission", label: "فحص قير", icon: "⚙️" },
  { id: "programming", label: "برمجة / إعادة تعلم", icon: "💻" },
  { id: "full_inspection", label: "فحص شامل", icon: "🔍" },
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

// Shared classes for bigger, easier-to-tap fields (also keeps inputs at
// 16px on iOS so Safari doesn't zoom in on focus).
const FIELD_CLASS =
  "text-base py-3 [font-size:16px] sm:[font-size:0.875rem]";
const TEXTAREA_CLASS =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-3 text-base outline-none transition-colors placeholder:text-ink/40 focus:border-ink focus:ring-2 focus:ring-brand [font-size:16px] sm:text-sm sm:[font-size:0.875rem]";
const SELECT_CLASS =
  "mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-3 text-base text-ink outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-brand [font-size:16px] sm:text-sm sm:[font-size:0.875rem]";

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

    const phoneDigits = form.phone.replace(/[\s-]/g, "");
    if (form.phone.trim() && !SAUDI_MOBILE_REGEX.test(phoneDigits)) {
      next.phone = "رقم جوال سعودي غير صحيح (مثال: 05XXXXXXXX)";
    }

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
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "تعذّر إرسال الطلب، تحقق من الاتصال بالإنترنت وحاول مرة أخرى."
      );
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
    const whatsappLink = buildWhatsAppLink(savedBooking);
    return (
      <div className="space-y-6 pb-6">
        <header>
          <h1 className="text-2xl font-extrabold text-ink">حجز موعد</h1>
        </header>

        <Card className="border-2 border-brand">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center rounded-full bg-brand px-3 py-1 text-sm font-bold text-ink">
              تم الإرسال بنجاح
            </span>

            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-base font-bold text-ink">
                <span aria-hidden>✅</span>
                <span>تم استلام طلب الحجز الخاص بك.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink-soft">
                <span aria-hidden>📅</span>
                <span>سيتم مراجعة طلبك وتحديد أقرب موعد مناسب لك.</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-ink-soft">
                <span aria-hidden>🚗</span>
                <span>
                  عند وصولك، سيكون موظف الاستقبال على علم ببيانات سيارتك
                  ومشكلتك مسبقًا.
                </span>
              </li>
            </ul>

            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button variant="secondary" className="w-full py-3.5 text-base sm:w-auto">
                  تأكيد عبر واتساب
                </Button>
              </a>
              <Button
                variant="outline"
                onClick={resetForm}
                type="button"
                className="w-full py-3.5 text-base sm:w-auto"
              >
                حجز موعد جديد
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // ---- Form view --------------------------------------------------------
  return (
    <div className="space-y-6 pb-28">
      <header>
        <h1 className="text-2xl font-extrabold text-ink">حجز موعد</h1>
        <p className="mt-1 text-ink-soft">
          عبّئ بيانات الحجز وسنراجع أقرب موعد مناسب ونتواصل معك عبر واتساب.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {/* Service cards */}
        <Card>
          <h2 className="mb-3 text-sm font-bold text-ink">
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
                  className={`flex min-h-[88px] flex-col items-center justify-center gap-1.5 rounded-xl border-2 px-2 py-3 text-center text-sm font-bold transition-colors ${
                    selected
                      ? "border-ink bg-brand text-ink"
                      : "border-ink/15 bg-white text-ink-soft hover:border-ink"
                  }`}
                >
                  <span className="text-2xl" aria-hidden>
                    {service.icon}
                  </span>
                  <span>{service.label}</span>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Customer & vehicle details */}
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.customerFullName}>
              <Input
                id="customerFullName"
                label="الاسم الكامل *"
                value={form.customerFullName}
                onChange={(e) => update("customerFullName", e.target.value)}
                placeholder="مثال: أحمد محمد"
                className={FIELD_CLASS}
              />
            </Field>

            <Field error={errors.phone}>
              <Input
                id="phone"
                label="رقم الجوال *"
                inputMode="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="مثال: 05XXXXXXXX"
                className={FIELD_CLASS}
              />
            </Field>

            <Field error={errors.carMake}>
              <Input
                id="carMake"
                label="نوع السيارة *"
                value={form.carMake}
                onChange={(e) => update("carMake", e.target.value)}
                placeholder="مثال: تويوتا"
                className={FIELD_CLASS}
              />
            </Field>

            <Field error={errors.carModel}>
              <Input
                id="carModel"
                label="الموديل *"
                value={form.carModel}
                onChange={(e) => update("carModel", e.target.value)}
                placeholder="مثال: كامري"
                className={FIELD_CLASS}
              />
            </Field>

            <Field error={errors.carYear}>
              <label htmlFor="carYear" className="text-sm font-bold text-ink">
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
              <Input
                id="plateNumber"
                label="رقم اللوحة (اختياري)"
                value={form.plateNumber}
                onChange={(e) => update("plateNumber", e.target.value)}
                placeholder="مثال: أ ب ج 1234"
                className={FIELD_CLASS}
              />
            </Field>

            <Field error={errors.preferredDate}>
              <Input
                id="preferredDate"
                label="التاريخ المفضل *"
                type="date"
                value={form.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
                className={FIELD_CLASS}
              />
            </Field>

            <Field error={errors.preferredTime}>
              <Input
                id="preferredTime"
                label="الوقت المفضل *"
                type="time"
                value={form.preferredTime}
                onChange={(e) => update("preferredTime", e.target.value)}
                className={FIELD_CLASS}
              />
            </Field>
          </div>

          <div className="mt-4">
            <Field error={errors.problemDescription}>
              <label
                htmlFor="problemDescription"
                className="text-sm font-bold text-ink"
              >
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
              <label htmlFor="notes" className="text-sm font-bold text-ink">
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
              className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-3 text-sm font-bold text-red-700"
            >
              {submitError}
            </p>
          )}
        </Card>
      </form>

      {/* Sticky submit bar — always reachable on mobile */}
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-ink/10 bg-white/95 p-3 backdrop-blur supports-[backdrop-filter]:bg-white/80 [padding-bottom:max(0.75rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto w-full max-w-5xl px-1">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 text-base"
          >
            {loading ? "جارٍ الإرسال..." : "إرسال طلب الحجز"}
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
        <span className="mt-1 text-xs font-bold text-red-600">{error}</span>
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
      <span className="text-sm font-bold text-ink">{label}</span>
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
              className={`flex-1 rounded-md border-2 px-5 py-3 text-sm font-bold transition-colors ${
                selected
                  ? "border-ink bg-brand text-ink"
                  : "border-ink/20 bg-white text-ink-soft hover:border-ink"
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
