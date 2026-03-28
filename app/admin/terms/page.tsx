"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type TermRow = {
  id: number;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
  term: string | null;
  definition: string | null;
  example: string | null;
  priority: number | null;
  term_type_id: number | null;
};

export default function TermsPage() {
  const [rows, setRows] = useState<TermRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newTerm, setNewTerm] = useState("");
  const [newDefinition, setNewDefinition] = useState("");
  const [newExample, setNewExample] = useState("");
  const [newPriority, setNewPriority] = useState("");
  const [newTermTypeId, setNewTermTypeId] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTerm, setEditTerm] = useState("");
  const [editDefinition, setEditDefinition] = useState("");
  const [editExample, setEditExample] = useState("");
  const [editPriority, setEditPriority] = useState("");
  const [editTermTypeId, setEditTermTypeId] = useState("");

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("terms")
      .select("id, created_datetime_utc, modified_datetime_utc, term, definition, example, priority, term_type_id")
      .order("id", { ascending: false });

    console.log("terms data =", data);
    console.log("terms error =", error);

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

    const { error } = await supabase.from("terms").insert([
      {
        term: newTerm || null,
        definition: newDefinition || null,
        example: newExample || null,
        priority: newPriority.trim() === "" ? null : Number(newPriority),
        term_type_id: newTermTypeId.trim() === "" ? null : Number(newTermTypeId),
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
      },
    ]);

    console.log("create term error =", error);

    if (!error) {
      setNewTerm("");
      setNewDefinition("");
      setNewExample("");
      setNewPriority("");
      setNewTermTypeId("");
      loadRows();
    }
  }

  function startEdit(row: TermRow) {
    setEditingId(row.id);
    setEditTerm(row.term ?? "");
    setEditDefinition(row.definition ?? "");
    setEditExample(row.example ?? "");
    setEditPriority(row.priority?.toString() ?? "");
    setEditTermTypeId(row.term_type_id?.toString() ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditTerm("");
    setEditDefinition("");
    setEditExample("");
    setEditPriority("");
    setEditTermTypeId("");
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
      .from("terms")
      .update({
        term: editTerm || null,
        definition: editDefinition || null,
        example: editExample || null,
        priority: editPriority.trim() === "" ? null : Number(editPriority),
        term_type_id: editTermTypeId.trim() === "" ? null : Number(editTermTypeId),
        modified_by_user_id: user.id,
      })
      .eq("id", id);

    console.log("update term error =", error);

    if (!error) {
      cancelEdit();
      loadRows();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this term?")) return;

    const { error } = await supabase.from("terms").delete().eq("id", id);

    console.log("delete term error =", error);

    if (!error) {
      loadRows();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Terms</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Term</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newTerm}
              onChange={(e) => setNewTerm(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="Term"
            />
            <textarea
              value={newDefinition}
              onChange={(e) => setNewDefinition(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={3}
              placeholder="Definition"
            />
            <textarea
              value={newExample}
              onChange={(e) => setNewExample(e.target.value)}
              className="w-full border rounded-lg p-3"
              rows={3}
              placeholder="Example"
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
                type="number"
                value={newTermTypeId}
                onChange={(e) => setNewTermTypeId(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Term Type ID"
              />
            </div>

            <button type="submit" className="bg-black text-white px-5 py-3 rounded-xl">
              Create Term
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading terms...</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                {editingId === row.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editTerm}
                      onChange={(e) => setEditTerm(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      placeholder="Term"
                    />
                    <textarea
                      value={editDefinition}
                      onChange={(e) => setEditDefinition(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={3}
                      placeholder="Definition"
                    />
                    <textarea
                      value={editExample}
                      onChange={(e) => setEditExample(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      rows={3}
                      placeholder="Example"
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
                        type="number"
                        value={editTermTypeId}
                        onChange={(e) => setEditTermTypeId(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        placeholder="Term Type ID"
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
                    <p className="mb-2"><span className="font-semibold">Term:</span> {row.term ?? "-"}</p>
                    <p className="mb-2"><span className="font-semibold">Definition:</span> {row.definition ?? "-"}</p>
                    <p className="mb-2"><span className="font-semibold">Example:</span> {row.example ?? "-"}</p>
                    <p className="mb-2"><span className="font-semibold">Priority:</span> {row.priority ?? "-"}</p>
                    <p className="mb-2"><span className="font-semibold">Term Type ID:</span> {row.term_type_id ?? "-"}</p>
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