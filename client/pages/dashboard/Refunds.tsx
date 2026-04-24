import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrdersSlider } from "@/components/OrdersSlider";
import { api, type SellerOrder } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { ShoppingBag, RotateCcw, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";

const looksLikeUrl = (value?: string | null) =>
  !!value && (value.startsWith("http://") || value.startsWith("https://"));

export default function Refunds() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("craft_auth_token");

  const selectedOrder = useMemo(
    () => orders.find((order) => order.id === selectedOrderId) ?? null,
    [orders, selectedOrderId]
  );

  const loadAll = () => {
    if (!token) return;
    setIsLoading(true);
    api.orders
      .listRefunds(token)
      .then((fetchedOrders) => {
        setOrders(fetchedOrders);
        setSelectedOrderId(fetchedOrders[0]?.id ?? null);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load refund requests."))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    loadAll();
  }, [token]);

  const handleResolve = async () => {
    if (!token || !selectedOrder) return;
    setIsResolving(true);
    try {
      const updated = await api.orders.resolveRefund(selectedOrder.id, token);
      setOrders((prev) => prev.filter((o) => o.id !== updated.id));
      setSelectedOrderId(null);
      toast.success("Refund request marked as resolved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resolve refund.");
    } finally {
      setIsResolving(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Refund Requests</h1>
          <p className="text-sm text-muted-foreground">Review and manage customer refund requests.</p>
        </div>

        {error ? <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}

        {isLoading ? (
          <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading refund requests...</div>
        ) : orders.length === 0 ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center space-y-2">
            <RotateCcw className="w-8 h-8 text-muted-foreground/40 mx-auto" />
            <p className="text-sm font-medium text-foreground">No refund requests</p>
            <p className="text-xs text-muted-foreground">Refund requests from customers will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <OrdersSlider orders={orders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} />

            {selectedOrder && (
              <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
                <div className="space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold text-foreground">Refund Request Details</h2>
                      <span className="mt-1 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                        Refund Requested
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleResolve}
                      disabled={isResolving}
                      className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60 transition-opacity hover:opacity-90"
                    >
                      {isResolving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Mark Resolved
                    </button>
                  </div>

                  {/* Refund Note */}
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <p className="text-xs uppercase font-semibold text-amber-700 mb-1">Customer Reason</p>
                    <p className="text-sm text-amber-900">
                      {selectedOrder.refund_note || "No reason provided."}
                    </p>
                  </div>

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
                      <p className="text-xs uppercase text-muted-foreground">Order Info</p>
                      <div className="mt-1 space-y-1 text-sm text-foreground">
                        <p>
                          <span className="text-muted-foreground">Status:</span>{" "}
                          <span className="font-medium capitalize">{selectedOrder.status}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Total:</span>{" "}
                          <span className="font-semibold">${Number(selectedOrder.total).toFixed(2)}</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">Order note:</span>{" "}
                          {selectedOrder.order_note || "None"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
                              {looksLikeUrl(item.image_url) ? (
                                <img src={item.image_url!} alt={item.product_name} className="w-full h-full object-cover" />
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
                            <p className="text-sm font-semibold text-foreground flex-shrink-0">
                              ${Number(item.line_total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
