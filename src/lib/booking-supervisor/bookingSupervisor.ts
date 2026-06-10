import type { Booking } from "@/lib/bookings/types";
import type { BookingStatus } from "@/lib/statuses";
import type {
  Recommendation,
  SupervisorItem,
  SupervisorResult,
  SupervisorSummary,
} from "./types";

/**
 * Rule-based Booking Customer Supervisor logic (Phase 8).
 *
 * Pure, deterministic functions — no network, no AI API. The supervisor scores
 * each booking for urgency and produces Arabic recommendations + suggested
 * actions, then sorts by highest urgency first.
 */

// Urgency contributions (additive). Status + priority are combined.
const STATUS_SCORE: Partial<Record<BookingStatus, number>> = {
  new_request: 20,
  missing_data: 15,
  confirmed: 10,
  arrived: 30,
  no_show: -10,
  converted_to_work_order: -50,
};

const HIGH_PRIORITY_SCORE = 30;

export function computeUrgencyScore(booking: Booking): number {
  let score = 0;
  if (booking.priority === "high") score += HIGH_PRIORITY_SCORE;
  score += STATUS_SCORE[booking.status] ?? 0;
  return score;
}

// Status-based recommendations (rules A–F).
const STATUS_RECOMMENDATIONS: Partial<Record<BookingStatus, Recommendation>> = {
  new_request: {
    recommendation: "يحتاج مراجعة فورية",
    suggestedAction: "راجع بيانات الحجز وأرسل تأكيد أو اطلب بيانات ناقصة",
  },
  missing_data: {
    recommendation: "بيانات ناقصة",
    suggestedAction: "أرسل رسالة طلب بيانات ناقصة عبر واتساب",
  },
  pending_review: {
    recommendation: "بانتظار قرار الإدارة",
    suggestedAction: "اقترح موعد مناسب أو أكد الموعد",
  },
  confirmed: {
    recommendation: "موعد مؤكد ولم يصل العميل بعد",
    suggestedAction: "أرسل تذكير قبل الموعد",
  },
  reminder_sent: {
    recommendation: "تم إرسال تذكير، راقب وصول العميل",
    suggestedAction: "عند وصول العميل سجّل وصوله",
  },
  arrived: {
    recommendation: "العميل وصل ولم يتحول إلى أمر عمل",
    suggestedAction: "حوّل الحجز إلى أمر عمل",
  },
};

// Priority-based recommendation (rule G).
const HIGH_PRIORITY_RECOMMENDATION: Recommendation = {
  recommendation: "أولوية عالية",
  suggestedAction: "تعامل مع هذا الحجز قبل الحجوزات العادية",
};

export function buildRecommendations(booking: Booking): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const statusRec = STATUS_RECOMMENDATIONS[booking.status];
  if (statusRec) recommendations.push(statusRec);
  if (booking.priority === "high") {
    recommendations.push(HIGH_PRIORITY_RECOMMENDATION);
  }
  return recommendations;
}

export function analyzeBookings(bookings: Booking[]): SupervisorResult {
  const items: SupervisorItem[] = bookings
    .map((booking) => ({
      booking,
      urgencyScore: computeUrgencyScore(booking),
      recommendations: buildRecommendations(booking),
    }))
    // Only surface bookings that actually need an action.
    .filter((item) => item.recommendations.length > 0)
    // Highest urgency first; tie-break by newest booking.
    .sort((a, b) => {
      if (b.urgencyScore !== a.urgencyScore) {
        return b.urgencyScore - a.urgencyScore;
      }
      return (
        new Date(b.booking.createdAt).getTime() -
        new Date(a.booking.createdAt).getTime()
      );
    });

  const summary: SupervisorSummary = {
    needingAttention: items.length,
    highPriority: bookings.filter((b) => b.priority === "high").length,
    arrivedNotConverted: bookings.filter((b) => b.status === "arrived").length,
    missingData: bookings.filter((b) => b.status === "missing_data").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
  };

  return { items, summary };
}
