"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type LlmModelRow = {
  id: number;
  created_datetime_utc: string | null;
  name: string | null;
  llm_provider_id: number | null;
  provider_model_id: string | null;
  is_temperature_supported: boolean | null;
};

export default function LlmModelsPage() {
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [rows, setRows] = useState<LlmModelRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newName, setNewName] = useState("");
  const [newProviderId, setNewProviderId] = useState("");
  const [newProviderModelId, setNewProviderModelId] = useState("");
  const [newIsTemperatureSupported, setNewIsTemperatureSupported] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState("");
  const [editProviderId, setEditProviderId] = useState("");
  const [editProviderModelId, setEditProviderModelId] = useState("");
  const [editIsTemperatureSupported, setEditIsTemperatureSupported] = useState(false);

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("llm_models")
      .select(
        "id, created_datetime_utc, name, llm_provider_id, provider_model_id, is_temperature_supported"
      )
      .order("id", { ascending: false });

    console.log("llm_models data =", data);
    console.log("llm_models error =", error);

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

    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase.from("llm_models").insert([
      {
        name: newName || null,
        llm_provider_id:
          newProviderId.trim() === "" ? null : Number(newProviderId),
        provider_model_id: newProviderModelId || null,
        is_temperature_supported: newIsTemperatureSupported,
      },
    ]);

    console.log("create llm model error =", error);

    if (error) {
      setFormError(error.message);
      return;
    }

    setFormSuccess("LLM model created.");
    setNewName("");
    setNewProviderId("");
    setNewProviderModelId("");
    setNewIsTemperatureSupported(false);
    loadRows();
  }

  function startEdit(row: LlmModelRow) {
    setFormError(null);
    setFormSuccess(null);
    setEditingId(row.id);
    setEditName(row.name ?? "");
    setEditProviderId(row.llm_provider_id?.toString() ?? "");
    setEditProviderModelId(row.provider_model_id ?? "");
    setEditIsTemperatureSupported(Boolean(row.is_temperature_supported));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditName("");
    setEditProviderId("");
    setEditProviderModelId("");
    setEditIsTemperatureSupported(false);
  }

  async function handleUpdate(id: number) {
    setFormError(null);
    setFormSuccess(null);

    const { error } = await supabase
      .from("llm_models")
      .update({
        name: editName || null,
        llm_provider_id:
          editProviderId.trim() === "" ? null : Number(editProviderId),
        provider_model_id: editProviderModelId || null,
        is_temperature_supported: editIsTemperatureSupported,
      })
      .eq("id", id);

    console.log("update llm model error =", error);

    if (error) {
      setFormError(error.message);
      return;
    }

    setFormSuccess("LLM model updated.");
    cancelEdit();
    loadRows();
  }

  async function handleDelete(id: number) {
    setFormError(null);
    setFormSuccess(null);

    if (!window.confirm("Delete this llm model?")) return;

    const { error } = await supabase.from("llm_models").delete().eq("id", id);

    console.log("delete llm model error =", error);

    if (error) {
      setFormError(error.message);
      return;
    }

    setFormSuccess("LLM model deleted.");
    loadRows();
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">LLM Models</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create LLM Model</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Name"
            />
            <input
              type="number"
              value={newProviderId}
              onChange={(e) => setNewProviderId(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="LLM Provider ID"
            />
            <input
              type="text"
              value={newProviderModelId}
              onChange={(e) => setNewProviderModelId(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Provider Model ID"
            />
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newIsTemperatureSupported}
                onChange={(e) =>
                  setNewIsTemperatureSupported(e.target.checked)
                }
              />
              Temperature Supported
            </label>

            {formError && <p className="text-red-600">{formError}</p>}
            {formSuccess && <p className="text-green-600">{formSuccess}</p>}

            <button
              type="submit"
              className="bg-black text-white px-5 py-3 rounded-xl"
            >
              Create LLM Model
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading llm models...</p>
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
                      placeholder="Name"
                    />
                    <input
                      type="number"
                      value={editProviderId}
                      onChange={(e) => setEditProviderId(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      placeholder="LLM Provider ID"
                    />
                    <input
                      type="text"
                      value={editProviderModelId}
                      onChange={(e) => setEditProviderModelId(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      placeholder="Provider Model ID"
                    />
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={editIsTemperatureSupported}
                        onChange={(e) =>
                          setEditIsTemperatureSupported(e.target.checked)
                        }
                      />
                      Temperature Supported
                    </label>

                    {formError && <p className="text-red-600">{formError}</p>}
                    {formSuccess && <p className="text-green-600">{formSuccess}</p>}

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
                      <span className="font-semibold">Name:</span>{" "}
                      {row.name ?? "-"}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">LLM Provider ID:</span>{" "}
                      {row.llm_provider_id ?? "-"}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Provider Model ID:</span>{" "}
                      {row.provider_model_id ?? "-"}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Temperature Supported:</span>{" "}
                      {row.is_temperature_supported ? "TRUE" : "FALSE"}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      Created: {row.created_datetime_utc ?? "-"}
                    </p>

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