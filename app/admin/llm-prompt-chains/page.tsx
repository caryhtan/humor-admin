"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type LlmPromptChain = {
  id: number;
  created_datetime_utc: string | null;
  caption_request_id: number | null;
};

export default function LlmPromptChainsPage() {
  const [rows, setRows] = useState<LlmPromptChain[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRows() {
      const { data, error } = await supabase
        .from("llm_prompt_chains")
        .select("id, created_datetime_utc, caption_request_id")
        .order("id", { ascending: false });

      console.log("llm_prompt_chains data =", data);
      console.log("llm_prompt_chains error =", error);

      if (!error && data) {
        setRows(data);
      }

      setLoading(false);
    }

    loadRows();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">LLM Prompt Chains</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading llm prompt chains...</p>
        ) : (
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b">
                <tr>
                  <th className="p-4">ID</th>
                  <th className="p-4">Created</th>
                  <th className="p-4">Caption Request ID</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b">
                    <td className="p-4">{row.id}</td>
                    <td className="p-4 whitespace-nowrap">
                      {row.created_datetime_utc ?? "-"}
                    </td>
                    <td className="p-4">{row.caption_request_id ?? "-"}</td>
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