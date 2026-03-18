"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checkingAccess, setCheckingAccess] = useState(true);

  useEffect(() => {
    async function checkAccess() {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          await supabase.auth.signOut();
          router.replace("/login");
          return;
        }

        if (!user) {
          router.replace("/login");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("is_superadmin")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError || !profile?.is_superadmin) {
          router.replace("/login");
          return;
        }

        setCheckingAccess(false);
      } catch (error) {
        console.error("Admin access check failed:", error);
        await supabase.auth.signOut();
        router.replace("/login");
      }
    }

    checkAccess();
  }, [router]);

  if (checkingAccess) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">Checking admin access...</p>
      </main>
    );
  }

  return <>{children}</>;
}