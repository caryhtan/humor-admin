"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      console.log("admin auth user =", user);
      console.log("admin auth user error =", userError);

      if (!user) {
        router.replace("/login");
        return;
      }

      const email = user.email?.trim().toLowerCase();

      console.log("admin normalized email =", email);

      if (!email) {
        router.replace("/login");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("email, is_superadmin")
        .ilike("email", email)
        .maybeSingle();

      console.log("admin profile row =", data);
      console.log("admin profile error =", error);

      if (error || !data?.is_superadmin) {
        router.replace("/login");
        return;
      }

      setLoading(false);
    }

    checkAdmin();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading admin page...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Humor Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-black text-white px-4 py-2 rounded-xl"
          >
            Log out
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Link href="/admin/users" className="block">
            <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Users</h2>
              <p className="text-gray-600">Read profiles</p>
            </div>
          </Link>

          <Link href="/admin/images" className="block">
            <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Images</h2>
              <p className="text-gray-600">Create, read, update, delete images</p>
            </div>
          </Link>

          <Link href="/admin/captions" className="block">
            <div className="bg-white rounded-2xl shadow p-6 hover:shadow-lg transition">
              <h2 className="text-xl font-semibold mb-2">Captions</h2>
              <p className="text-gray-600">Read captions</p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}