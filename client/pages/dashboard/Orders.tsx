import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrdersSlider } from "@/components/OrdersSlider";
import { api, type SellerOrder } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

const looksLikeUrl = (value?: string | null) => !!value && (value.startsWith("http://") || value.startsWith("https://"));

export default function Orders() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("craft_auth_token");

  const selectedOrder = useMemo(() => orders.find((order) => order.id === selectedOrderId) ?? null, [orders, selectedOrderId]);

  const loadAll = () => {
    if (!token) return;
    setIsLoading(true);
    api.orders
      .list(token)
      .then((fetchedOrders) => {
        setOrders(fetchedOrders);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Orders</h1>
          <p className="text-sm text-muted-foreground">Manage orders and fulfillment.</p>
        </div>

        {error ? <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">{error}</div> : null}
        {isLoading ? <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">Loading orders...</div> : null}

        {!isLoading && (
          <div className="space-y-6">
            {/* Orders Slider */}
            <OrdersSlider orders={orders} selectedOrderId={selectedOrderId} onSelectOrder={setSelectedOrderId} />

            {/* Order Details Panel */}
            {selectedOrder && (
              <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
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

                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-foreground">Order Items</h3>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="rounded-lg border border-border p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
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
                            <p className="text-sm font-semibold text-foreground">${Number(item.line_total).toFixed(2)}</p>
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
