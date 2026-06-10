import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const sections = [
  {
    href: "/book",
    title: "حجز موعد",
    description: "صفحة الحجز الإلكتروني للعملاء لتسجيل طلب جديد.",
  },
  {
    href: "/admin/bookings",
    title: "الحجوزات",
    description: "لوحة الإدارة لمتابعة طلبات الحجز الواردة.",
  },
  {
    href: "/admin/work-orders",
    title: "أوامر العمل",
    description: "متابعة أوامر العمل بعد تحويل الحجوزات.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="rounded-xl border-2 border-ink bg-white p-6">
        <span className="inline-block rounded-md bg-brand px-3 py-1 text-sm font-bold text-ink">
          DiagPro Manager V1 — نسخة التدفق النقدي
        </span>
        <h1 className="mt-4 text-2xl font-extrabold text-ink sm:text-3xl">
          مرحباً بك في نظام إدارة الورشة
        </h1>
        <p className="mt-2 max-w-2xl text-ink-soft">
          ابدأ من إدارة الحجوزات الإلكترونية: استقبل الطلبات، تابع العملاء، وحوّل
          الحجوزات إلى أوامر عمل بوضوح.
        </p>
        <div className="mt-5">
          <Link href="/book">
            <Button>حجز موعد جديد</Button>
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-extrabold text-ink">الأقسام</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <Link key={section.href} href={section.href} className="block">
              <Card className="h-full transition-shadow hover:shadow-md">
                <h3 className="text-lg font-bold text-ink">{section.title}</h3>
                <p className="mt-2 text-sm text-ink-soft">
                  {section.description}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
