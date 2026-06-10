import type { Booking } from "@/lib/bookings/types";

/**
 * Types for the local rule-based Booking Customer Supervisor (Phase 8).
 *
 * This is NOT an AI/OpenAI integration — it is a deterministic, rule-based
 * analyzer over local bookings. It can be upgraded to a real AI agent later.
 */

export interface Recommendation {
  recommendation: string;
  suggestedAction: string;
}

export interface SupervisorItem {
  booking: Booking;
  urgencyScore: number;
  recommendations: Recommendation[];
}

export interface SupervisorSummary {
  needingAttention: number;
  highPriority: number;
  arrivedNotConverted: number;
  missingData: number;
  confirmed: number;
}

export interface SupervisorResult {
  items: SupervisorItem[];
  summary: SupervisorSummary;
}
