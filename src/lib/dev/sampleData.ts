import type { Booking } from "@/lib/bookings/types";

/**
 * Local test/demo data helper (offline only). Creates clearly-labeled sample
 * bookings in localStorage so the full flow can be exercised without manually
 * filling the /book form. This is for testing/demo purposes only.
 */

const BOOKINGS_KEY = "diagpro_bookings";
const WORK_ORDERS_KEY = "diagpro_work_orders";
const WORK_ORDERS_COUNTER_KEY = "diagpro_work_orders_counter";

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function genId(): string {
  if (isBrowser() && typeof window.crypto?.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `bk_demo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Appends a small set of demo bookings. Returns how many were added. */
export function seedSampleBookings(): number {
  if (!isBrowser()) return 0;
  const now = new Date().toISOString();

  const make = (
    customerFullName: string,
    phone: string,
    carMake: string,
    carModel: string,
    carYear: string,
    status: Booking["status"],
    priority: Booking["priority"],
    problemDescription: string,
    isDrivable: boolean,
    hasCheckEngineLight: boolean
  ): Booking => ({
    id: genId(),
    customerFullName: `${customerFullName} (تجريبي)`,
    phone,
    carMake,
    carModel,
    carYear,
    plateNumber: "",
    problemDescription,
    isDrivable,
    hasCheckEngineLight,
    preferredDate: "2026-06-15",
    preferredTime: "10:00",
    notes: "بيانات تجريبية للاختبار",
    status,
    priority,
    createdAt: now,
    updatedAt: now,
  });

  const samples: Booking[] = [
    make("سعد العتيبي", "0535473565", "تويوتا", "كامري", "2018", "new_request", "high", "اهتزاز عند التسارع وصوت غير طبيعي", false, true),
    make("منى القحطاني", "0501112233", "هونداي", "النترا", "2021", "missing_data", "normal", "صوت في الفرامل", true, false),
    make("خالد الزهراني", "0539998877", "نيسان", "التيما", "2017", "pending_review", "normal", "ضعف في التكييف", true, false),
    make("ريم الشهري", "0566554433", "كيا", "سيراتو", "2020", "confirmed", "normal", "لمبة المحرك تضيء أحياناً", true, true),
    make("فهد الدوسري", "0544332211", "فورد", "تورس", "2016", "arrived", "high", "السيارة لا تشتغل", false, false),
  ];

  const raw = window.localStorage.getItem(BOOKINGS_KEY);
  const existing: Booking[] = raw ? JSON.parse(raw) : [];
  window.localStorage.setItem(
    BOOKINGS_KEY,
    JSON.stringify([...samples, ...existing])
  );
  return samples.length;
}

/** Clears ALL local bookings and work orders (demo + real local data). */
export function clearAllLocalData(): void {
  if (!isBrowser()) return;
  [BOOKINGS_KEY, WORK_ORDERS_KEY, WORK_ORDERS_COUNTER_KEY].forEach((k) =>
    window.localStorage.removeItem(k)
  );
}
