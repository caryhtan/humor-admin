"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Signing you in...");

  useEffect(() => {
    async function finishLogin() {
      try {
        // Give Supabase a moment to read the auth response from the URL
        const { data, error } = await supabase.auth.getSession();

        console.log("callback session =", data);
        console.log("callback error =", error);

        if (error) {
          setMessage("Login failed. Please try again.");
          return;
        }

        // Small delay helps ensure session is persisted before redirect
        setTimeout(() => {
          router.replace("/");
        }, 500);
      } catch (err) {
        console.error("callback unexpected error =", err);
        setMessage("Unexpected login error.");
      }
    }

    finishLogin();
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p>{message}</p>
    </main>
  );
}