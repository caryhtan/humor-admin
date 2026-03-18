"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type HumorFlavor = {
  id: number;
  created_datetime_utc: string | null;
  description: string | null;
  slug: string | null;
};

export default function HumorFlavorsPage() {
  const [rows, setRows] = useState<HumorFlavor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRows() {
      const { data, error } = await supabase
        .from("humor_flavors")
        .select("id, created_datetime_utc, description, slug")
        .order("id", { ascending: true });

      console.log("humor_flavors data =", data);
      console.log("humor_flavors error =", error);

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
          <h1 className="text-3xl font-bold">Humor Flavors</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading humor flavors...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Slug</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b align-top">
                    <td className="p-4">{row.id}</td>
                    <td className="p-4 whitespace-nowrap">
                      {row.created_datetime_utc ?? "-"}
                    </td>
                    <td className="p-4">{row.slug ?? "-"}</td>
                    <td className="p-4">{row.description ?? "-"}</td>
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