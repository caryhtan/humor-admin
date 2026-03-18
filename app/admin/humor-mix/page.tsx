"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type HumorMixRow = {
  id: number;
  created_datetime_utc: string | null;
  humor_flavor_id: number | null;
  caption_count: number | null;
};

export default function HumorMixPage() {
  const [rows, setRows] = useState<HumorMixRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editHumorFlavorId, setEditHumorFlavorId] = useState("");
  const [editCaptionCount, setEditCaptionCount] = useState("");

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("humor_flavor_mix")
      .select("id, created_datetime_utc, humor_flavor_id, caption_count")
      .order("id", { ascending: true });

    console.log("humor_flavor_mix data =", data);
    console.log("humor_flavor_mix error =", error);

    if (!error && data) {
      setRows(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRows();
  }, []);

  function startEdit(row: HumorMixRow) {
    setEditingId(row.id);
    setEditHumorFlavorId(row.humor_flavor_id?.toString() ?? "");
    setEditCaptionCount(row.caption_count?.toString() ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditHumorFlavorId("");
    setEditCaptionCount("");
  }

  async function handleUpdate(id: number) {
    const parsedHumorFlavorId =
      editHumorFlavorId.trim() === "" ? null : Number(editHumorFlavorId);
    const parsedCaptionCount =
      editCaptionCount.trim() === "" ? null : Number(editCaptionCount);

    const { error } = await supabase
      .from("humor_flavor_mix")
      .update({
        humor_flavor_id: parsedHumorFlavorId,
        caption_count: parsedCaptionCount,
      })
      .eq("id", id);

    console.log("humor_flavor_mix update error =", error);

    if (!error) {
      cancelEdit();
      loadRows();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Humor Mix</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        {loading ? (
          <p>Loading humor mix...</p>
        ) : (
          <div className="space-y-4">
            {rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                {editingId === row.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">Humor Flavor ID</label>
                      <input
                        type="number"
                        value={editHumorFlavorId}
                        onChange={(e) => setEditHumorFlavorId(e.target.value)}
                        className="w-full border rounded-lg p-3"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">Caption Count</label>
                      <input
                        type="number"
                        value={editCaptionCount}
                        onChange={(e) => setEditCaptionCount(e.target.value)}
                        className="w-full border rounded-lg p-3"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdate(row.id)}
                        className="bg-black text-white px-4 py-2 rounded-xl"
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="bg-gray-300 px-4 py-2 rounded-xl"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">
                      <span className="font-semibold">ID:</span> {row.id}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Created:</span>{" "}
                      {row.created_datetime_utc ?? "-"}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Humor Flavor ID:</span>{" "}
                      {row.humor_flavor_id ?? "-"}
                    </p>
                    <p className="mb-4">
                      <span className="font-semibold">Caption Count:</span>{" "}
                      {row.caption_count ?? "-"}
                    </p>

                    <button
                      type="button"
                      onClick={() => startEdit(row)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}