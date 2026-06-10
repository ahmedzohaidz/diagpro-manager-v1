"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createAuthBrowserClient } from "@/lib/supabase/authBrowserClient";

function safeRedirectTarget(): string {
  if (typeof window === "undefined") return "/admin/bookings";
  const param = new URLSearchParams(window.location.search).get("redirect");
  // Only allow internal admin paths (prevent open-redirect).
  if (param && param.startsWith("/admin") && !param.startsWith("//")) {
    return param;
  }
  return "/admin/bookings";
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createAuthBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signInError) {
        setError("بيانات الدخول غير صحيحة، حاول مرة أخرى.");
        return;
      }
      // Full navigation so the session cookie is sent and middleware allows it.
      window.location.assign(safeRedirectTarget());
    } catch {
      setError("تعذّر تسجيل الدخول، حاول مرة أخرى.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-center text-2xl font-extrabold text-white">
        تسجيل دخول الموظفين
      </h1>
      <p className="mb-6 text-center text-white/60">
        هذه المنطقة مخصّصة لموظفي الورشة. الرجاء تسجيل الدخول للمتابعة.
      </p>

      <Card>
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="email"
            label="البريد الإلكتروني"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@workshop.com"
          />
          <Input
            id="password"
            label="كلمة المرور"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
          />

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
              {error}
            </p>
          )}

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? "جارٍ الدخول..." : "تسجيل الدخول"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
