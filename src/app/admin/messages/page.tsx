'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';

interface QueuedMessage {
  id: string;
  booking_id: string;
  phone_number: string;
  message_text: string;
  status: string;
  wa_link: string;
  queued_at: string;
  sent_at?: string;
  delivered_at?: string;
}

interface Stats {
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  read: number;
  failed: number;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<QueuedMessage[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<QueuedMessage | null>(
    null
  );

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  async function loadMessages() {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/messages/queue');
      const data = await res.json();

      if (data.status === 'success') {
        setMessages(data.messages || []);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSendViaWA(msg: QueuedMessage) {
    // Open wa.me link in new window
    window.open(msg.wa_link, '_blank');

    // Mark as sent
    try {
      const res = await fetch('/api/admin/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: msg.id }),
      });

      if (res.ok) {
        loadMessages();
      }
    } catch (error) {
      console.error('Failed to mark as sent:', error);
    }
  }

  function handleCopyLink(msg: QueuedMessage) {
    navigator.clipboard.writeText(msg.wa_link);
    alert('تم نسخ الرابط');
  }

  function handleShowQR(msg: QueuedMessage) {
    setSelectedMessage(msg);
    setShowQR(true);
  }

  function getStatusBadge(status: string) {
    const colors: Record<string, string> = {
      queued: 'bg-yellow-100 text-yellow-800',
      sent: 'bg-blue-100 text-blue-800',
      delivered: 'bg-green-100 text-green-800',
      read: 'bg-purple-100 text-purple-800',
      failed: 'bg-red-100 text-red-800',
    };

    const labels: Record<string, string> = {
      queued: 'قيد الانتظار',
      sent: 'مرسلة',
      delivered: 'تم التسليم',
      read: 'مقروءة',
      failed: 'فشل',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${
          colors[status] || 'bg-gray-100'
        }`}
      >
        {labels[status] || status}
      </span>
    );
  }

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">رسائل الـ WhatsApp</h1>
        <p className="text-gray-600 mt-2">إدارة قائمة الرسائل المعلقة</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-600">
              {stats.queued}
            </div>
            <p className="text-sm text-yellow-800">قيد الانتظار</p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{stats.sent}</div>
            <p className="text-sm text-blue-800">مرسلة</p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {stats.delivered}
            </div>
            <p className="text-sm text-green-800">تم التسليم</p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">
              {stats.read}
            </div>
            <p className="text-sm text-purple-800">مقروءة</p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-red-800">فشل</p>
          </div>
        </div>
      )}

      {/* Messages List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <p className="mt-2">جاري التحميل...</p>
        </div>
      ) : messages.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center text-gray-600">
          لا توجد رسائل معلقة
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <p className="font-semibold text-gray-800">
                    {msg.phone_number}
                  </p>
                  <p className="text-sm text-gray-600">Booking: {msg.booking_id}</p>
                </div>
                {getStatusBadge(msg.status)}
              </div>

              <p className="text-gray-700 mb-3 text-sm bg-gray-50 p-3 rounded">
                {msg.message_text}
              </p>

              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => handleCopyLink(msg)}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                >
                  نسخ الرابط
                </button>

                <button
                  onClick={() => handleShowQR(msg)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  QR Code
                </button>

                <button
                  onClick={() => handleSendViaWA(msg)}
                  className="px-4 py-2 bg-yellow-400 text-gray-800 rounded-lg hover:bg-yellow-500 text-sm font-semibold"
                >
                  إرسال يدويًا
                </button>

                <a
                  href={msg.wa_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 text-sm"
                >
                  فتح في WhatsApp
                </a>
              </div>

              <p className="text-xs text-gray-500 mt-3">
                {new Date(msg.queued_at).toLocaleString('ar-SA')}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* QR Code Modal */}
      {showQR && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4 text-center">QR Code</h2>

            <div className="flex justify-center mb-4 bg-white p-4 border-2 border-gray-200 rounded-lg">
              <QRCode value={selectedMessage.wa_link} size={256} />
            </div>

            <p className="text-sm text-gray-600 text-center mb-4">
              امسح هذا الـ QR لفتح الرسالة في WhatsApp
            </p>

            <p className="text-xs text-gray-500 text-center mb-4">
              {selectedMessage.phone_number}
            </p>

            <button
              onClick={() => setShowQR(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <button
          onClick={loadMessages}
          disabled={loading}
          className="px-6 py-2 bg-yellow-400 text-gray-800 font-semibold rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition"
        >
          {loading ? 'جاري التحديث...' : 'تحديث'}
        </button>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-800 text-sm">
          <strong>كيفية الاستخدام:</strong> انسخ الرابط أو امسح الـ QR، ثم افتح
          رسالة WhatsApp. سيتم تحديث الحالة تلقائياً بعد 3 ثوانٍ من الإرسال.
        </p>
      </div>
    </div>
  );
}
