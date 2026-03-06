"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("auth user =", user);
      console.log("auth user error =", userError);

      if (!user) {
        router.replace("/login");
        return;
      }

      const email = user.email?.trim().toLowerCase();

      console.log("normalized email =", email);

      if (!email) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("email, is_superadmin")
        .ilike("email", email)
        .maybeSingle();

      console.log("profile row =", data);
      console.log("profile error =", error);

      if (error || !data?.is_superadmin) {
        router.replace("/login");
        return;
      }

      router.replace("/admin");
    }

    checkUser();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>Checking access...</p>
    </main>
  );
}