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
    
    // Collect all variations for later display
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
      variationCount: variations.length,
    };
  });

  return (
    <div className="space-y-4">
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-2 scrollbar-hide"
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
                  "flex-shrink-0 w-72 rounded-xl border transition-all duration-200",
                  isSelected
                    ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                    : "border-border bg-card hover:border-primary/40 hover:shadow-md"
                )}
              >
                <div className="flex flex-col h-full p-4 gap-4">
                  {/* Header: Order number + Status */}
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">Order #{order.id.slice(0, 8)}</span>
                    <span className={cn(
                      "text-xs font-medium px-2.5 py-0.5 rounded-full whitespace-nowrap",
                      order.status === "delivered" && "bg-green-100 text-green-700",
                      order.status === "shipped" && "bg-blue-100 text-blue-700",
                      order.status === "processing" && "bg-amber-100 text-amber-700",
                      !["delivered", "shipped", "processing"].includes(order.status) && "bg-muted text-muted-foreground"
                    )}>
                      {order.status}
                    </span>
                  </div>

                  {/* Product Section */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-foreground line-clamp-2 leading-tight">
                      {info.productName}
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">Qty:</span>
                        <span className="text-sm font-semibold text-foreground">{info.totalQuantity}</span>
                      </div>
                      {info.variationCount > 0 && (
                        <div className="text-xs text-primary font-medium">
                          {info.variationCount} variation{info.variationCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Footer: Date */}
                  <div className="flex-1 flex items-end">
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
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
