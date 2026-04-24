import { Layout } from "@/components/layout/Layout";
import { OrdersSlider } from "@/components/OrdersSlider";
import { api, type CustomerOrder } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";
import { ShoppingBag, RotateCcw, Loader2 } from "lucide-react";
import { toast } from "sonner";

const formatCurrency = (value: number) => `$${Number(value || 0).toFixed(2)}`;

const looksLikeUrl = (value?: string | null) => {
  if (!value) return false;
  return value.startsWith("http://") || value.startsWith("https://");
};

export default function AccountOrders() {
  const { user } = useUser();
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [refundModal, setRefundModal] = useState<{ open: boolean; orderId: string | null }>({ open: false, orderId: null });
  const [refundNote, setRefundNote] = useState("");
  const [isRequestingRefund, setIsRequestingRefund] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("craft_customer_token");
    if (!user || !token) return;
    setIsLoading(true);
    api.customer
      .listOrders(token)
      .then((result) => {
        setOrders(result);
        setSelectedOrderId(result[0]?.id ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load your orders."))
      .finally(() => setIsLoading(false));
  }, [user]);

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

  const handleRequestRefund = async () => {
    const token = localStorage.getItem("craft_customer_token");
    if (!refundModal.orderId || !token) return;
    setIsRequestingRefund(true);
    try {
      const updated = await api.customer.requestRefund(refundModal.orderId, refundNote.trim() || null, token);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? (updated as CustomerOrder) : o)));
      toast.success("Refund request submitted. We'll review it shortly.");
      setRefundModal({ open: false, orderId: null });
      setRefundNote("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to request refund.");
    } finally {
      setIsRequestingRefund(false);
    }
  };

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">My Orders</h1>
            <p className="text-sm text-muted-foreground md:text-base">Track your outgoing orders and shipment updates.</p>
          </div>

          {error ? <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}

          {isLoading ? (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
              You have no orders yet.
            </div>
          ) : (
            <div className="space-y-6">
              {/* Orders Slider */}
              <OrdersSlider orders={orders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} />

              {/* Order Details Panel */}
              {selectedOrder && (
                <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-semibold text-foreground">Order Details</h2>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase text-muted-foreground">
                          {selectedOrder.status}
                        </span>
                        {selectedOrder.refund_requested ? (
                          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-700">
                            Refund Requested
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setRefundNote("");
                              setRefundModal({ open: true, orderId: selectedOrder.id });
                            }}
                            className="flex items-center gap-1.5 rounded-full border border-destructive/30 px-3 py-1 text-xs font-medium text-destructive hover:bg-destructive/5 transition-colors"
                          >
                            <RotateCcw className="w-3 h-3" />
                            Request Refund
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase text-muted-foreground">Tracking</p>
                        {looksLikeUrl(selectedOrder.tracking_reference) ? (
                          <a
                            href={selectedOrder.tracking_reference ?? "#"}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-1 inline-block break-all text-sm font-medium text-primary underline"
                          >
                            {selectedOrder.tracking_reference}
                          </a>
                        ) : (
                          <p className="mt-1 text-sm font-medium text-foreground">{selectedOrder.tracking_reference || "Not assigned yet"}</p>
                        )}
                      </div>
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs uppercase text-muted-foreground">Contact & Address</p>
                        <ul className="mt-1 space-y-1 text-sm text-foreground">
                          <li>{selectedOrder.shipping_address.full_name || user.name}</li>
                          <li>{selectedOrder.shipping_address.phone || user.phone || "No phone"}</li>
                          <li>{selectedOrder.shipping_address.street}</li>
                          <li>
                            {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{" "}
                            {selectedOrder.shipping_address.zip_code || selectedOrder.shipping_address.zipCode}
                          </li>
                          <li>{selectedOrder.shipping_address.country}</li>
                        </ul>
                      </div>
                    </div>

                    <div className="rounded-lg border border-border p-3">
                      <p className="text-xs uppercase text-muted-foreground">Order Note</p>
                      <p className="mt-1 text-sm text-foreground">{selectedOrder.order_note || "No note provided."}</p>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-sm font-semibold text-foreground">Order Items</h3>
                      <div className="space-y-2">
                        {selectedOrder.items.map((item) => (
                          <div key={item.id} className="rounded-lg border border-border p-3">
                            <div className="flex items-start gap-3">
                              {/* Thumbnail */}
                              <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
                                {looksLikeUrl(item.image_url) ? (
                                  <img
                                    src={item.image_url!}
                                    alt={item.product_name}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ShoppingBag className="w-5 h-5 text-muted-foreground/50" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                                <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                {item.selected_variations && Object.keys(item.selected_variations).length > 0 && (
                                  <div className="mt-2 space-y-1 pt-2 border-t border-border">
                                    {Object.entries(item.selected_variations).map(([key, value]) => (
                                      <p key={key} className="text-xs text-muted-foreground">
                                        <span className="font-medium">{key}:</span> {value}
                                      </p>
                                    ))}
                                  </div>
                                )}
                              </div>
                              <p className="text-sm font-semibold text-foreground flex-shrink-0">{formatCurrency(item.line_total)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Refund Request Modal */}
      {refundModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl space-y-4">
            <div>
              <h3 className="font-semibold text-foreground text-lg">Request a Refund</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Let us know why you'd like a refund. Our team will review your request.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Reason <span className="text-muted-foreground/60 text-xs">(optional)</span>
              </label>
              <textarea
                value={refundNote}
                onChange={(e) => setRefundNote(e.target.value)}
                placeholder="Describe the issue with your order..."
                rows={4}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setRefundModal({ open: false, orderId: null })}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestRefund}
                disabled={isRequestingRefund}
                className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground disabled:opacity-60"
              >
                {isRequestingRefund ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Submit Request
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
