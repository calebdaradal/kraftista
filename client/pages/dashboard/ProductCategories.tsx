import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api, type TaxonomyItem } from "@/lib/api";
import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";

export default function ProductCategories() {
  const [categories, setCategories] = useState<TaxonomyItem[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const token = localStorage.getItem("craft_auth_token") || "";

  const loadCategories = async () => {
    if (!token) return;
    try {
      setCategories(await api.products.listCategories(token));
    } catch {
      setCategories([]);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !token) return;
    await api.products.createCategory(name.trim(), token);
    setName("");
    await loadCategories();
  };

  const handleUpdate = async (id: string) => {
    if (!editName.trim() || !token) return;
    await api.products.updateCategory(id, editName.trim(), token);
    setEditingId(null);
    setEditName("");
    await loadCategories();
  };

  const handleDelete = async (id: string, categoryName: string) => {
    if (!token) return;
    const impact = await api.products.getCategoryImpact(id, token);
    const confirmed = window.confirm(
      `${impact.product_count} products are currently using "${categoryName}". Delete this category and remove it from those products?`
    );
    if (!confirmed) return;
    await api.products.deleteCategory(id, token);
    await loadCategories();
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
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" />
              Add
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
              {categories.map((category) => (
                <tr key={category.id} className="border-b border-border last:border-0">
                  <td className="px-4 py-3">
                    {editingId === category.id ? (
                      <input
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                      />
                    ) : (
                      <span>{category.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{category.product_count}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      {editingId === category.id ? (
                        <>
                          <button
                            type="button"
                            onClick={() => handleUpdate(category.id)}
                            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground"
                          >
                            Save
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
                              setEditingId(category.id);
                              setEditName(category.name);
                            }}
                            className="rounded-lg border border-border p-2 text-primary"
                            title="Edit category"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(category.id, category.name)}
                            className="rounded-lg border border-destructive/20 p-2 text-destructive"
                            title="Delete category"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
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
    </DashboardLayout>
  );
}
