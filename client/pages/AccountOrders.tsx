import { Layout } from "@/components/layout/Layout";
import { api, type CustomerOrder } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "@/context/UserContext";

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

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <Layout>
      <section className="py-10 md:py-14">
        <div className="container mx-auto px-4">
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
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <aside className="space-y-3 lg:col-span-1">
                {orders.map((order) => (
                  <button
                    type="button"
                    key={order.id}
                    onClick={() => setSelectedOrderId(order.id)}
                    className={`w-full rounded-xl border p-4 text-left transition-colors ${
                      selectedOrderId === order.id ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">Order #{order.id.slice(0, 8)}</p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{order.status}</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p>
                    <p className="mt-2 text-sm font-semibold text-foreground">{formatCurrency(order.total)}</p>
                  </button>
                ))}
              </aside>

              <div className="rounded-xl border border-border bg-card p-4 sm:p-6 lg:col-span-2">
                {!selectedOrder ? null : (
                  <div className="space-y-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-semibold text-foreground">Order Details</h2>
                      <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium uppercase text-muted-foreground">
                        {selectedOrder.status}
                      </span>
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

                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">{item.product_name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-foreground">{formatCurrency(item.line_total)}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
