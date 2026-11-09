
"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Award,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Upload,
  Image as ImageIcon,
  Loader2,
  Mail,
  Phone,
  CalendarDays,
  DollarSign,
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";

type Trainer = {
  id: string;
  name: string;
  role: string;
  experience: number;
  image_url: string | null;
  email: string | null;
  phone: string | null;
  salary: number | null;
  joining_date: string | null;
  status: "Active" | "Inactive";
  created_at: string;
};

type TrainerForm = {
  name: string;
  role: string;
  experience: string;
  email: string;
  phone: string;
  salary: string;
  joining_date: string;
  status: "Active" | "Inactive";
};

const emptyForm: TrainerForm = {
  name: "",
  role: "",
  experience: "0",
  email: "",
  phone: "",
  salary: "",
  joining_date: "",
  status: "Active",
};

const BUCKET = "trainer-images";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function getStoragePath(url: string | null) {
  if (!url) return null;

  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = url.indexOf(marker);

  return index === -1 ? null : url.slice(index + marker.length);
}

export default function TrainersClient() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive">("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTrainer, setEditingTrainer] = useState<Trainer | null>(null);
  const [form, setForm] = useState<TrainerForm>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeCurrentImage, setRemoveCurrentImage] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTrainers();
  }, []);

  useEffect(() => {
    if (!selectedImage) {
      setImagePreview(null);
      return;
    }

    const objectUrl = URL.createObjectURL(selectedImage);
    setImagePreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedImage]);

  async function loadTrainers() {
    setLoading(true);

    const { data, error } = await supabase
      .from("trainers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      setError(error.message);
    } else {
      setTrainers((data ?? []) as Trainer[]);
    }

    setLoading(false);
  }

  function openAddModal() {
    setEditingTrainer(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setRemoveCurrentImage(false);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(trainer: Trainer) {
    setEditingTrainer(trainer);
    setForm({
      name: trainer.name,
      role: trainer.role,
      experience: String(trainer.experience ?? 0),
      email: trainer.email ?? "",
      phone: trainer.phone ?? "",
      salary: trainer.salary == null ? "" : String(trainer.salary),
      joining_date: trainer.joining_date ?? "",
      status: trainer.status,
    });
    setSelectedImage(null);
    setRemoveCurrentImage(false);
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingTrainer(null);
    setSelectedImage(null);
    setImagePreview(null);
    setRemoveCurrentImage(false);
    setError("");
  }

  function handleImageChange(file?: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Image size must be 5 MB or less.");
      return;
    }

    setError("");
    setSelectedImage(file);
    setRemoveCurrentImage(false);
  }

  async function uploadImage(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const allowedExtensions = ["jpg", "jpeg", "png", "webp", "gif"];

    if (!allowedExtensions.includes(extension)) {
      throw new Error("Use JPG, PNG, WEBP or GIF images.");
    }

    const path = `trainers/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

    return {
      url: data.publicUrl,
      path,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.role.trim()) {
      setError("Trainer name and role are required.");
      return;
    }

    setSaving(true);

    let newImagePath: string | null = null;

    try {
      let imageUrl = editingTrainer?.image_url ?? null;

      if (selectedImage) {
        const uploaded = await uploadImage(selectedImage);
        imageUrl = uploaded.url;
        newImagePath = uploaded.path;
      } else if (removeCurrentImage) {
        imageUrl = null;
      }

      const payload = {
        name: form.name.trim(),
        role: form.role.trim(),
        experience: Math.max(0, Number(form.experience) || 0),
        image_url: imageUrl,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        salary: form.salary ? Number(form.salary) : null,
        joining_date: form.joining_date || null,
        status: form.status,
      };

      const result = editingTrainer
        ? await supabase
            .from("trainers")
            .update(payload)
            .eq("id", editingTrainer.id)
        : await supabase.from("trainers").insert(payload);

      if (result.error) throw result.error;

      // Remove the previous image only after the database update succeeds.
      if (
        editingTrainer?.image_url &&
        (selectedImage || removeCurrentImage)
      ) {
        const oldPath = getStoragePath(editingTrainer.image_url);

        if (oldPath) {
          await supabase.storage.from(BUCKET).remove([oldPath]);
        }
      }

      setModalOpen(false);
      setEditingTrainer(null);
      setSelectedImage(null);
      setImagePreview(null);
      setRemoveCurrentImage(false);

      await loadTrainers();
    } catch (err) {
      if (newImagePath) {
        await supabase.storage.from(BUCKET).remove([newImagePath]);
      }

      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteTrainer(trainer: Trainer) {
    const confirmed = window.confirm(
      `Delete ${trainer.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");

    const { error: deleteError } = await supabase
      .from("trainers")
      .delete()
      .eq("id", trainer.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    const imagePath = getStoragePath(trainer.image_url);

    if (imagePath) {
      await supabase.storage.from(BUCKET).remove([imagePath]);
    }

    setTrainers((current) =>
      current.filter((item) => item.id !== trainer.id)
    );
  }

  const filteredTrainers = trainers.filter((trainer) => {
    const matchesSearch =
      trainer.name.toLowerCase().includes(search.toLowerCase()) ||
      trainer.role.toLowerCase().includes(search.toLowerCase()) ||
      (trainer.email ?? "").toLowerCase().includes(search.toLowerCase());

    const matchesFilter =
      filter === "All" || trainer.status === filter;

    return matchesSearch && matchesFilter;
  });

  const activeCount = trainers.filter(
    (trainer) => trainer.status === "Active"
  ).length;

  const inactiveCount = trainers.length - activeCount;

  return (
    <div className="min-h-screen bg-[#090B12] p-4 text-white sm:p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-[10px] font-bold tracking-[3px] text-[#FF7438]">
              TEAM MANAGEMENT
            </p>
            <h1 className="text-2xl font-black tracking-tight sm:text-3xl">
              Trainers
            </h1>
            <p className="mt-1 text-sm text-gray-400">
              Manage your gym trainers and their profiles.
            </p>
          </div>

          <button
            onClick={openAddModal}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#287BFF] px-5 py-3 text-sm font-bold transition hover:bg-blue-600"
          >
            <Plus size={17} />
            Add Trainer
          </button>
        </div>

        {error && !modalOpen && (
          <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <StatCard label="Total Trainers" value={trainers.length} icon={<UsersIcon />} />
          <StatCard label="Active Trainers" value={activeCount} icon={<Award size={19} />} />
          <StatCard label="Inactive Trainers" value={inactiveCount} icon={<UsersIcon />} />
        </div>

        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/10 bg-[#10141F] p-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search trainers..."
              className="w-full rounded-xl border border-white/10 bg-[#090B12] py-3 pl-10 pr-3 text-sm outline-none transition focus:border-[#287BFF]"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as "All" | "Active" | "Inactive")
            }
            className="rounded-xl border border-white/10 bg-[#090B12] px-4 py-3 text-sm text-white outline-none focus:border-[#287BFF]"
          >
            <option value="All">All Trainers</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#10141F]">
          {loading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-gray-400">
              <Loader2 className="animate-spin" size={20} />
              Loading trainers...
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="py-16 text-center">
              <Award className="mx-auto mb-3 text-gray-600" size={35} />
              <p className="font-bold text-gray-300">No trainers found</p>
              <p className="mt-1 text-xs text-gray-500">
                Add a trainer or change your search.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left">
                <thead className="border-b border-white/10 bg-white/[0.025]">
                  <tr className="text-[10px] uppercase tracking-wider text-gray-500">
                    <th className="px-5 py-4">Trainer</th>
                    <th className="px-5 py-4">Experience</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Salary</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/[0.06]">
                  {filteredTrainers.map((trainer) => (
                    <tr key={trainer.id} className="transition hover:bg-white/[0.025]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {trainer.image_url ? (
                            <img
                              src={trainer.image_url}
                              alt={trainer.name}
                              className="h-11 w-11 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#287BFF]/10 text-[#287BFF]">
                              <Award size={19} />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-bold">{trainer.name}</p>
                            <p className="mt-1 text-xs text-[#FF7438]">
                              {trainer.role}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-300">
                        {trainer.experience} years
                      </td>

                      <td className="px-5 py-4">
                        <p className="text-xs text-gray-300">
                          {trainer.email || "—"}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          {trainer.phone || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-300">
                        {trainer.salary == null
                          ? "—"
                          : Number(trainer.salary).toLocaleString()}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                            trainer.status === "Active"
                              ? "bg-green-500/10 text-green-400"
                              : "bg-gray-500/10 text-gray-400"
                          }`}
                        >
                          {trainer.status}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditModal(trainer)}
                            title="Edit trainer"
                            className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-[#287BFF] hover:bg-[#287BFF] hover:text-white"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => deleteTrainer(trainer)}
                            title="Delete trainer"
                            className="rounded-lg border border-white/10 p-2 text-gray-400 transition hover:border-red-500 hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm">
          <div className="my-auto w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#10141F] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <div>
                <h2 className="text-lg font-black">
                  {editingTrainer ? "Edit Trainer" : "Add Trainer"}
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Enter trainer details and profile image.
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-5">
              {error && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}

              <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-white/15 bg-[#090B12] p-5">
                <div className="h-28 w-28 overflow-hidden rounded-2xl border border-white/10 bg-[#151B29]">
                  {imagePreview || (!removeCurrentImage && editingTrainer?.image_url) ? (
                    <img
                      src={imagePreview || editingTrainer?.image_url || ""}
                      alt="Trainer preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gray-600">
                      <ImageIcon size={35} />
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(event) =>
                    handleImageChange(event.target.files?.[0])
                  }
                />

                <div className="flex flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-lg bg-[#287BFF] px-4 py-2.5 text-xs font-bold transition hover:bg-blue-600"
                  >
                    <Upload size={15} />
                    {editingTrainer?.image_url || selectedImage
                      ? "Choose / Replace Image"
                      : "Upload Image"}
                  </button>

                  {(selectedImage || editingTrainer?.image_url) && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedImage(null);
                        setRemoveCurrentImage(true);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                      className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-semibold text-gray-400 hover:border-red-500 hover:text-red-400"
                    >
                      Remove Image
                    </button>
                  )}
                </div>

                <p className="text-center text-[10px] text-gray-500">
                  JPG, PNG, WEBP or GIF · Maximum 5 MB
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Full Name *">
                  <input
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    placeholder="Trainer name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Trainer Role *">
                  <input
                    required
                    value={form.role}
                    onChange={(event) =>
                      setForm({ ...form, role: event.target.value })
                    }
                    placeholder="e.g. Strength Coach"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Experience (Years)">
                  <input
                    type="number"
                    min="0"
                    value={form.experience}
                    onChange={(event) =>
                      setForm({ ...form, experience: event.target.value })
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Email">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(event) =>
                        setForm({ ...form, email: event.target.value })
                      }
                      placeholder="trainer@email.com"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Phone">
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                    <input
                      value={form.phone}
                      onChange={(event) =>
                        setForm({ ...form, phone: event.target.value })
                      }
                      placeholder="Phone number"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Monthly Salary">
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.salary}
                      onChange={(event) =>
                        setForm({ ...form, salary: event.target.value })
                      }
                      placeholder="Salary"
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Joining Date">
                  <div className="relative">
                    <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
                    <input
                      type="date"
                      value={form.joining_date}
                      onChange={(event) =>
                        setForm({ ...form, joining_date: event.target.value })
                      }
                      className={`${inputClass} pl-9`}
                    />
                  </div>
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as "Active" | "Inactive",
                      })
                    }
                    className={inputClass}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </FormField>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-400 transition hover:bg-white/5 hover:text-white"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#287BFF] px-6 py-3 text-sm font-bold transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingTrainer
                      ? "Update Trainer"
                      : "Save Trainer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const inputClass =
  "w-full rounded-xl border border-white/10 bg-[#090B12] px-3 py-3 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-[#287BFF]";

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-semibold text-gray-400">{label}</span>
      {children}
    </label>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#10141F] p-5">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="mt-2 text-2xl font-black">{value}</p>
      </div>
      <div className="rounded-xl bg-[#287BFF]/10 p-3 text-[#287BFF]">
        {icon}
      </div>
    </div>
  );
}

function UsersIcon() {
  return <Award size={19} />;
}
