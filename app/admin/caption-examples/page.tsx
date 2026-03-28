"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type CaptionExampleRow = {
  id: number;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
  image_description: string | null;
  caption: string | null;
  explanation: string | null;
  priority: number | null;
  image_id: string | null;
};

export default function CaptionExamplesPage() {
  const [rows, setRows] = useState<CaptionExampleRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newImageDescription, setNewImageDescription] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [newExplanation, setNewExplanation] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newImageId, setNewImageId] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editImageDescription, setEditImageDescription] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editExplanation, setEditExplanation] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editImageId, setEditImageId] = useState("");

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("caption_examples")
      .select("id, created_datetime_utc, modified_datetime_utc, image_description, caption, explanation, priority, image_id")
      .order("id", { ascending: false });

    console.log("caption_examples data =", data);
    console.log("caption_examples error =", error);

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

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("user error =", userError);
      return;
    }

    const { error } = await supabase.from("caption_examples").insert([
      {
        image_description: newImageDescription || null,
        caption: newCaption || null,
        explanation: newExplanation || null,
        priority: newPriority.trim() === "" ? null : Number(newPriority),
        image_id: newImageId.trim() === "" ? null : newImageId,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
      },
    ]);

    console.log("create caption example error =", error);

    if (!error) {
      setNewImageDescription("");
      setNewCaption("");
      setNewExplanation("");
      setNewPriority("");
      setNewImageId("");
      loadRows();
    }
  }

  function startEdit(row: CaptionExampleRow) {
    setEditingId(row.id);
    setEditImageDescription(row.image_description ?? "");
    setEditCaption(row.caption ?? "");
    setEditExplanation(row.explanation ?? "");
    setEditPriority(row.priority?.toString() ?? "");
    setEditImageId(row.image_id ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditImageDescription("");
    setEditCaption("");
    setEditExplanation("");
    setEditPriority("");
    setEditImageId("");
  }

  async function handleUpdate(id: number) {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("user error =", userError);
      return;
    }

    const { error } = await supabase
      .from("caption_examples")
      .update({
        image_description: editImageDescription || null,
        caption: editCaption || null,
        explanation: editExplanation || null,
        priority: editPriority.trim() === "" ? null : Number(editPriority),
        image_id: editImageId.trim() === "" ? null : editImageId,
        modified_by_user_id: user.id,
      })
      .eq("id", id);

    console.log("update caption example error =", error);

    if (!error) {
      cancelEdit();
      loadRows();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this caption example?")) return;

    const { error } = await supabase.from("caption_examples").delete().eq("id", id);

    console.log("delete caption example error =", error);

    if (!error) {
      loadRows();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Caption Examples</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Caption Example</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <textarea
              value={newImageDescription}
              onChange={(e) => setNewImageDescription(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={3}
              placeholder="Image description"
            />
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={3}
              placeholder="Caption"
            />
            <textarea
              value={newExplanation}
              onChange={(e) => setNewExplanation(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={3}
              placeholder="Explanation"
            />
            <div className="grid md:grid-cols-2 gap-4">
              <input
                type="number"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Priority"
              />
              <input
                type="text"
                value={newImageId}
                onChange={(e) => setNewImageId(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Image ID (optional)"
              />
            </div>

            <button type="submit" className="bg-black text-white px-5 py-3 rounded-xl">
              Create Caption Example
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading caption examples...</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                {editingId === row.id ? (
                  <div className="space-y-4">
                    <textarea
                      value={editImageDescription}
                      onChange={(e) => setEditImageDescription(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={3}
                      placeholder="Image description"
                    />
                    <textarea
                      value={editCaption}
                      onChange={(e) => setEditCaption(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={3}
                      placeholder="Caption"
                    />
                    <textarea
                      value={editExplanation}
                      onChange={(e) => setEditExplanation(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={3}
                      placeholder="Explanation"
                    />
                    <div className="grid md:grid-cols-2 gap-4">
                      <input
                        type="number"
                        value={editPriority}
                        onChange={(e) => setEditPriority(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        placeholder="Priority"
                      />
                      <input
                        type="text"
                        value={editImageId}
                        onChange={(e) => setEditImageId(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        placeholder="Image ID (optional)"
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
                    <p className="mb-2"><span className="font-semibold">ID:</span> {row.id}</p>
                    <p className="mb-2"><span className="font-semibold">Image Description:</span> {row.image_description ?? "-"}</p>
                    <p className="mb-2"><span className="font-semibold">Caption:</span> {row.caption ?? "-"}</p>
                    <p className="mb-2"><span className="font-semibold">Explanation:</span> {row.explanation ?? "-"}</p>
                    <p className="mb-2"><span className="font-semibold">Priority:</span> {row.priority ?? "-"}</p>
                    <p className="mb-2 break-all"><span className="font-semibold">Image ID:</span> {row.image_id ?? "-"}</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Created: {row.created_datetime_utc ?? "-"}<br />
                      Modified: {row.modified_datetime_utc ?? "-"}
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