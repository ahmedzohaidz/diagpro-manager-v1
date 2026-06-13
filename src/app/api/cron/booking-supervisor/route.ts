import { NextRequest, NextResponse } from 'next/server';
import { runBookingSupervisorAgent } from '@/lib/agents/booking-supervisor-agent';

/**
 * Phase 21-2: Cron Trigger for Booking Supervisor Agent
 *
 * This endpoint is called by a cron scheduler (e.g., Vercel Cron, AWS EventBridge)
 * on a regular schedule (e.g., every hour, every 6 hours).
 *
 * Usage:
 * - Vercel: Set in vercel.json crons array
 * - Manual: POST /api/cron/booking-supervisor?secret=YOUR_SECRET
 * - Scheduled task: Call daily/hourly with proper auth
 *
 * Security: Uses CRON_SECRET to prevent unauthorized invocation
 */

const CRON_SECRET = process.env.CRON_SECRET || 'default-secret';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret (protection against unauthorized calls)
    const secret = request.headers.get('authorization')?.split(' ')[1];

    if (!secret || secret !== CRON_SECRET) {
      // Also check query parameter as fallback
      const url = new URL(request.url);
      const querySecret = url.searchParams.get('secret');

      if (!querySecret || querySecret !== CRON_SECRET) {
        return NextResponse.json(
          {
            status: 'error',
            message: 'Unauthorized cron access',
          },
          { status: 401 }
        );
      }
    }

    // Run the agent
    const result = await runBookingSupervisorAgent();

    // Return result
    return NextResponse.json(
      {
        status: result.status,
        timestamp: result.timestamp,
        summary: {
          bookings_analyzed: result.bookings_analyzed,
          actions_identified: result.actions_identified,
          messages_logged: result.messages_logged,
        },
        details: {
          actions: result.actions,
          errors: result.errors,
        },
      },
      { status: result.status === 'success' ? 200 : 500 }
    );
  } catch (error) {
    console.error('Cron endpoint error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to run agent',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
