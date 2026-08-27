import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api, type TaxonomyItem } from "@/lib/api";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { ImageUpload } from "@/components/ImageUpload";
import { toast } from "sonner";

export default function ProductCategories() {
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<TaxonomyItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editImage, setEditImage] = useState<string>("");
  const [editDescription, setEditDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; message: string } | null>(null);

  const token = localStorage.getItem("craft_auth_token") || "";

  const loadCategories = async () => {
    if (!token) return;
    try {
      setIsLoadingList(true);
      setCategories(await api.products.listCategories(token));
    } catch {
      setCategories([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !token) return;
    try {
      setIsCreating(true);
      await api.products.createCategory(name.trim(), token);
      setName("");
      await loadCategories();
    } finally {
      setIsCreating(false);
    }
  };

  const openEdit = (category: TaxonomyItem) => {
    setEditing(category);
    setEditName(category.name);
    setEditImage(category.image_url ?? "");
    setEditDescription(category.description ?? "");
  };

  const closeEdit = () => {
    setEditing(null);
    setEditName("");
    setEditImage("");
    setEditDescription("");
  };

  const handleUpdate = async () => {
    if (!editing || !editName.trim() || !token) return;
    try {
      setIsSaving(true);
      await api.products.updateCategory(
        editing.id,
        {
          name: editName.trim(),
          image_url: editImage.trim() ? editImage.trim() : null,
          description: editDescription.trim() ? editDescription.trim() : null,
        },
        token,
      );
      toast.success("Category updated.");
      closeEdit();
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update category.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (!token) return;
    const impact = await api.products.getCategoryImpact(id, token);
    setDeleteConfirm({
      id,
      message: `${impact.product_count} product${impact.product_count !== 1 ? "s" : ""} ${impact.product_count === 1 ? "is" : "are"} using "${categoryName}". Delete this category and remove it from those products?`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      setPendingActionId(id);
      await api.products.deleteCategory(id, token);
      toast.success("Category deleted.");
      await loadCategories();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete category.");
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Product Categories</h1>
          <p className="text-muted-foreground">Create, update, and remove categories used by products.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <label className="mb-2 block text-sm font-semibold">Add Category</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className="w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <button
              type="button"
              onClick={handleCreate}
              disabled={isCreating}
              className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground"
            >
              {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              {isCreating ? "Adding..." : "Add"}
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-semibold">Name</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Products Using</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoadingList && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Loading categories...
                    </span>
                  </td>
                </tr>
              )}
              {!isLoadingList && categories.map((category) => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {category.image_url ? (
                        <img
                          src={category.image_url}
                          alt={category.name}
                          className="h-10 w-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-muted" />
                      )}
                      <div>
                        <span className="font-medium">{category.name}</span>
                        {category.description ? (
                          <p className="text-xs text-muted-foreground line-clamp-1 max-w-xs">{category.description}</p>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{category.product_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(category)}
                        className="rounded-lg border border-border p-2 text-primary"
                        title="Edit category"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category.id, category.name)}
                        disabled={pendingActionId === category.id}
                        className="rounded-lg border border-destructive/20 p-2 text-destructive"
                        title="Delete category"
                      >
                        {pendingActionId === category.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoadingList && categories.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No categories yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold text-foreground">Edit Category</h2>
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold">Name</label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Image</label>
                <ImageUpload
                  label="Upload Category Image"
                  currentImage={editImage || undefined}
                  onUpload={(url) => setEditImage(url)}
                  onRemove={() => setEditImage("")}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-semibold">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  placeholder="Short description shown in the store navigation"
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEdit}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdate}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSaving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete category"
        message={deleteConfirm?.message ?? ""}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </DashboardLayout>
  );
}
