"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type CaptionRequest = {
  id: number;
  created_datetime_utc: string | null;
  profile_id: string | null;
  image_id: string | null;
};

export default function CaptionRequestsPage() {
  const [rows, setRows] = useState<CaptionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRows() {
      const { data, error } = await supabase
        .from("caption_requests")
        .select("id, created_datetime_utc, profile_id, image_id")
        .order("id", { ascending: false });

      console.log("caption_requests data =", data);
      console.log("caption_requests error =", error);

      if (!error && data) {
        setRows(data);
      }

      setLoading(false);
    }

    loadRows();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Caption Requests</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading caption requests...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Profile ID</th>
                  <th className="p-4">Image ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b align-top">
                    <td className="p-4">{row.id}</td>
                    <td className="p-4 whitespace-nowrap">
                      {row.created_datetime_utc ?? "-"}
                    </td>
                    <td className="p-4 break-all">{row.profile_id ?? "-"}</td>
                    <td className="p-4 break-all">{row.image_id ?? "-"}</td>
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