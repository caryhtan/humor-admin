"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function LoginPage() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function signInWithGoogle() {
    setBusy(true);
    setErr(null);

    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true,
      },
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }

    if (data?.url) {
      window.location.href = data.url;
      return;
    }

    setErr("No OAuth redirect URL was returned.");
    setBusy(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">Admin Login</h1>
        <p className="text-gray-600 mb-6">
          Sign in with Google to access the admin area.
        </p>

        <button
          onClick={signInWithGoogle}
          disabled={busy}
          className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
        >
          {busy ? "Opening Google…" : "Sign in with Google"}
        </button>

        {err && <p className="text-red-500 mt-4">{err}</p>}
      </div>
    </main>
  );
}