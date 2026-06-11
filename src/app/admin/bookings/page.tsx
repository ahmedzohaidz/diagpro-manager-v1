"use client";

import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Detail } from "@/components/ui/Detail";
import { DemoDataControls } from "@/components/admin/DemoDataControls";
import { BookingDetailsDrawer } from "@/components/admin/BookingDetailsDrawer";
import { ConvertBookingModal } from "@/components/admin/ConvertBookingModal";
import { ConvertResultNotice } from "@/components/admin/ConvertResultNotice";
import { bookingStatusLabels, type BookingStatus } from "@/lib/statuses";
import { bookingRepository } from "@/lib/bookings/bookingRepository";
import { statusLogRepository } from "@/lib/bookings/statusLogRepository";
import { workOrderRepository } from "@/lib/work-orders/workOrderRepository";
import {
  useConvertBooking,
  CONVERTIBLE_STATUSES,
} from "@/lib/work-orders/useConvertBooking";
import type { Booking, BookingStatusLog } from "@/lib/bookings/types";
import type { WorkOrder } from "@/lib/work-orders/types";
import {
  bookingStatusTone,
  priorityLabel,
  priorityTone,
  formatDateTime,
  yesNoLabel,
  drivableTone,
  checkEngineTone,
  ACTION_LABELS,
  BTN_NEUTRAL,
  BTN_PRIMARY,
} from "@/lib/ui/display";

// Quick status actions available directly on each booking card. The full set
// of status transitions lives in the details drawer.
const quickActions: { status: BookingStatus; label: string }[] = [
  { status: "confirmed", label: ACTION_LABELS.confirmAppointment },
  { status: "cancelled", label: ACTION_LABELS.rejectBooking },
];

type DateFilter = "all" | "today";

