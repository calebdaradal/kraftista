import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api, type TaxonomyItem } from "@/lib/api";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";
import { ConfirmModal } from "@/components/ConfirmModal";
import { toast } from "sonner";

export default function ProductCollections() {
  const [collections, setCollections] = useState<TaxonomyItem[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; message: string } | null>(null);

  const token = localStorage.getItem("craft_auth_token") || "";

  const loadCollections = async () => {
    if (!token) return;
    try {
      setIsLoadingList(true);
      setCollections(await api.products.listCollections(token));
    } catch {
      setCollections([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadCollections();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !token) return;
    try {
      setIsCreating(true);
      await api.products.createCollection(name.trim(), token);
      setName("");
      await loadCollections();
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !token) return;
    try {
      setPendingActionId(id);
      await api.products.updateCollection(id, editName.trim(), token);
      setEditingId(null);
      setEditName("");
      await loadCollections();
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async (id: string, collectionName: string) => {
    if (!token) return;
    const impact = await api.products.getCollectionImpact(id, token);
    setDeleteConfirm({
      id,
      message: `${impact.product_count} product${impact.product_count !== 1 ? "s" : ""} ${impact.product_count === 1 ? "is" : "are"} using "${collectionName}". Delete this collection and remove it from those products?`,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    const { id } = deleteConfirm;
    setDeleteConfirm(null);
    try {
      setPendingActionId(id);
      await api.products.deleteCollection(id, token);
      toast.success("Collection deleted.");
      await loadCollections();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete collection.");
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Product Collections</h1>
          <p className="text-muted-foreground">Create, update, and remove collections used by products.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <label className="mb-2 block text-sm font-semibold">Add Collection</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Collection name"
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
                      Loading collections...
                    </span>
                  </td>
                </tr>
              )}
              {!isLoadingList && collections.map((collection) => (
                <tr key={collection.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {editingId === collection.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                      />
                    ) : (
                      <span>{collection.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{collection.product_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {editingId === collection.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdate(collection.id)}
                            disabled={pendingActionId === collection.id}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                          >
                            {pendingActionId === collection.id ? (
                              <span className="inline-flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Saving...
                              </span>
                            ) : (
                              "Save"
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditName("");
                            }}
                            className="rounded-lg border border-border px-3 py-1.5 text-sm"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(collection.id);
                              setEditName(collection.name);
                            }}
                            className="rounded-lg border border-border p-2 text-primary"
                            title="Edit collection"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(collection.id, collection.name)}
                            disabled={pendingActionId === collection.id}
                            className="rounded-lg border border-destructive/20 p-2 text-destructive"
                            title="Delete collection"
                          >
                            {pendingActionId === collection.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoadingList && collections.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No collections yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmModal
        open={!!deleteConfirm}
        title="Delete collection"
        message={deleteConfirm?.message ?? ""}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </DashboardLayout>
  );
}
