import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrdersSlider } from "@/components/OrdersSlider";
import { api, type SellerOrder } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

const looksLikeUrl = (value?: string | null) =>
  !!value && (value.startsWith("http://") || value.startsWith("https://"));

const STATUS_STEPS: { key: "processing" | "shipped" | "delivered"; label: string }[] = [
  { key: "processing", label: "Processing" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
];

export default function Orders() {
  const [orders, setOrders] = useState<SellerOrder[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingTracking, setIsSavingTracking] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null);
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
    setIsSavingTracking(true);
    try {
      const updated = await api.orders.updateTracking(selectedOrder.id, trackingInput.trim() || null, token);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      toast.success("Tracking reference saved.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update tracking.");
    } finally {
      setIsSavingTracking(false);
    }
  };

  const handleStatusUpdate = async (status: "processing" | "shipped" | "delivered") => {
    if (!token || !selectedOrder) return;
    setIsUpdatingStatus(status);
    try {
      const updated = await api.orders.updateStatus(selectedOrder.id, status, token);
      setOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      toast.success(`Order marked as ${status}.`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update order status.");
    } finally {
      setIsUpdatingStatus(null);
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
                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                      />
                      <button
                        type="button"
                        onClick={handleSaveTracking}
                        disabled={isSavingTracking}
                        className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSavingTracking ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                          </>
                        ) : (
                          "Save"
                        )}
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

                  <div>
                    <p className="mb-2 text-xs uppercase text-muted-foreground">Order Status</p>
                    <div className="flex flex-wrap gap-2">
                      {STATUS_STEPS.map(({ key, label }) => {
                        const isActive = selectedOrder.status === key;
                        const isLoadingThis = isUpdatingStatus === key;
                        return (
                          <button
                            key={key}
                            type="button"
                            onClick={() => handleStatusUpdate(key)}
                            disabled={!!isUpdatingStatus}
                            className={[
                              "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-60",
                              isActive
                                ? "bg-primary text-primary-foreground ring-2 ring-primary/40 ring-offset-1"
                                : "border border-border bg-card text-foreground hover:border-primary/40 hover:bg-primary/5",
                            ].join(" ")}
                          >
                            {isLoadingThis && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Mark {label}
                          </button>
                        );
                      })}
                    </div>
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
                            <p className="text-sm font-semibold text-foreground flex-shrink-0">${Number(item.line_total).toFixed(2)}</p>
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
