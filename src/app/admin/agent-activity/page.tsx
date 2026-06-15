'use client';

import { useEffect, useState } from 'react';
import { getAgentActivity } from '@/lib/agents/booking-supervisor-agent';

interface AgentRun {
  id: string;
  note: string;
  created_at: string;
}

interface Message {
  id: string;
  booking_id: string;
  direction: string;
  channel: string;
  created_at: string;
  bookings: Array<{
    customer_full_name: string;
    status: string;
  }>;
}

interface ActivityData {
  agent_runs: AgentRun[];
  recent_messages: Message[];
  total_messages_sent: number;
}

export default function AgentActivityDashboard() {
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadActivity();
    // Refresh every 5 minutes
    const interval = setInterval(loadActivity, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  async function loadActivity() {
    try {
      setLoading(true);
      const data = await getAgentActivity(7);
      setActivity(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load agent activity'
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleString('ar-SA');
  }

  if (loading && !activity) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <p className="mt-2">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-800">خطأ: {error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">نشاط وكيل الحجوزات</h1>
        <p className="text-gray-600 mt-2">آخر 7 أيام</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="text-3xl font-bold text-blue-600">
            {activity?.agent_runs.length || 0}
          </div>
          <p className="text-blue-800 mt-2">عمليات تشغيل الـ Agent</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="text-3xl font-bold text-green-600">
            {activity?.total_messages_sent || 0}
          </div>
          <p className="text-green-800 mt-2">رسائل مرسلة</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-lg border border-yellow-200">
          <div className="text-3xl font-bold text-yellow-600">
            {activity?.agent_runs.length
              ? Math.round(
                  ((activity?.total_messages_sent || 0) /
                    (activity?.agent_runs.length || 1)) *
                    10
                ) / 10
              : 0}
          </div>
          <p className="text-yellow-800 mt-2">رسائل/تشغيل</p>
        </div>
      </div>

      {/* Agent Runs */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">عمليات التشغيل</h2>
        {activity?.agent_runs && activity.agent_runs.length > 0 ? (
          <div className="space-y-3">
            {activity.agent_runs.map((run) => (
              <div
                key={run.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">{run.note}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {formatDate(run.created_at)}
                    </p>
                  </div>
                  <span className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                    ✓ نجح
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
            لا توجد عمليات تشغيل في الفترة الأخيرة
          </div>
        )}
      </div>

      {/* Recent Messages */}
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">الرسائل المرسلة مؤخراً</h2>
        {activity?.recent_messages && activity.recent_messages.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="p-3 text-right text-gray-700">العميل</th>
                  <th className="p-3 text-right text-gray-700">حالة الحجز</th>
                  <th className="p-3 text-right text-gray-700">النوع</th>
                  <th className="p-3 text-right text-gray-700">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {activity.recent_messages.map((msg) => (
                  <tr
                    key={msg.id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="p-3 text-gray-800">
                      {msg.bookings?.[0]?.customer_full_name || 'غير معروف'}
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {msg.bookings?.[0]?.status || 'N/A'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                        {msg.channel === 'whatsapp' ? 'واتساب' : msg.channel}
                      </span>
                    </td>
                    <td className="p-3 text-gray-600 text-sm">
                      {formatDate(msg.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
            لا توجد رسائل مرسلة في الفترة الأخيرة
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadActivity}
          disabled={loading}
          className="px-6 py-2 bg-yellow-400 text-gray-800 font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition"
        >
          {loading ? 'جاري التحديث...' : 'تحديث'}
        </button>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>ملاحظة:</strong> يتم تحديث لوحة التحكم تلقائياً كل 5 دقائق. يمكنك أيضاً الضغط على زر
          &quot;تحديث&quot; لتحديث البيانات على الفور.
        </p>
      </div>
    </div>
  );
}
