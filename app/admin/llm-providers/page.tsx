"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type LlmProviderRow = {
  id: number;
  created_datetime_utc: string | null;
  name: string | null;
};

export default function LlmProvidersPage() {
  const [rows, setRows] = useState<LlmProviderRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("llm_providers")
      .select("id, created_datetime_utc, name")
      .order("id", { ascending: false });

    console.log("llm_providers data =", data);
    console.log("llm_providers error =", error);

    if (!error && data) {
      setRows(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadRows();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    const { error } = await supabase.from("llm_providers").insert([
      {
        name: newName || null,
      },
    ]);

    console.log("create llm provider error =", error);

    if (!error) {
      setNewName("");
      loadRows();
    }
  }

  function startEdit(row: LlmProviderRow) {
    setEditingId(row.id);
    setEditName(row.name ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleUpdate(id: number) {
    const { error } = await supabase
      .from("llm_providers")
      .update({
        name: editName || null,
      })
      .eq("id", id);

    console.log("update llm provider error =", error);

    if (!error) {
      cancelEdit();
      loadRows();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this llm provider?")) return;

    const { error } = await supabase.from("llm_providers").delete().eq("id", id);

    console.log("delete llm provider error =", error);

    if (!error) {
      loadRows();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">LLM Providers</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create LLM Provider</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Provider name"
            />
            <button type="submit" className="bg-black text-white px-5 py-3 rounded-xl">
              Create LLM Provider
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading llm providers...</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                {editingId === row.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      placeholder="Provider name"
                    />
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
                    <p className="mb-2"><span className="font-semibold">ID:</span> {row.id}</p>
                    <p className="mb-2"><span className="font-semibold">Name:</span> {row.name ?? "-"}</p>
                    <p className="text-sm text-gray-500 mb-4">Created: {row.created_datetime_utc ?? "-"}</p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(row)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-xl"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}