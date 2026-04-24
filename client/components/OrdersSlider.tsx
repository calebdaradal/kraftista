import { ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { CustomerOrder } from "@/lib/api";

interface OrdersSliderProps {
  orders: CustomerOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
}

const isImageUrl = (value?: string | null) =>
  !!value && (value.startsWith("http://") || value.startsWith("https://"));

export function OrdersSlider({ orders, selectedOrderId, onSelectOrder }: OrdersSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  if (orders.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
        No orders yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
        >
          {orders.map((order) => {
            const isSelected = selectedOrderId === order.id;
            const firstItem = order.items[0];
            const thumbnail = firstItem?.image_url;
            const productCount = order.items.length;
            const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
            const productName =
              productCount === 1 ? firstItem?.product_name : `${productCount} products`;
            const variationCount = order.items.reduce(
              (sum, item) =>
                sum + (item.selected_variations ? Object.keys(item.selected_variations).length : 0),
              0
            );

            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectOrder(order.id)}
                className={cn(
                  "flex-shrink-0 w-72 rounded-xl border transition-all duration-200 text-left",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                )}
              >
                <div className="flex gap-3 p-4">
                  {/* Thumbnail */}
                  <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden bg-muted border border-border flex items-center justify-center">
                    {isImageUrl(thumbnail) ? (
                      <img
                        src={thumbnail!}
                        alt={firstItem?.product_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="w-6 h-6 text-muted-foreground/50" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        #{order.id.slice(0, 8)}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
                          order.status === "delivered" && "bg-green-100 text-green-700",
                          order.status === "shipped" && "bg-blue-100 text-blue-700",
                          order.status === "processing" && "bg-amber-100 text-amber-700",
                          !["delivered", "shipped", "processing"].includes(order.status) &&
                            "bg-muted text-muted-foreground"
                        )}
                      >
                        {order.status}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                      {productName}
                    </p>

                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        Qty: <span className="font-semibold text-foreground">{totalQuantity}</span>
                      </span>
                      {variationCount > 0 && (
                        <span className="text-xs text-primary font-medium">
                          {variationCount} variation{variationCount !== 1 ? "s" : ""}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-auto">
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {orders.length > 2 && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-background border border-border p-2 hover:bg-muted transition-colors shadow-sm"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-background border border-border p-2 hover:bg-muted transition-colors shadow-sm"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