function isToday(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"all" | BookingStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | "high" | "normal">(
    "all"
  );
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [search, setSearch] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statusLogs, setStatusLogs] = useState<BookingStatusLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(
    null
  );

  const {
    convertTarget,
    converting,
    notice,
    setNotice,
    requestConvert,
    cancelConvert,
    confirmConvert,
  } = useConvertBooking({
    onConverted: async (_workOrder, booking) => {
      await load();
      if (selectedId === booking.id) {
        await loadStatusLogs(booking.id);
        await loadWorkOrder(booking.id);
      }
    },
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await bookingRepository.list();
      setBookings(data);
    } catch {
      setError("تعذّر تحميل الحجوزات.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function loadStatusLogs(bookingId: string) {
    setLogsLoading(true);
    try {
      const logs = await statusLogRepository.list(bookingId);
      setStatusLogs(logs);
    } finally {
      setLogsLoading(false);
    }
  }

  async function loadWorkOrder(bookingId: string) {
    try {
      const wo = await workOrderRepository.findByBooking(bookingId);
      setSelectedWorkOrder(wo);
    } catch {
      setSelectedWorkOrder(null);
    }
  }

  function openDetails(booking: Booking) {
    setSelectedId(booking.id);
    setStatusLogs([]);
    setSelectedWorkOrder(null);
    void loadStatusLogs(booking.id);
    void loadWorkOrder(booking.id);
  }

  function closeDetails() {
    setSelectedId(null);
    setStatusLogs([]);
    setSelectedWorkOrder(null);
  }

  async function handleStatusChange(id: string, status: BookingStatus) {
    setNotice(null);
    const previous = bookings.find((b) => b.id === id);
    try {
      await bookingRepository.updateStatus(id, status);
      await statusLogRepository.add(id, previous?.status ?? null, status);
      await load();
      if (selectedId === id) {
        await loadStatusLogs(id);
      }
    } catch {
      setError("تعذّر تحديث حالة الحجز.");
    }
  }

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings.filter((b) => {
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (priorityFilter !== "all" && b.priority !== priorityFilter) return false;
      if (dateFilter === "today" && !isToday(b.createdAt)) return false;
      if (term) {
        const haystack = `${b.customerFullName} ${b.phone} ${b.carMake} ${b.carModel} ${b.plateNumber ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [bookings, statusFilter, priorityFilter, dateFilter, search]);

  const selectedBooking = useMemo(
    () => bookings.find((b) => b.id === selectedId) ?? null,
    [bookings, selectedId]
  );

  const stats = useMemo(
    () => ({
      total: bookings.length,
      new: bookings.filter((b) => b.status === "new_request").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      today: bookings.filter((b) => isToday(b.createdAt)).length,
    }),
    [bookings]
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-extrabold text-white">الحجوزات</h1>
          <p className="mt-1 text-white/60">
            متابعة طلبات الحجز الإلكترونية وإدارة حالتها.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="rounded-md border border-white/20 bg-white/5 px-4 py-2 text-sm font-bold text-white transition-colors hover:border-brand hover:bg-brand hover:text-ink"
        >
          تحديث
        </button>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="إجمالي الحجوزات" value={stats.total} />
        <StatCard label="طلبات جديدة" value={stats.new} accent />
        <StatCard label="مواعيد مؤكدة" value={stats.confirmed} />
        <StatCard label="طلبات اليوم" value={stats.today} />
      </div>

      {/* Filters */}
      <Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="statusFilter" className="text-sm font-bold text-ink">
              حالة الحجز
            </label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | BookingStatus)
              }
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand"
            >
              <option value="all">كل الحالات</option>
              {(Object.keys(bookingStatusLabels) as BookingStatus[]).map((s) => (
                <option key={s} value={s}>
                  {bookingStatusLabels[s]}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="priorityFilter" className="text-sm font-bold text-ink">
              الأولوية
            </label>
            <select
              id="priorityFilter"
              value={priorityFilter}
              onChange={(e) =>
                setPriorityFilter(e.target.value as "all" | "high" | "normal")
              }
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand"
            >
              <option value="all">كل الأولويات</option>
              <option value="high">أولوية عالية</option>
              <option value="normal">عادي</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="dateFilter" className="text-sm font-bold text-ink">
              التاريخ
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as DateFilter)}
              className="w-full rounded-md border border-ink/20 bg-white px-3 py-2 text-sm text-ink outline-none focus:border-ink focus:ring-2 focus:ring-brand"
            >
              <option value="all">كل التواريخ</option>
              <option value="today">طلبات اليوم</option>
            </select>
          </div>

          <Input
            id="search"
            label="بحث (الاسم، الجوال، السيارة، اللوحة)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="اكتب اسم العميل أو رقم الجوال..."
          />
        </div>
      </Card>

      <DemoDataControls onChange={load} />

      {notice && <ConvertResultNotice notice={notice} />}

      {error && (
        <div className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
          {error}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="space-y-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="animate-pulse rounded-xl border border-white/10 bg-white/5 p-5"
            >
              <div className="h-5 w-40 rounded bg-white/10" />
              <div className="mt-3 h-4 w-24 rounded bg-white/10" />
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="h-4 w-full rounded bg-white/10" />
                <div className="h-4 w-full rounded bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-12 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand/15 text-2xl">
            📭
          </div>
          <p className="text-base font-bold text-white">لا توجد حجوزات بعد</p>
          <p className="mt-1 text-sm text-white/50">
            ستظهر الحجوزات هنا عند استلام طلبات جديدة من صفحة الحجز.
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/15 bg-white/5 px-4 py-10 text-center">
          <p className="text-sm font-bold text-white/70">
            لا توجد نتائج مطابقة للبحث أو التصفية.
          </p>
          <p className="mt-1 text-xs text-white/40">
            جرّب تغيير الفلاتر أو مسح حقل البحث.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-white/50">عدد النتائج: {filtered.length}</p>
          {filtered.map((b) => (
            <BookingCard
              key={b.id}
              booking={b}
              onStatusChange={handleStatusChange}
              onConvert={requestConvert}
              onOpenDetails={openDetails}
            />
          ))}
        </div>
      )}

      {selectedBooking && (
        <BookingDetailsDrawer
          booking={selectedBooking}
          statusLogs={statusLogs}
          logsLoading={logsLoading}
          workOrder={selectedWorkOrder}
          onClose={closeDetails}
          onStatusChange={handleStatusChange}
          onConvert={requestConvert}
        />
      )}

      {convertTarget && (
        <ConvertBookingModal
          booking={convertTarget}
          submitting={converting}
          onCancel={cancelConvert}
          onConfirm={confirmConvert}
        />
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-4 ${
        accent
          ? "border-brand/50 bg-brand/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <p className="text-xs font-bold text-white/50">{label}</p>
      <p
        className={`mt-1 text-2xl font-extrabold ${
          accent ? "text-brand" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function BookingCard({
  booking,
  onStatusChange,
  onConvert,
  onOpenDetails,
}: {
  booking: Booking;
  onStatusChange: (id: string, status: BookingStatus) => void;
  onConvert: (booking: Booking) => void;
  onOpenDetails: (booking: Booking) => void;
}) {
  const canConvert = CONVERTIBLE_STATUSES.includes(booking.status);
  const isNew = booking.status === "new_request";

  return (
    <Card
      className={
        isNew ? "border-2 border-brand ring-1 ring-brand/40" : undefined
      }
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="break-words text-lg font-bold text-ink">
            {booking.customerFullName}
          </h3>
          <p className="text-sm text-ink-soft" dir="ltr">
            {booking.phone}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isNew && <StatusBadge label="جديد" tone="brand" />}
          <StatusBadge
            label={bookingStatusLabels[booking.status]}
            tone={bookingStatusTone[booking.status]}
          />
          <StatusBadge
            label={priorityLabel(booking.priority)}
            tone={priorityTone(booking.priority)}
          />
        </div>
      </div>

      <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
        <Detail label="السيارة">
          {booking.carMake} {booking.carModel} {booking.carYear}
        </Detail>
        <Detail label="رقم اللوحة">{booking.plateNumber || "غير محدد"}</Detail>
        <Detail label="السيارة تمشي؟">
          <StatusBadge
            label={yesNoLabel(booking.isDrivable)}
            tone={drivableTone(booking.isDrivable)}
          />
        </Detail>
        <Detail label="لمبة فحص المكينة؟">
          <StatusBadge
            label={yesNoLabel(booking.hasCheckEngineLight)}
            tone={checkEngineTone(booking.hasCheckEngineLight)}
          />
        </Detail>
        <Detail label="الموعد المفضل">
          {booking.preferredDate} - {booking.preferredTime}
        </Detail>
        <Detail label="تاريخ الإنشاء">{formatDateTime(booking.createdAt)}</Detail>
        <Detail label="المشكلة">{booking.problemDescription}</Detail>
        {booking.notes && <Detail label="ملاحظات">{booking.notes}</Detail>}
      </dl>

      <div className="mt-4 flex flex-wrap gap-2 border-t border-ink/10 pt-4">
        <button
          type="button"
          onClick={() => onOpenDetails(booking)}
          className={BTN_PRIMARY}
        >
          {ACTION_LABELS.viewDetails}
        </button>
        {quickActions.map((action) => (
          <button
            key={action.status}
            type="button"
            onClick={() => onStatusChange(booking.id, action.status)}
            disabled={booking.status === action.status}
            className={BTN_NEUTRAL}
          >
            {action.label}
          </button>
        ))}
        {canConvert && (
          <button
            type="button"
            onClick={() => onConvert(booking)}
            className={BTN_NEUTRAL}
          >
            {ACTION_LABELS.convertToWorkOrder}
          </button>
        )}
      </div>
    </Card>
  );
}
