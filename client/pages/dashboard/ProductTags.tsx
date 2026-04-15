import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api, type TaxonomyItem } from "@/lib/api";
import { useEffect, useState } from "react";
import { Loader2, Pencil, Plus, Trash2 } from "lucide-react";

export default function ProductTags() {
  const [tags, setTags] = useState<TaxonomyItem[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [pendingActionId, setPendingActionId] = useState<string | null>(null);

  const token = localStorage.getItem("craft_auth_token") || "";

  const loadTags = async () => {
    if (!token) return;
    try {
      setIsLoadingList(true);
      setTags(await api.products.listTags(token));
    } catch {
      setTags([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    loadTags();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !token) return;
    try {
      setIsCreating(true);
      await api.products.createTag(name.trim(), token);
      setName("");
      await loadTags();
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !token) return;
    try {
      setPendingActionId(id);
      await api.products.updateTag(id, editName.trim(), token);
      setEditingId(null);
      setEditName("");
      await loadTags();
    } finally {
      setPendingActionId(null);
    }
  };

  const handleDelete = async (id: string, tagName: string) => {
    if (!token) return;
    const impact = await api.products.getTagImpact(id, token);
    const confirmed = window.confirm(
      `${impact.product_count} products are currently using "${tagName}". Delete this tag and remove it from those products?`
    );
    if (!confirmed) return;
    try {
      setPendingActionId(id);
      await api.products.deleteTag(id, token);
      await loadTags();
    } finally {
      setPendingActionId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Product Tags</h1>
          <p className="text-muted-foreground">Create, update, and remove tags used by products.</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <label className="mb-2 block text-sm font-semibold">Add Tag</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name"
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
                      Loading tags...
                    </span>
                  </td>
                </tr>
              )}
              {!isLoadingList && tags.map((tag) => (
                <tr key={tag.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {editingId === tag.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                      />
                    ) : (
                      <span>{tag.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{tag.product_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {editingId === tag.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdate(tag.id)}
                            disabled={pendingActionId === tag.id}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                          >
                            {pendingActionId === tag.id ? (
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
                              setEditingId(tag.id);
                              setEditName(tag.name);
                            }}
                            className="rounded-lg border border-border p-2 text-primary"
                            title="Edit tag"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(tag.id, tag.name)}
                            disabled={pendingActionId === tag.id}
                            className="rounded-lg border border-destructive/20 p-2 text-destructive"
                            title="Delete tag"
                          >
                            {pendingActionId === tag.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoadingList && tags.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                    No tags yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
