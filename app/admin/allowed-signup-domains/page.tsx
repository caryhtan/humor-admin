"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type AllowedSignupDomainRow = {
  id: number;
  created_datetime_utc: string | null;
  apex_domain: string | null;
};

export default function AllowedSignupDomainsPage() {
  const [rows, setRows] = useState<AllowedSignupDomainRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newApexDomain, setNewApexDomain] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editApexDomain, setEditApexDomain] = useState("");

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("allowed_signup_domains")
      .select("id, created_datetime_utc, apex_domain")
      .order("id", { ascending: false });

    console.log("allowed_signup_domains data =", data);
    console.log("allowed_signup_domains error =", error);

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

    const { error } = await supabase.from("allowed_signup_domains").insert([
      {
        apex_domain: newApexDomain || null,
        created_by_user_id: user.id,
        modified_by_user_id: user.id,
      },
    ]);

    console.log("create allowed_signup_domain error =", error);

    if (!error) {
      setNewApexDomain("");
      loadRows();
    }
  }

  function startEdit(row: AllowedSignupDomainRow) {
    setEditingId(row.id);
    setEditApexDomain(row.apex_domain ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditApexDomain("");
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
      .from("allowed_signup_domains")
      .update({
        apex_domain: editApexDomain || null,
        modified_by_user_id: user.id,
      })
      .eq("id", id);

    console.log("update allowed_signup_domain error =", error);

    if (!error) {
      cancelEdit();
      loadRows();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this allowed signup domain?")) return;

    const { error } = await supabase
      .from("allowed_signup_domains")
      .delete()
      .eq("id", id);

    console.log("delete allowed_signup_domain error =", error);

    if (!error) {
      loadRows();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Allowed Signup Domains</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Allowed Signup Domain</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              value={newApexDomain}
              onChange={(e) => setNewApexDomain(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="apex_domain"
            />
            <button type="submit" className="bg-black text-white px-5 py-3 rounded-xl">
              Create Domain
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading allowed signup domains...</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                {editingId === row.id ? (
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={editApexDomain}
                      onChange={(e) => setEditApexDomain(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      placeholder="apex_domain"
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
                    <p className="mb-2"><span className="font-semibold">Apex Domain:</span> {row.apex_domain ?? "-"}</p>
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