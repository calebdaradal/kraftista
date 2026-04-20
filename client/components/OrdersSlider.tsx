import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import type { CustomerOrder } from "@/lib/api";

interface OrdersSliderProps {
  orders: CustomerOrder[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
}

export function OrdersSlider({ orders, selectedOrderId, onSelectOrder }: OrdersSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;
    const scrollAmount = 400;
    scrollContainerRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
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

  // Calculate order display info
  const orderDisplayInfo = orders.map((order) => {
    const productCount = order.items.length;
    const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
    const productName = productCount === 1 ? order.items[0].product_name : "Multiple products";
    const variations = order.items.flatMap((item) => {
      if (!item.selected_variations || Object.keys(item.selected_variations).length === 0) {
        return [];
      }
      return Object.entries(item.selected_variations).map(([key, value]) => ({
        product_name: item.product_name,
        key,
        value,
      }));
    });

    return {
      productName,
      totalQuantity,
      variations,
    };
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {orders.map((order, index) => {
            const info = orderDisplayInfo[index];
            const isSelected = selectedOrderId === order.id;
            return (
              <button
                key={order.id}
                type="button"
                onClick={() => onSelectOrder(order.id)}
                className={cn(
                  "flex-shrink-0 w-80 rounded-xl border-2 p-4 text-left transition-all",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                <div className="space-y-3">
                  {/* Order Number */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">Order #{order.id.slice(0, 8)}</span>
                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{order.status}</span>
                  </div>

                  {/* Product Name */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Product</p>
                    <p className="text-sm font-medium text-foreground line-clamp-2">{info.productName}</p>
                  </div>

                  {/* Quantity */}
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase">Quantity</p>
                    <p className="text-sm font-semibold text-foreground">{info.totalQuantity}</p>
                  </div>

                  {/* Variations */}
                  {info.variations.length > 0 && (
                    <div className="space-y-1 pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground uppercase">Variations</p>
                      <div className="space-y-1">
                        {info.variations.map((variation, idx) => (
                          <div key={`${variation.product_name}-${variation.key}-${idx}`} className="text-xs text-foreground">
                            <span className="text-muted-foreground">{variation.key}:</span> {variation.value}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date */}
                  <p className="text-xs text-muted-foreground pt-1">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Scroll Buttons */}
        {orders.length > 2 && (
          <>
            <button
              type="button"
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 rounded-full bg-background border border-border p-2 hover:bg-muted transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 rounded-full bg-background border border-border p-2 hover:bg-muted transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
