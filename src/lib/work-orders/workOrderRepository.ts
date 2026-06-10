import type { WorkOrderRepository } from "./types";
import { localWorkOrderRepository } from "./localWorkOrderRepository";
import { supabaseWorkOrderRepository } from "./supabaseWorkOrderRepository";

/**
 * Repository selector for work orders.
 *
 * Chooses the implementation from NEXT_PUBLIC_DATA_MODE:
 *   - "supabase" → Supabase-backed repository
 *   - "local" or missing → localStorage repository (default)
 *
 * Manual switch only — there is NO automatic fallback. A failed Supabase call
 * surfaces as an error; nothing is silently written to localStorage.
 */
const mode = process.env.NEXT_PUBLIC_DATA_MODE;

export const workOrderRepository: WorkOrderRepository =
  mode === "supabase" ? supabaseWorkOrderRepository : localWorkOrderRepository;
