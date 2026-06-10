"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { bookingRepository } from "@/lib/bookings/bookingRepository";
import { buildWhatsAppLink } from "@/lib/bookings/whatsapp";
import type { Booking, BookingInput } from "@/lib/bookings/types";

type BooleanField = "isDrivable" | "hasCheckEngineLight";

interface FormState {
  customerFullName: string;
  phone: string;
  carMake: string;
  carModel: string;
  carYear: string;
  plateNumber: string;
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
  problemDescription: "",
  isDrivable: null,
  hasCheckEngineLight: null,
  preferredDate: "",
  preferredTime: "",
  notes: "",
};

const SUCCESS_MESSAGE =
  "تم استلام طلب الحجز. سيتم مراجعة أقرب موعد مناسب والتواصل معك عبر واتساب.";

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

export default function BookPage() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [savedBooking, setSavedBooking] = useState<Booking | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);
    try {
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
        notes: form.notes.trim() || undefined,
      };

      const booking = await bookingRepository.create(input);
      setSavedBooking(booking);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : "تعذّر حفظ الحجز، حاول مرة أخرى."
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
      <div className="space-y-6">
        <header>
          <h1 className="text-2xl font-extrabold text-ink">حجز موعد</h1>
        </header>

        <Card className="border-2 border-brand">
          <div className="flex flex-col gap-4">
            <span className="inline-flex w-fit items-center rounded-full bg-brand px-3 py-1 text-sm font-bold text-ink">
              تم الإرسال بنجاح
            </span>
            <p className="text-base font-bold text-ink">{SUCCESS_MESSAGE}</p>
            <p className="text-sm text-ink-soft">
              يمكنك تأكيد الطلب مباشرة عبر واتساب لتسريع التواصل.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Button variant="secondary">تأكيد عبر واتساب</Button>
              </a>
              <Button variant="outline" onClick={resetForm} type="button">
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
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-extrabold text-ink">حجز موعد</h1>
        <p className="mt-1 text-ink-soft">
          عبّئ بيانات الحجز وسنراجع أقرب موعد مناسب ونتواصل معك عبر واتساب.
        </p>
      </header>

      <form onSubmit={handleSubmit} noValidate>
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.customerFullName}>
              <Input
                id="customerFullName"
                label="الاسم الكامل *"
                value={form.customerFullName}
                onChange={(e) => update("customerFullName", e.target.value)}
                placeholder="مثال: أحمد محمد"
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
              />
            </Field>

            <Field error={errors.carMake}>
              <Input
                id="carMake"
                label="نوع السيارة *"
                value={form.carMake}
                onChange={(e) => update("carMake", e.target.value)}
                placeholder="مثال: تويوتا"
              />
            </Field>

            <Field error={errors.carModel}>
              <Input
                id="carModel"
                label="الموديل *"
                value={form.carModel}
                onChange={(e) => update("carModel", e.target.value)}
                placeholder="مثال: كامري"
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
                className="mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-ink focus:ring-2 focus:ring-brand"
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
              />
            </Field>

            <Field error={errors.preferredDate}>
              <Input
                id="preferredDate"
                label="التاريخ المفضل *"
                type="date"
                value={form.preferredDate}
                onChange={(e) => update("preferredDate", e.target.value)}
              />
            </Field>

            <Field error={errors.preferredTime}>
              <Input
                id="preferredTime"
                label="الوقت المفضل *"
                type="time"
                value={form.preferredTime}
                onChange={(e) => update("preferredTime", e.target.value)}
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
                className="mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ink focus:ring-2 focus:ring-brand"
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
                className="mt-1.5 w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-ink focus:ring-2 focus:ring-brand"
              />
            </Field>
          </div>

          {submitError && (
            <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {submitError}
            </p>
          )}

          <div className="mt-6">
            <Button type="submit" disabled={loading}>
              {loading ? "جارٍ الإرسال..." : "إرسال طلب الحجز"}
            </Button>
          </div>
        </Card>
      </form>
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
      {error && <span className="mt-1 text-xs font-bold text-red-600">{error}</span>}
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
              className={`rounded-md border-2 px-5 py-2 text-sm font-bold transition-colors ${
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
