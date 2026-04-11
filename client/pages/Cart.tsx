import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { Link } from "react-router-dom";
import { Trash2, Minus, Plus, ShoppingCart } from "lucide-react";

export default function Cart() {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <div className="space-y-6">
              <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Your Cart is Empty
                </h1>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Looks like you haven't added anything yet. Explore our collection
                  and find something you love!
                </p>
              </div>
              <Link
                to="/shop"
                className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            Shopping Cart
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${JSON.stringify(item.selectedVariations)}`}
                  className="bg-card border border-border rounded-xl p-6 flex gap-6"
                >
                  {/* Product Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center text-3xl flex-shrink-0">
                    {item.image}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 space-y-2">
                    <h3 className="font-semibold text-foreground text-lg">
                      {item.name}
                    </h3>

                    {/* Variations */}
                    {Object.keys(item.selectedVariations).length > 0 && (
                      <div className="text-sm text-muted-foreground space-y-1">
                        {Object.entries(item.selectedVariations).map(
                          ([key, value]) => (
                            <p key={key}>
                              {key}: <span className="font-medium text-foreground">{value}</span>
                            </p>
                          )
                        )}
                      </div>
                    )}

                    <p className="font-semibold text-primary">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Quantity & Actions */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() =>
                        removeFromCart(item.productId, item.selectedVariations)
                      }
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="flex items-center border border-border rounded-lg">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.selectedVariations
                          )
                        }
                        className="px-3 py-1 hover:bg-muted transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1 font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.selectedVariations
                          )
                        }
                        className="px-3 py-1 hover:bg-muted transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="h-fit sticky top-32">
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">
                  Order Summary
                </h2>

                <div className="space-y-3 border-b border-border pb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-semibold text-foreground">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-foreground">FREE</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold text-foreground">
                      ${(totalPrice * 0.08).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary text-xl">
                    ${(totalPrice * 1.08).toFixed(2)}
                  </span>
                </div>

                <Link
                  to="/checkout"
                  className="block text-center w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  Proceed to Checkout
                </Link>

                <Link
                  to="/shop"
                  className="block text-center text-primary hover:text-primary/80 font-semibold text-sm"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
