import { Layout } from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { useSettings } from "@/context/SettingsContext";
import { api, type PendingReviewItem, type ProductReview } from "@/lib/api";
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { Clock, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

function getReviewEligibility(
  deliveredAt: string | null | undefined,
  minDays: number,
  maxDays: number
): { canReview: boolean; expired: boolean; daysUntilEligible: number; daysUntilExpiry: number } {
  if (!deliveredAt) return { canReview: true, expired: false, daysUntilEligible: 0, daysUntilExpiry: maxDays };
  const delivered = new Date(deliveredAt).getTime();
  const now = Date.now();
  const daysSince = Math.floor((now - delivered) / 86_400_000);
  const daysUntilEligible = Math.max(0, minDays - daysSince);
  const daysUntilExpiry = Math.max(0, maxDays - daysSince);
  return {
    canReview: daysSince >= minDays && daysSince <= maxDays,
    expired: daysSince > maxDays,
    daysUntilEligible,
    daysUntilExpiry,
  };
}

export default function AccountReviews() {
  const { user } = useUser();
  const { settings } = useSettings();
  const reviewMinDays = settings.reviewMinDays ?? 3;
  const reviewMaxDays = settings.reviewMaxDays ?? 7;

  const [pendingItems, setPendingItems] = useState<PendingReviewItem[]>([]);
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [drafts, setDrafts] = useState<Record<string, { rating: number; comment: string }>>({});
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({});
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
    setSubmitting((prev) => ({ ...prev, [orderItemId]: true }));
    try {
      await api.customer.submitReview({ order_item_id: orderItemId, rating: draft.rating, comment: draft.comment || null }, token);
      setDrafts((prev) => ({ ...prev, [orderItemId]: { rating: 5, comment: "" } }));
      toast.success("Review submitted! It will be visible after moderation.");
      loadData();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit review.");
    } finally {
      setSubmitting((prev) => ({ ...prev, [orderItemId]: false }));
    }
  };

  const visiblePendingItems = pendingItems.filter(
    (item) => !getReviewEligibility(item.delivered_at, reviewMinDays, reviewMaxDays).expired
  );

  return (
    <Layout>
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 sm:px-6 space-y-8">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">Reviews</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Submit reviews for delivered products and track moderation results.
            </p>
          </div>

          {error ? <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
          {isLoading ? <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading reviews...</div> : null}

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Pending Reviews ({visiblePendingItems.length})</h2>
            {visiblePendingItems.length === 0 && !isLoading ? (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                No pending products to review.
              </div>
            ) : (
              visiblePendingItems.map((item) => {
                const elig = getReviewEligibility(item.delivered_at, reviewMinDays, reviewMaxDays);
                return (
                  <div key={item.order_item_id} className="rounded-xl border border-border bg-card p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-foreground">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Order #{item.order_id.slice(0, 8)}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!elig.canReview && elig.daysUntilEligible > 0 && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            <Clock className="w-3 h-3" />
                            Available in {elig.daysUntilEligible} day{elig.daysUntilEligible > 1 ? "s" : ""}
                          </span>
                        )}
                        {elig.canReview && elig.daysUntilExpiry <= 2 && (
                          <span className="flex items-center gap-1 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-semibold text-orange-700">
                            <Clock className="w-3 h-3" />
                            Expires in {elig.daysUntilExpiry} day{elig.daysUntilExpiry !== 1 ? "s" : ""}
                          </span>
                        )}
                        <select
                          value={drafts[item.order_item_id]?.rating ?? 5}
                          onChange={(e) => setDraftField(item.order_item_id, { rating: Number(e.target.value) })}
                          disabled={!elig.canReview}
                          className="rounded-lg border border-border bg-background px-2 py-1 text-sm disabled:opacity-50"
                        >
                          {[5, 4, 3, 2, 1].map((value) => (
                            <option key={value} value={value}>
                              {value} Star{value > 1 ? "s" : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {!elig.canReview && elig.daysUntilEligible > 0 ? (
                      <p className="text-sm text-muted-foreground rounded-lg bg-muted/50 p-3">
                        You can submit your review starting{" "}
                        <span className="font-semibold text-foreground">{reviewMinDays} days</span> after delivery.
                        Come back in{" "}
                        <span className="font-semibold text-foreground">
                          {elig.daysUntilEligible} day{elig.daysUntilEligible > 1 ? "s" : ""}
                        </span>
                        .
                      </p>
                    ) : (
                      <>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">
                            Review note <span className="text-muted-foreground/60">(optional)</span>
                          </label>
                          <textarea
                            value={drafts[item.order_item_id]?.comment ?? ""}
                            onChange={(e) => setDraftField(item.order_item_id, { comment: e.target.value })}
                            placeholder="Share your feedback... (optional)"
                            className="min-h-20 w-full rounded-lg border border-border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => submitReview(item.order_item_id)}
                          disabled={submitting[item.order_item_id]}
                          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60"
                        >
                          {submitting[item.order_item_id] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Submitting…
                            </>
                          ) : (
                            <>
                              <Star className="w-4 h-4" />
                              Submit Review
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Submitted Reviews</h2>
            {reviews.length === 0 ? (
              <div className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">No submitted reviews yet.</div>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
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
                  <div className="mt-1 flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= review.rating ? "fill-primary text-primary" : "text-muted-foreground/30"}`}
                      />
                    ))}
                  </div>
                  {review.comment ? (
                    <p className="mt-2 text-sm text-foreground">{review.comment}</p>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground italic">No comment added.</p>
                  )}
                  {review.moderation_note ? <p className="mt-2 text-xs text-muted-foreground">Moderator note: {review.moderation_note}</p> : null}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
