"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type CaptionRow = Record<string, unknown>;

export default function CaptionsPage() {
  const [captions, setCaptions] = useState<CaptionRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCaptions() {
      const { data, error } = await supabase
        .from("captions")
        .select("*")
        .limit(50);

      console.log("captions data =", data);
      console.log("captions error =", error);

      if (!error && data) {
        setCaptions(data);
      }

      setLoading(false);
    }

    loadCaptions();
  }, []);

  function getCaptionText(caption: CaptionRow) {
    return (
      caption.caption_text ??
      caption.caption ??
      caption.text ??
      caption.content ??
      caption.generated_caption ??
      caption.output_text ??
      "(No caption text field found)"
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Captions</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading captions...</p>
        ) : (
          <div className="space-y-4">
            {captions.map((caption, index) => (
              <div
                key={String(caption.id ?? index)}
                className="bg-white rounded-2xl shadow p-5"
              >
                <p className="font-medium mb-3 break-words">
                  {String(getCaptionText(caption))}
                </p>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>ID: {String(caption.id ?? "-")}</p>
                  <p>Image ID: {String(caption.image_id ?? "-")}</p>
                  <p>Created At: {String(caption.created_at ?? "-")}</p>
                </div>

                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-blue-600">
                    Show raw row
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-3 rounded overflow-x-auto">
                    {JSON.stringify(caption, null, 2)}
                  </pre>
                </details>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}