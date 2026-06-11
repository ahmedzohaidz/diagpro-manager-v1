"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createAuthBrowserClient } from "@/lib/supabase/authBrowserClient";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

/**
 * Customer login page (Phase 20A).
 * Email + password via Supabase Auth.
 * Redirects to /customer dashboard on success.
 */

export default function CustomerLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const supabase = createAuthBrowserClient();

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.push("/customer");
      }
    });
  }, [router]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createAuthBrowserClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setError(error.message || "فشل تسجيل الدخول. تحقق من البيانات.");
        return;
      }

      router.push("/customer");
    } catch {
      setError("حدث خطأ. حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted) return null;

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <Input
        id="email"
        label="البريد الإلكتروني"
        type="email"
        placeholder="example@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
        dir="ltr"
      />

      <Input
        id="password"
        label="كلمة المرور"
        type="password"
        placeholder="••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        required
      />

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
          {error}
        </p>
      )}

      <Button
        variant="primary"
        type="submit"
        disabled={loading}
        className="w-full"
      >
        {loading ? "جارٍ تسجيل الدخول..." : "تسجيل الدخول"}
      </Button>

      <p className="text-center text-xs text-white/60">
        لا تملك حسابًا؟ تواصل مع الإدارة.
      </p>
    </form>
  );
}
