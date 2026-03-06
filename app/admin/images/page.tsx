"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../../lib/supabaseClient";

type ImageRow = {
  id?: string;
  url?: string | null;
  image_description?: string | null;
  celebrity_recognition?: string | null;
  created_datetime_utc?: string | null;
  modified_datetime_utc?: string | null;
  additional_context?: string | null;
  is_public?: boolean | null;
  is_common_use?: boolean | null;
  profile_id?: string | null;
};

export default function ImagesPage() {
  const [images, setImages] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [newUrl, setNewUrl] = useState("");
  const [newImageDescription, setNewImageDescription] = useState("");
  const [newCelebrityRecognition, setNewCelebrityRecognition] = useState("");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editImageDescription, setEditImageDescription] = useState("");
  const [editCelebrityRecognition, setEditCelebrityRecognition] = useState("");

  async function loadImages() {
    setLoading(true);

    const { data, error } = await supabase
      .from("images")
      .select("*")
      .order("created_datetime_utc", { ascending: false })
      .limit(100);

    console.log("images data =", data);
    console.log("images error =", error);

    if (!error && data) {
      setImages(data);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadImages();
  }, []);

  async function handleCreateImage(e: React.FormEvent) {
    e.preventDefault();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("images")
      .insert([
        {
          url: newUrl || null,
          image_description: newImageDescription || null,
          celebrity_recognition: newCelebrityRecognition || null,
          profile_id: user?.id ?? null,
        },
      ])
      .select();

    console.log("created image data =", data);
    console.log("create image error =", error);

    if (!error) {
      setNewUrl("");
      setNewImageDescription("");
      setNewCelebrityRecognition("");
      loadImages();
    }
  }

  function startEdit(image: ImageRow) {
    setEditingId(image.id ?? null);
    setEditUrl(image.url ?? "");
    setEditImageDescription(image.image_description ?? "");
    setEditCelebrityRecognition(image.celebrity_recognition ?? "");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditUrl("");
    setEditImageDescription("");
    setEditCelebrityRecognition("");
  }

  async function handleUpdateImage(id: string) {
    const { error } = await supabase
      .from("images")
      .update({
        url: editUrl || null,
        image_description: editImageDescription || null,
        celebrity_recognition: editCelebrityRecognition || null,
      })
      .eq("id", id);

    console.log("update image error =", error);

    if (!error) {
      cancelEdit();
      loadImages();
    }
  }

  async function handleDeleteImage(id: string) {
    const confirmed = window.confirm("Delete this image?");
    if (!confirmed) return;

    const { error } = await supabase.from("images").delete().eq("id", id);

    console.log("delete image error =", error);

    if (!error) {
      loadImages();
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Images</h1>
          <Link href="/admin" className="text-blue-600 underline">
            ← Back to dashboard
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Create Image</h2>

          <form onSubmit={handleCreateImage} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Image URL</label>
              <input
                type="text"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Image Description</label>
              <textarea
                value={newImageDescription}
                onChange={(e) => setNewImageDescription(e.target.value)}
                className="w-full border rounded-lg p-3"
                rows={3}
                placeholder="Can be blank at first"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Celebrity Recognition</label>
              <input
                type="text"
                value={newCelebrityRecognition}
                onChange={(e) => setNewCelebrityRecognition(e.target.value)}
                className="w-full border rounded-lg p-3"
                placeholder="Can be blank at first"
              />
            </div>

            <button
              type="submit"
              className="bg-black text-white px-5 py-3 rounded-xl"
            >
              Create Image
            </button>
          </form>
        </div>

        <div className="space-y-4">
          {loading ? (
            <p>Loading images...</p>
          ) : (
            images.map((image, index) => (
              <div
                key={image.id ?? index}
                className="bg-white rounded-2xl shadow p-6"
              >
                {editingId === image.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block font-medium mb-1">Image URL</label>
                      <input
                        type="text"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        className="w-full border rounded-lg p-3"
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">
                        Image Description
                      </label>
                      <textarea
                        value={editImageDescription}
                        onChange={(e) => setEditImageDescription(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">
                        Celebrity Recognition
                      </label>
                      <input
                        type="text"
                        value={editCelebrityRecognition}
                        onChange={(e) =>
                          setEditCelebrityRecognition(e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => handleUpdateImage(image.id!)}
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
                    <p className="font-medium mb-2 break-all">
                      URL: {image.url ?? "-"}
                    </p>

                    {image.url && (
                      <img
                        src={image.url}
                        alt="uploaded"
                        className="mt-3 mb-4 max-h-64 rounded-lg"
                      />
                    )}

                    <p className="mb-2">
                      Description: {image.image_description ?? "-"}
                    </p>
                    <p className="mb-2">
                      Celebrity Recognition: {image.celebrity_recognition ?? "-"}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      ID: {image.id ?? "-"} <br />
                      Created: {image.created_datetime_utc ?? "-"} <br />
                      Modified: {image.modified_datetime_utc ?? "-"}
                    </p>

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(image)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-xl"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id!)}
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