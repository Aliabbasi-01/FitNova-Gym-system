
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  ImagePlus,
  Upload,
  Pencil,
  Trash2,
  ArrowUp,
  ArrowDown,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type GalleryItem = {
  id: string;
  title: string;
  image_url: string;
  description: string | null;
  sort_order: number;
  status: "Active" | "Inactive";
  created_at: string;
};

const BUCKET = "gallery-images";
const MAX_SIZE = 5 * 1024 * 1024;

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#090B12] px-3 py-3 text-sm text-white outline-none placeholder:text-gray-600 focus:border-[#287BFF]";

function getStoragePath(url: string | null) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);

  return index === -1 ? null : url.slice(index + marker.length);
}

export default function GalleryClient() {
  const fileRef = useRef<HTMLInputElement>(null);

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"Active" | "Inactive">("Active");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [removeImage, setRemoveImage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadItems();
  }, []);

  useEffect(() => {
    if (!selectedFile) {
      setPreview(null);
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    setPreview(url);

    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("gallery_items")
      .select("*")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setItems((data ?? []) as GalleryItem[]);
    }

    setLoading(false);
  }

  function openAdd() {
    setEditing(null);
    setTitle("");
    setDescription("");
    setStatus("Active");
    setSelectedFile(null);
    setRemoveImage(false);
    setError("");
    setModalOpen(true);
  }

  function openEdit(item: GalleryItem) {
    setEditing(item);
    setTitle(item.title);
    setDescription(item.description ?? "");
    setStatus(item.status);
    setSelectedFile(null);
    setRemoveImage(false);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;
    setModalOpen(false);
    setEditing(null);
    setSelectedFile(null);
    setPreview(null);
    setRemoveImage(false);
    setError("");
  }

  function chooseFile(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image.");
      return;
    }

    if (file.size > MAX_SIZE) {
      setError("Image must be 5 MB or smaller.");
      return;
    }

    setError("");
    setSelectedFile(file);
    setRemoveImage(false);
  }

  async function uploadImage(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const allowed = ["jpg", "jpeg", "png", "webp", "gif"];

    if (!allowed.includes(extension)) {
      throw new Error("Use JPG, PNG, WEBP or GIF images.");
    }

    const path = `gallery/${crypto.randomUUID()}.${extension}`;

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return { path, url: data.publicUrl };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!editing && !selectedFile) {
      setError("Please select an image to upload.");
      return;
    }

    if (editing && removeImage && !selectedFile) {
      setError("Please select a replacement image or keep the current image.");
      return;
    }

    setSaving(true);
    let uploadedPath: string | null = null;

    try {
      let imageUrl = editing?.image_url ?? "";

      if (selectedFile) {
        const uploaded = await uploadImage(selectedFile);
        imageUrl = uploaded.url;
        uploadedPath = uploaded.path;
      }

      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        image_url: imageUrl,
        status,
      };

      const result = editing
        ? await supabase
            .from("gallery_items")
            .update(payload)
            .eq("id", editing.id)
        : await supabase
            .from("gallery_items")
            .insert({
              ...payload,
              sort_order:
                items.length > 0
                  ? Math.max(...items.map((item) => item.sort_order)) + 1
                  : 0,
            });

      if (result.error) throw result.error;

      if (editing && selectedFile) {
        const oldPath = getStoragePath(editing.image_url);
        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      setModalOpen(false);
      setEditing(null);
      setSelectedFile(null);
      setPreview(null);
      setRemoveImage(false);
      await loadItems();
    } catch (err) {
      if (uploadedPath) {
        await supabase.storage.from(BUCKET).remove([uploadedPath]);
      }

      setError(
        err instanceof Error ? err.message : "Unable to save gallery image."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(item: GalleryItem) {
    if (!window.confirm(`Delete "${item.title || "this image"}"?`)) return;

    setError("");

    const { error } = await supabase
      .from("gallery_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    const path = getStoragePath(item.image_url);
    if (path) {
      await supabase.storage.from(BUCKET).remove([path]);
    }

    setItems((current) => current.filter((entry) => entry.id !== item.id));
  }

  async function toggleStatus(item: GalleryItem) {
    const nextStatus = item.status === "Active" ? "Inactive" : "Active";

    const { error } = await supabase
      .from("gallery_items")
      .update({ status: nextStatus })
      .eq("id", item.id);

    if (error) {
      setError(error.message);
      return;
    }

    setItems((current) =>
      current.map((entry) =>
        entry.id === item.id ? { ...entry, status: nextStatus } : entry
      )
    );
  }

  async function moveItem(item: GalleryItem, direction: -1 | 1) {
    const sorted = [...items].sort(
      (a, b) => a.sort_order - b.sort_order
    );
    const index = sorted.findIndex((entry) => entry.id === item.id);
    const target = sorted[index + direction];

    if (!target) return;

    const firstOrder = item.sort_order;
    const secondOrder = target.sort_order;

    const { error: firstError } = await supabase
      .from("gallery_items")
      .update({ sort_order: secondOrder })
      .eq("id", item.id);

    if (firstError) {
      setError(firstError.message);
      return;
    }

    const { error: secondError } = await supabase
      .from("gallery_items")
      .update({ sort_order: firstOrder })
      .eq("id", target.id);

    if (secondError) {
      setError(secondError.message);
      await loadItems();
      return;
    }

    await loadItems();
  }

  const activeCount = items.filter((item) => item.status === "Active").length;

  return (
    <div className="min-h-screen bg-[#090B12] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-[10px] font-bold tracking-[3px] text-[#FF7438]">
              WEBSITE CONTENT
            </p>
            <h1 className="text-2xl font-black sm:text-3xl">Gallery</h1>
            <p className="mt-1 text-sm text-gray-400">
              Upload and manage your gym photos.
            </p>
          </div>

          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#287BFF] px-5 py-3 text-sm font-bold hover:bg-blue-600"
          >
            <ImagePlus size={17} />
            Add Image
          </button>
        </div>

        {error && !modalOpen && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-white/10 bg-[#10141F] p-5">
            <p className="text-xs text-gray-500">Total Images</p>
            <p className="mt-2 text-2xl font-black">{items.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#10141F] p-5">
            <p className="text-xs text-gray-500">Active Images</p>
            <p className="mt-2 text-2xl font-black">{activeCount}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center gap-3 py-16 text-sm text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            Loading gallery...
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#10141F] py-16 text-center">
            <ImagePlus className="mx-auto mb-3 text-gray-600" size={36} />
            <p className="font-bold">Your gallery is empty</p>
            <p className="mt-1 text-xs text-gray-500">
              Upload your first gym image.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-[#10141F]"
              >
                <div className="relative h-56 bg-[#090B12]">
                  <img
                    src={item.image_url}
                    alt={item.title || "Gym gallery image"}
                    className="h-full w-full object-cover"
                  />
                  <span
                    className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold ${
                      item.status === "Active"
                        ? "bg-green-500/90 text-white"
                        : "bg-gray-700/90 text-gray-200"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="p-4">
                  <h3 className="truncate text-sm font-bold">
                    {item.title || "Untitled Image"}
                  </h3>
                  <p className="mt-1 min-h-9 text-xs leading-5 text-gray-500">
                    {item.description || "No description"}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                    <div className="flex gap-1">
                      <button
                        onClick={() => moveItem(item, -1)}
                        disabled={index === 0}
                        title="Move up"
                        className="rounded-lg border border-white/10 p-2 text-gray-400 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowUp size={15} />
                      </button>
                      <button
                        onClick={() => moveItem(item, 1)}
                        disabled={index === items.length - 1}
                        title="Move down"
                        className="rounded-lg border border-white/10 p-2 text-gray-400 hover:bg-white/10 disabled:opacity-30"
                      >
                        <ArrowDown size={15} />
                      </button>
                    </div>

                    <div className="flex gap-1">
                      <button
                        onClick={() => toggleStatus(item)}
                        title={item.status === "Active" ? "Deactivate" : "Activate"}
                        className="rounded-lg border border-white/10 p-2 text-gray-400 hover:bg-white/10 hover:text-white"
                      >
                        {item.status === "Active" ? (
                          <EyeOff size={15} />
                        ) : (
                          <Eye size={15} />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(item)}
                        title="Edit image"
                        className="rounded-lg border border-white/10 p-2 text-gray-400 hover:border-[#287BFF] hover:bg-[#287BFF] hover:text-white"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={() => deleteItem(item)}
                        title="Delete image"
                        className="rounded-lg border border-white/10 p-2 text-gray-400 hover:border-red-500 hover:bg-red-500 hover:text-white"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm">
          <div className="my-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/10 bg-[#10141F]">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="font-black">
                  {editing ? "Edit Gallery Image" : "Add Gallery Image"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Choose an image from your device.
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 p-5">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="rounded-xl border border-dashed border-white/15 bg-[#090B12] p-4 text-center">
                {preview || (editing && !removeImage) ? (
                  <img
                    src={preview || editing?.image_url || ""}
                    alt="Preview"
                    className="mx-auto mb-4 h-44 w-full rounded-lg object-cover"
                  />
                ) : (
                  <div className="mb-4 flex h-36 items-center justify-center text-gray-600">
                    <ImagePlus size={40} />
                  </div>
                )}

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />

                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mx-auto flex items-center gap-2 rounded-lg bg-[#287BFF] px-4 py-2.5 text-xs font-bold hover:bg-blue-600"
                >
                  <Upload size={15} />
                  {editing ? "Choose / Replace Image" : "Choose Image"}
                </button>

                <p className="mt-2 text-[10px] text-gray-500">
                  JPG, PNG, WEBP or GIF · Maximum 5 MB
                </p>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-400">
                  Image Title
                </label>
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Modern Gym Equipment"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-400">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={3}
                  placeholder="Short image description..."
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-gray-400">
                  Visibility
                </label>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "Active" | "Inactive")
                  }
                  className={inputClass}
                >
                  <option value="Active">Active - Show on website</option>
                  <option value="Inactive">Inactive - Hide on website</option>
                </select>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#287BFF] px-6 py-3 text-sm font-bold hover:bg-blue-600 disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving ? "Saving..." : editing ? "Update Image" : "Save Image"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
