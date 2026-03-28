"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type WhitelistEmailRow = {
  id: number;
  created_datetime_utc: string | null;
  modified_datetime_utc: string | null;
  email_address: string | null;
};

export default function WhitelistEmailAddressesPage() {
  const [rows, setRows] = useState<WhitelistEmailRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newEmailAddress, setNewEmailAddress] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmailAddress, setEditEmailAddress] = useState("");

  async function loadRows() {
    setLoading(true);

    const { data, error } = await supabase
      .from("whitelist_email_addresses")
      .select("id, created_datetime_utc, modified_datetime_utc, email_address")
      .order("id", { ascending: false });

    console.log("whitelist_email_addresses data =", data);
    console.log("whitelist_email_addresses error =", error);

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

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    const { error } = await supabase.from("whitelist_email_addresses").insert([
      {
        email_address: newEmailAddress || null,
        created_by_user_id: userId,
        modified_by_user_id: userId,
      },
    ]);

    console.log("create whitelist email error =", error);

    if (!error) {
      setNewEmailAddress("");
      loadRows();
    }
  }

  function startEdit(row: WhitelistEmailRow) {
    setEditingId(row.id);
    setEditEmailAddress(row.email_address ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditEmailAddress("");
  }

  async function handleUpdate(id: number) {
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    
    const { error } = await supabase
      .from("whitelist_email_addresses")
      .update({
        email_address: editEmailAddress || null,
        modified_by_user_id: userId,
      })
      .eq("id", id);

    console.log("update whitelist email error =", error);

    if (!error) {
      cancelEdit();
      loadRows();
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this whitelisted email?")) return;

    const { error } = await supabase
      .from("whitelist_email_addresses")
      .delete()
      .eq("id", id);

    console.log("delete whitelist email error =", error);

    if (!error) {
      loadRows();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Whitelisted E-mail Addresses</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Whitelisted E-mail</h2>

          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="email"
              value={newEmailAddress}
              onChange={(e) => setNewEmailAddress(e.target.value)}
              className="w-full border rounded-lg p-3"
              placeholder="email_address"
            />
            <button type="submit" className="bg-black text-white px-5 py-3 rounded-xl">
              Create Email
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading whitelisted emails...</p>
          ) : (
            rows.map((row) => (
              <div key={row.id} className="bg-white rounded-2xl shadow p-6">
                {editingId === row.id ? (
                  <div className="space-y-4">
                    <input
                      type="email"
                      value={editEmailAddress}
                      onChange={(e) => setEditEmailAddress(e.target.value)}
                      className="w-full border rounded-lg p-3"
                      placeholder="email_address"
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
                    <p className="mb-2"><span className="font-semibold">Email Address:</span> {row.email_address ?? "-"}</p>
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