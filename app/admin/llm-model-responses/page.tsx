"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type LlmModelResponse = {
  id: string;
  created_datetime_utc: string | null;
  llm_model_response: string | null;
  processing_time_seconds: number | null;
  llm_model_id: number | null;
  profile_id: string | null;
  caption_request_id: number | null;
  llm_system_prompt: string | null;
  llm_user_prompt: string | null;
  llm_temperature: number | null;
  humor_flavor_id: number | null;
  llm_prompt_chain_id: number | null;
  humor_flavor_step_id: number | null;
};

export default function LlmModelResponsesPage() {
  const [rows, setRows] = useState<LlmModelResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRows() {
      const { data, error } = await supabase
        .from("llm_model_responses")
        .select(
          "id, created_datetime_utc, llm_model_response, processing_time_seconds, llm_model_id, profile_id, caption_request_id, llm_system_prompt, llm_user_prompt, llm_temperature, humor_flavor_id, llm_prompt_chain_id, humor_flavor_step_id"
        )
        .order("created_datetime_utc", { ascending: false })
        .limit(50);

      console.log("llm_model_responses data =", data);
      console.log("llm_model_responses error =", error);

      if (!error && data) {
        setRows(data);
      }

      setLoading(false);
    }

    loadRows();
  }, []);

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-[1450px] mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">LLM Responses</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading llm responses...</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
                  <p className="break-all">
                    <span className="font-semibold">ID:</span> {row.id}
                  </p>
                  <p>
                    <span className="font-semibold">LLM Model ID:</span>{" "}
                    {row.llm_model_id ?? "-"}
                  </p>
                  <p className="break-all">
                    <span className="font-semibold">Profile ID:</span>{" "}
                    {row.profile_id ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Caption Request ID:</span>{" "}
                    {row.caption_request_id ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Processing Time:</span>{" "}
                    {row.processing_time_seconds ?? "-"} sec
                  </p>
                  <p>
                    <span className="font-semibold">Temperature:</span>{" "}
                    {row.llm_temperature ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Humor Flavor ID:</span>{" "}
                    {row.humor_flavor_id ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Prompt Chain ID:</span>{" "}
                    {row.llm_prompt_chain_id ?? "-"}
                  </p>
                  <p>
                    <span className="font-semibold">Flavor Step ID:</span>{" "}
                    {row.humor_flavor_step_id ?? "-"}
                  </p>
                  <p className="xl:col-span-3">
                    <span className="font-semibold">Created:</span>{" "}
                    {row.created_datetime_utc ?? "-"}
                  </p>
                </div>

                <div className="grid xl:grid-cols-3 gap-4">
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

                  <div>
                    <h2 className="font-semibold mb-2">LLM Response</h2>
                    <div className="border rounded-xl p-4 whitespace-pre-wrap break-words bg-gray-50 max-h-[500px] overflow-auto">
                      {row.llm_model_response ?? "-"}
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