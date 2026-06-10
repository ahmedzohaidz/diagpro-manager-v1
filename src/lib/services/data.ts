/**
 * Static catalogue of customer-facing services shown on the home and
 * /services pages. Display-only — does not touch booking data or RPCs.
 */

export type ServiceCategory = "تشخيص" | "كهرباء" | "برمجة" | "فحص";

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  categories: ServiceCategory[];
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  "تشخيص",
  "كهرباء",
  "برمجة",
  "فحص",
];

export const SERVICES: ServiceItem[] = [
  {
    id: "full-computer-scan",
    title: "فحص كمبيوتر شامل",
    description: "فحص شامل لجميع أنظمة السيارة وتحديد الأعطال بدقة عالية.",
    icon: "💻",
    categories: ["فحص", "تشخيص"],
  },
  {
    id: "ecu-programming",
    title: "برمجة وحدات التحكم ECU",
    description: "برمجة وتهيئة وحدات التحكم الأصلية وتحديث وترقية البرمجيات.",
    icon: "🧩",
    categories: ["برمجة"],
  },
  {
    id: "key-remote-programming",
    title: "برمجة المفاتيح والريموت",
    description: "برمجة مفاتيح وريموتات جديدة وحذف المفقود منها بطريقة آمنة.",
    icon: "🔑",
    categories: ["برمجة"],
  },
  {
    id: "complex-electrical-diagnosis",
    title: "تشخيص أعطال الكهرباء المعقدة",
    description: "تشخيص دقيق لأعطال الكهرباء باستخدام مخططات كهربائية حديثة.",
    icon: "⚡",
    categories: ["تشخيص", "كهرباء"],
  },
  {
    id: "battery-alternator-check",
    title: "فحص البطارية والدينمو",
    description: "فحص شامل للبطارية والدينمو واختبار نظام الشحن والأداء.",
    icon: "🔋",
    categories: ["فحص", "كهرباء"],
  },
  {
    id: "can-bus-check",
    title: "فحص شبكات CAN Bus",
    description: "فحص جميع شبكات CAN Bus وتشخيص أعطال الاتصال بين وحدات التحكم.",
    icon: "🔗",
    categories: ["فحص", "تشخيص"],
  },
  {
    id: "sensors-throttle-check",
    title: "فحص الحساسات والثروتل",
    description: "فحص وتنظيف وبرمجة الحساسات والثروتل لضمان أداء مثالي.",
    icon: "🌀",
    categories: ["فحص", "كهرباء"],
  },
];
