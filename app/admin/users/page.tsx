"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type Profile = {
  email: string | null;
  first_name?: string | null;
  last_name?: string | null;
  is_superadmin?: boolean | null;
  is_matrix_admin?: boolean | null;
  is_in_study?: boolean | null;
};

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfiles() {
      const { data, error } = await supabase
        .from("profiles")
        .select("email, first_name, last_name, is_superadmin, is_matrix_admin, is_in_study")
        .order("email", { ascending: true });

      console.log("users data =", data);
      console.log("users error =", error);

      if (!error && data) {
        setProfiles(data);
      }

      setLoading(false);
    }

    loadProfiles();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Users / Profiles</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading profiles...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-4">Email</th>
                  <th className="p-4">First Name</th>
                  <th className="p-4">Last Name</th>
                  <th className="p-4">Superadmin</th>
                  <th className="p-4">Matrix Admin</th>
                  <th className="p-4">In Study</th>
                </tr>
              </thead>
              <tbody>
                {profiles.map((profile, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-4">{profile.email ?? "-"}</td>
                    <td className="p-4">{profile.first_name ?? "-"}</td>
                    <td className="p-4">{profile.last_name ?? "-"}</td>
                    <td className="p-4">{profile.is_superadmin ? "TRUE" : "FALSE"}</td>
                    <td className="p-4">{profile.is_matrix_admin ? "TRUE" : "FALSE"}</td>
                    <td className="p-4">{profile.is_in_study ? "TRUE" : "FALSE"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}