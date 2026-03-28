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
  const [newAdditionalContext, setNewAdditionalContext] = useState("");
  const [newIsPublic, setNewIsPublic] = useState(false);
  const [newIsCommonUse, setNewIsCommonUse] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editUrl, setEditUrl] = useState("");
  const [editImageDescription, setEditImageDescription] = useState("");
  const [editCelebrityRecognition, setEditCelebrityRecognition] = useState("");
  const [editAdditionalContext, setEditAdditionalContext] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(false);
  const [editIsCommonUse, setEditIsCommonUse] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

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

  async function uploadFileAndGetPublicUrl(file: File, userId: string | null) {
    const safeFileName = file.name.replace(/\s+/g, "-");
    const filePath = `${userId ?? "anonymous"}/${Date.now()}-${safeFileName}`;

    const { error: uploadError } = await supabase.storage
      .from("images")
      .upload(filePath, file, {
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function handleCreateImage(e: React.FormEvent) {
    e.preventDefault();

    setFormError(null);
    setFormSuccess(null);
    setUploading(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      let finalUrl = newUrl.trim();

      if (newFile) {
        finalUrl = await uploadFileAndGetPublicUrl(newFile, user?.id ?? null);
      }

      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      
      const { data, error } = await supabase
        .from("images")
        .insert([
          {
            url: finalUrl || null,
            image_description: newImageDescription || null,
            celebrity_recognition: newCelebrityRecognition || null,
            additional_context: newAdditionalContext || null,
            is_public: newIsPublic,
            is_common_use: newIsCommonUse,
            profile_id: userId,
      
            // ✅ REQUIRED
            created_by_user_id: userId,
            modified_by_user_id: userId,
          },
        ])
        .select();

      console.log("created image data =", data);
      console.log("create image error =", error);

      if (error) {
        throw new Error(error.message);
      }

      setNewUrl("");
      setNewImageDescription("");
      setNewCelebrityRecognition("");
      setNewAdditionalContext("");
      setNewIsPublic(false);
      setNewIsCommonUse(false);
      setNewFile(null);
      setFormSuccess("Image created successfully.");
      loadImages();
    } catch (error) {
      console.error("handleCreateImage error =", error);
      setFormError(
        error instanceof Error ? error.message : "Failed to create image."
      );
    } finally {
      setUploading(false);
    }
  }

  function startEdit(image: ImageRow) {
    setFormError(null);
    setFormSuccess(null);
    setEditingId(image.id ?? null);
    setEditUrl(image.url ?? "");
    setEditImageDescription(image.image_description ?? "");
    setEditCelebrityRecognition(image.celebrity_recognition ?? "");
    setEditAdditionalContext(image.additional_context ?? "");
    setEditIsPublic(Boolean(image.is_public));
    setEditIsCommonUse(Boolean(image.is_common_use));
  }

  function cancelEdit() {
    setEditingId(null);
    setEditUrl("");
    setEditImageDescription("");
    setEditCelebrityRecognition("");
    setEditAdditionalContext("");
    setEditIsPublic(false);
    setEditIsCommonUse(false);
  }

  async function handleUpdateImage(id: string) {
    setFormError(null);
    setFormSuccess(null);

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData?.user?.id;
  
  const { error } = await supabase
    .from("images")
    .update({
      url: editUrl || null,
      image_description: editImageDescription || null,
      celebrity_recognition: editCelebrityRecognition || null,
      additional_context: editAdditionalContext || null,
      is_public: editIsPublic,
      is_common_use: editIsCommonUse,
      modified_by_user_id: userId,
    })
    .eq("id", id);

    console.log("update image error =", error);

    if (error) {
      setFormError(error.message);
      return;
    }

    setFormSuccess("Image updated successfully.");
    cancelEdit();
    loadImages();
  }

  async function handleDeleteImage(id: string) {
    setFormError(null);
    setFormSuccess(null);

    const confirmed = window.confirm("Delete this image?");
    if (!confirmed) return;

    const { error } = await supabase.from("images").delete().eq("id", id);

    console.log("delete image error =", error);

    if (error) {
      setFormError(error.message);
      return;
    }

    setFormSuccess("Image deleted successfully.");
    loadImages();
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
              <label className="block font-medium mb-1">Upload Image File</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setNewFile(e.target.files?.[0] ?? null)}
                className="w-full border rounded-lg p-3"
              />
              <p className="text-sm text-gray-500 mt-1">
                You can upload a file, paste a URL, or do both. If a file is selected, the uploaded file URL will be used.
              </p>
            </div>

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
              <textarea
                value={newCelebrityRecognition}
                onChange={(e) => setNewCelebrityRecognition(e.target.value)}
                className="w-full border rounded-lg p-3"
                rows={3}
                placeholder="Can be blank at first"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">Additional Context</label>
              <textarea
                value={newAdditionalContext}
                onChange={(e) => setNewAdditionalContext(e.target.value)}
                className="w-full border rounded-lg p-3"
                rows={3}
                placeholder="Optional additional context"
              />
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newIsPublic}
                  onChange={(e) => setNewIsPublic(e.target.checked)}
                />
                Is Public
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={newIsCommonUse}
                  onChange={(e) => setNewIsCommonUse(e.target.checked)}
                />
                Is Common Use
              </label>
            </div>

            {formError && <p className="text-red-600">{formError}</p>}
            {formSuccess && <p className="text-green-600">{formSuccess}</p>}

            <button
              type="submit"
              disabled={uploading}
              className="bg-black text-white px-5 py-3 rounded-xl disabled:opacity-50"
            >
              {uploading ? "Uploading / Creating..." : "Create Image"}
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
                      <textarea
                        value={editCelebrityRecognition}
                        onChange={(e) =>
                          setEditCelebrityRecognition(e.target.value)
                        }
                        className="w-full border rounded-lg p-3"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block font-medium mb-1">
                        Additional Context
                      </label>
                      <textarea
                        value={editAdditionalContext}
                        onChange={(e) => setEditAdditionalContext(e.target.value)}
                        className="w-full border rounded-lg p-3"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-6">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editIsPublic}
                          onChange={(e) => setEditIsPublic(e.target.checked)}
                        />
                        Is Public
                      </label>

                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={editIsCommonUse}
                          onChange={(e) => setEditIsCommonUse(e.target.checked)}
                        />
                        Is Common Use
                      </label>
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
                    <p className="mb-2">
                      Additional Context: {image.additional_context ?? "-"}
                    </p>
                    <p className="mb-2">
                      Is Public: {image.is_public ? "TRUE" : "FALSE"}
                    </p>
                    <p className="mb-2">
                      Is Common Use: {image.is_common_use ? "TRUE" : "FALSE"}
                    </p>
                    <p className="mb-2 break-all">
                      Profile ID: {image.profile_id ?? "-"}
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