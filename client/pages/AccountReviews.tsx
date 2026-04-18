import { Layout } from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { api, type PendingReviewItem, type ProductReview } from "@/lib/api";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

export default function AccountReviews() {
  const { user } = useUser();
  const [pendingItems, setPendingItems] = useState<PendingReviewItem[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("craft_customer_token");

  const loadData = () => {
    if (!token) return;
    setIsLoading(true);
    Promise.all([api.customer.listPendingReviews(token), api.customer.listReviews(token)])
      .then(([pending, submitted]) => {
        setPendingItems(pending);
        setReviews(submitted);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load reviews."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    if (!user || !token) return;
    loadData();
  }, [user, token]);

  if (!user) return <Navigate to="/" replace />;

  const setDraftField = (orderItemId: string, patch: Partial<{ rating: number; comment: string }>) => {
    setDrafts((prev) => ({
      ...prev,
      [orderItemId]: {
        rating: prev[orderItemId]?.rating ?? 5,
        comment: prev[orderItemId]?.comment ?? "",
        ...patch,
      },
    }));
  };

  const submitReview = async (orderItemId: string) => {
    if (!token) return;
    const draft = drafts[orderItemId] ?? { rating: 5, comment: "" };
    try {
      await api.customer.submitReview({ order_item_id: orderItemId, rating: draft.rating, comment: draft.comment }, token);
      setDrafts((prev) => ({ ...prev, [orderItemId]: { rating: 5, comment: "" } }));
      loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit review.");
    }
  };

  return (
    <Layout>
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 space-y-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Reviews</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Submit reviews for delivered products and track moderation results.
            </p>
          </div>

          {error ? <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
          {isLoading ? <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading reviews...</div> : null}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Reviews ({pendingItems.length})</h2>
            {pendingItems.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                No pending products to review.
              </div>
            ) : (
              pendingItems.map((item) => (
                <div key={item.order_item_id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{item.product_name}</p>
                      <p className="text-xs text-muted-foreground">Order #{item.order_id.slice(0, 8)}</p>
                    </div>
                    <select
                      value={drafts[item.order_item_id]?.rating ?? 5}
                      onChange={(e) => setDraftField(item.order_item_id, { rating: Number(e.target.value) })}
                      className="rounded-lg border border-border bg-background px-2 py-1 text-sm"
                    >
                      {[5, 4, 3, 2, 1].map((value) => (
                        <option key={value} value={value}>
                          {value} Star{value > 1 ? "s" : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                  <textarea
                    value={drafts[item.order_item_id]?.comment ?? ""}
                    onChange={(e) => setDraftField(item.order_item_id, { comment: e.target.value })}
                    placeholder="Share your feedback..."
                    className="min-h-24 w-full rounded-lg border border-border bg-background p-3 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => submitReview(item.order_item_id)}
                    className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  >
                    Submit Review
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Submitted Reviews</h2>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">No submitted reviews yet.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground">{review.product_name}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        review.moderation_status === "approved"
                          ? "bg-green-100 text-green-700"
                          : review.moderation_status === "rejected"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {review.moderation_status === "rejected" ? "Rejected review" : review.moderation_status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Rating: {review.rating}/5</p>
                  <p className="mt-2 text-sm text-foreground">{review.comment || "No comment added."}</p>
                  {review.moderation_note ? <p className="mt-2 text-xs text-muted-foreground">Note: {review.moderation_note}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
