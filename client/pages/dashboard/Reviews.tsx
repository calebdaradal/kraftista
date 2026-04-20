import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api, type ProductReview } from "@/lib/api";
import { useEffect, useState } from "react";

export default function Reviews() {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("all");

  const token = localStorage.getItem("craft_auth_token");

  const loadReviews = () => {
    if (!token) return;
    setIsLoading(true);
    const status = filterStatus === "all" ? undefined : (filterStatus as "pending" | "approved" | "rejected");
    api.orders
      .listReviews(token, status)
      .then((fetchedReviews) => {
        setReviews(fetchedReviews);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load reviews."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadReviews();
  }, [token, filterStatus]);

  const moderateReview = async (reviewId: string, moderation_status: "approved" | "rejected") => {
    if (!token) return;
    try {
      const updated = await api.orders.moderateReview(reviewId, { moderation_status }, token);
      setReviews((prev) => prev.map((review) => (review.id === updated.id ? updated : review)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to moderate review.");
    }
  };

  const pendingCount = reviews.filter((r) => r.moderation_status === "pending").length;
  const approvedCount = reviews.filter((r) => r.moderation_status === "approved").length;
  const rejectedCount = reviews.filter((r) => r.moderation_status === "rejected").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Review Moderation</h1>
          <p className="text-sm text-muted-foreground">Manage and moderate product reviews from customers.</p>
        </div>

        {error ? <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              filterStatus === "all"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({reviews.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("pending")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              filterStatus === "pending"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("approved")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              filterStatus === "approved"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Approved ({approvedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus("rejected")}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              filterStatus === "rejected"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Rejected ({rejectedCount})
          </button>
        </div>

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
            {filterStatus === "all" ? "No reviews submitted yet." : `No ${filterStatus} reviews.`}
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">{review.product_name}</p>
                    <p className="text-xs text-muted-foreground">Order #{review.order_id.slice(0, 8)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-medium text-yellow-700">
                      ★ {review.rating}/5
                    </span>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${
                        review.moderation_status === "approved"
                          ? "bg-green-100 text-green-700"
                          : review.moderation_status === "rejected"
                            ? "bg-destructive/15 text-destructive"
                            : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {review.moderation_status}
                    </span>
                  </div>
                </div>

                {review.comment && <p className="text-sm text-foreground">{review.comment}</p>}

                {review.moderation_note && (
                  <div className="rounded-lg bg-muted p-2">
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">Moderation Note:</span> {review.moderation_note}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 pt-2 border-t border-border">
                  <button
                    type="button"
                    onClick={() => moderateReview(review.id, "approved")}
                    disabled={review.moderation_status === "approved"}
                    className="flex-1 rounded-lg bg-green-100 px-3 py-2 text-sm font-medium text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => moderateReview(review.id, "rejected")}
                    disabled={review.moderation_status === "rejected"}
                    className="flex-1 rounded-lg bg-destructive/15 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/25 disabled:opacity-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
