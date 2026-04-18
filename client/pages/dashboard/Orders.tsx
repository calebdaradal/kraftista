import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { api, type ProductReview, type SellerOrder } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

const looksLikeUrl = (value?: string | null) => !!value && (value.startsWith("http://") || value.startsWith("https://"));

export default function Orders() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("craft_auth_token");

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

  const loadAll = () => {
    if (!token) return;
    setIsLoading(true);
    Promise.all([api.orders.list(token), api.orders.listReviews(token)])
      .then(([fetchedOrders, fetchedReviews]) => {
        setOrders(fetchedOrders);
        setReviews(fetchedReviews);
        const firstOrder = fetchedOrders[0];
        setSelectedOrderId(firstOrder?.id ?? null);
        setTrackingInput(firstOrder?.tracking_reference ?? "");
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load orders."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, [token]);

  useEffect(() => {
    setTrackingInput(selectedOrder?.tracking_reference ?? "");
  }, [selectedOrderId, selectedOrder?.tracking_reference]);

  const handleSaveTracking = async () => {
    if (!token || !selectedOrder) return;
    try {
      const updated = await api.orders.updateTracking(selectedOrder.id, trackingInput.trim() || null, token);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update tracking.");
    }
  };

  const handleStatusUpdate = async (status: "processing" | "shipped" | "delivered") => {
    if (!token || !selectedOrder) return;
    try {
      const updated = await api.orders.updateStatus(selectedOrder.id, status, token);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update order status.");
    }
  };

  const moderateReview = async (reviewId: string, moderation_status: "approved" | "rejected") => {
    if (!token) return;
    try {
      const updated = await api.orders.moderateReview(reviewId, { moderation_status }, token);
      setReviews((prev) => prev.map((review) => (review.id === updated.id ? updated : review)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to moderate review.");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Orders</h1>
          <p className="text-sm text-muted-foreground">FIFO order queue with fulfillment and review moderation tools.</p>
        </div>

        {error ? <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
        {isLoading ? <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading orders...</div> : null}

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <aside className="space-y-3 xl:col-span-1">
            {orders.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => setSelectedOrderId(order.id)}
                className={`w-full rounded-xl border p-4 text-left ${
                  selectedOrderId === order.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-foreground">#{order.id.slice(0, 8)}</p>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{order.status}</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">${Number(order.total).toFixed(2)}</p>
              </button>
            ))}
          </aside>

          <section className="rounded-xl border border-border bg-card p-4 sm:p-6 xl:col-span-2">
            {!selectedOrder ? (
              <p className="text-sm text-muted-foreground">Select an order to view details.</p>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs uppercase text-muted-foreground">Shipping Contact</p>
                    <ul className="mt-1 space-y-1 text-sm text-foreground">
                      <li>{selectedOrder.shipping_address.full_name || "Name unavailable"}</li>
                      <li>{selectedOrder.shipping_address.phone || "Phone unavailable"}</li>
                      <li>{selectedOrder.shipping_address.street}</li>
                      <li>
                        {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{" "}
                        {selectedOrder.shipping_address.zip_code || selectedOrder.shipping_address.zipCode}
                      </li>
                      <li>{selectedOrder.shipping_address.country}</li>
                    </ul>
                  </div>
                  <div className="rounded-lg border border-border p-3">
                    <p className="text-xs uppercase text-muted-foreground">Customer Note</p>
                    <p className="mt-1 text-sm text-foreground">{selectedOrder.order_note || "No order note."}</p>
                  </div>
                </div>

                <div className="rounded-lg border border-border p-3">
                  <p className="text-xs uppercase text-muted-foreground">Tracking Reference</p>
                  <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                    <input
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      placeholder="Tracking code or full tracking URL"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleSaveTracking}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                    >
                      Save
                    </button>
                  </div>
                  {looksLikeUrl(selectedOrder.tracking_reference) ? (
                    <a
                      href={selectedOrder.tracking_reference ?? "#"}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-block text-sm text-primary underline"
                    >
                      Open tracking link
                    </a>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => handleStatusUpdate("processing")} className="rounded-lg border border-border px-3 py-2 text-sm">
                    Mark Processing
                  </button>
                  <button type="button" onClick={() => handleStatusUpdate("shipped")} className="rounded-lg border border-border px-3 py-2 text-sm">
                    Mark Shipped
                  </button>
                  <button type="button" onClick={() => handleStatusUpdate("delivered")} className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground">
                    Mark Delivered
                  </button>
                </div>

                <div className="space-y-2">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">${Number(item.line_total).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-foreground">Review Moderation</h2>
          <div className="mt-4 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews submitted yet.</p>
            ) : (
              reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{review.product_name}</p>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{review.moderation_status}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Rating: {review.rating}/5</p>
                  <p className="mt-2 text-sm text-foreground">{review.comment || "No comment."}</p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => moderateReview(review.id, "approved")}
                      className="rounded-lg border border-border px-3 py-1.5 text-sm"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => moderateReview(review.id, "rejected")}
                      className="rounded-lg border border-destructive px-3 py-1.5 text-sm text-destructive"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
