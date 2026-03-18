"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type HumorFlavorStep = {
  id: number;
  created_datetime_utc: string | null;
  humor_flavor_id: number | null;
  llm_temperature: number | null;
  order_by: number | null;
  llm_input_type_id: number | null;
  llm_output_type_id: number | null;
  llm_model_id: number | null;
  humor_flavor_step_type_id: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  description: string | null;
};

export default function HumorFlavorStepsPage() {
  const [rows, setRows] = useState<HumorFlavorStep[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRows() {
      const { data, error } = await supabase
        .from("humor_flavor_steps")
        .select(
          "id, created_datetime_utc, humor_flavor_id, llm_temperature, order_by, llm_input_type_id, llm_output_type_id, llm_model_id, humor_flavor_step_type_id, llm_system_prompt, llm_user_prompt, description"
        )
        .order("humor_flavor_id", { ascending: true })
        .order("order_by", { ascending: true });

      console.log("humor_flavor_steps data =", data);
      console.log("humor_flavor_steps error =", error);

      if (!error && data) {
        setRows(data);
      }

      setLoading(false);
    }

    loadRows();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Humor Flavor Steps</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading humor flavor steps...</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                  <p><span className="font-semibold">ID:</span> {row.id}</p>
                  <p><span className="font-semibold">Flavor ID:</span> {row.humor_flavor_id ?? "-"}</p>
                  <p><span className="font-semibold">Order:</span> {row.order_by ?? "-"}</p>
                  <p><span className="font-semibold">Temperature:</span> {row.llm_temperature ?? "-"}</p>
                  <p><span className="font-semibold">Input Type ID:</span> {row.llm_input_type_id ?? "-"}</p>
                  <p><span className="font-semibold">Output Type ID:</span> {row.llm_output_type_id ?? "-"}</p>
                  <p><span className="font-semibold">LLM Model ID:</span> {row.llm_model_id ?? "-"}</p>
                  <p><span className="font-semibold">Step Type ID:</span> {row.humor_flavor_step_type_id ?? "-"}</p>
                  <p className="xl:col-span-2">
                    <span className="font-semibold">Created:</span> {row.created_datetime_utc ?? "-"}
                  </p>
                  <p className="xl:col-span-2">
                    <span className="font-semibold">Description:</span> {row.description ?? "-"}
                  </p>
                </div>

                <div className="grid xl:grid-cols-2 gap-4">
                  <div>
                    <h2 className="font-semibold mb-2">System Prompt</h2>
                    <div className="border rounded-xl p-4 whitespace-pre-wrap break-words bg-gray-50">
                      {row.llm_system_prompt ?? "-"}
                    </div>
                  </div>

                  <div>
                    <h2 className="font-semibold mb-2">User Prompt</h2>
                    <div className="border rounded-xl p-4 whitespace-pre-wrap break-words bg-gray-50">
                      {row.llm_user_prompt ?? "-"}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}