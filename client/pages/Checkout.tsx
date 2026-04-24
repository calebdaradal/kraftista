import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Check, Package, Truck, Lock, AlertCircle, Link as LinkIcon, ShoppingBag } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { api } from "@/lib/api";

// TODO[TEMP_PAYMENT_BYPASS_REMOVE_BEFORE_LIVE]:
// This temporary flag forces orders through without real payment processing.
// Replace this with actual payment intent/authorization flow before production launch.
const TEMP_PAYMENT_BYPASS_ENABLED = true;

const sanitizeCartImage = (image: string) => {
  if (!image) return null;
  const trimmed = image.trim();
  if (!trimmed) return null;
  // Only reject base64 data-URLs — they are too large for the DB.
  // Signed Supabase https:// URLs can exceed 512 chars and must be kept as-is.
  if (trimmed.startsWith("data:")) return null;
  return trimmed;
};

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const subtotal = totalPrice;
  const tax = subtotal * 0.08;
  const shipping = subtotal > 50 ? 0 : 10;
  const total = subtotal + tax + shipping;

  // Check if user has address
  const hasAddress = user?.address &&
    user.address.street &&
    user.address.city &&
    user.address.state &&
    user.address.zipCode &&
    user.address.country;

  const handleCheckout = () => {
    setCheckoutError("");
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!TEMP_PAYMENT_BYPASS_ENABLED && !hasAddress) {
      return; // Show warning in UI, prevent checkout
    }
    completeCheckout();
  };

  const completeCheckout = async () => {
    const token = localStorage.getItem("craft_customer_token");
    if (!user) {
      setCheckoutError("Please sign in to place your order.");
      setShowAuthModal(true);
      return;
    }
    if (!token) {
      setCheckoutError("Your session expired. Please sign in again.");
      setShowAuthModal(true);
      return;
    }
    if (items.length === 0) {
      setCheckoutError("Your cart is empty.");
      return;
    }

    const shippingAddress = {
      full_name: user.name || "Customer",
      phone: user.phone || "Not provided",
      street: user.address?.street || "Address pending",
      city: user.address?.city || "Unknown city",
      state: user.address?.state || "Unknown state",
      zip_code: user.address?.zipCode || "00000",
      country: user.address?.country || "Unknown country",
    };

    setIsSubmittingOrder(true);
    setCheckoutError("");
    try {
      // TODO[TEMP_PAYMENT_BYPASS_REMOVE_BEFORE_LIVE]:
      // Ensure local cart entries are synced before checkout while payment flow is temporary.
      await Promise.all(
        items.map((item) =>
          api.customer.upsertCartItem(
            {
              product_id: item.productId,
              quantity: item.quantity,
              selected_variations: item.selectedVariations ?? {},
              unit_price: item.price,
              image_url: sanitizeCartImage(item.image),
              product_name: item.name,
            },
            token
          )
        )
      );

      await api.customer.checkout(
        {
          // TODO[TEMP_PAYMENT_BYPASS_REMOVE_BEFORE_LIVE]:
          // Marker kept in backend data only; remove when real payment is integrated.
          payment_method: TEMP_PAYMENT_BYPASS_ENABLED ? "manual_test_bypass" : "card",
          order_note: orderNote.trim() || null,
          shipping_address: shippingAddress,
        },
        token
      );
      setOrderPlaced(true);
      clearCart();
    } catch (err) {
      setCheckoutError(err instanceof Error ? err.message : "Unable to place order right now.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  if (orderPlaced) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6 max-w-md mx-auto">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Order Placed!
                </h1>
                <p className="text-muted-foreground">
                  Thank you for your purchase. We'll send you an email confirmation
                  shortly.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Back to Shopping
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5"
                >
                  View My Orders
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="space-y-6">
              <Package className="w-16 h-16 text-muted-foreground mx-auto" />
              <div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                  Your Cart is Empty
                </h1>
                <p className="text-muted-foreground">
                  You don't have any items to checkout.
                </p>
              </div>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="py-8 md:py-14">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-6 md:mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Info */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Shipping Address
                </h2>

                {user ? (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Name
                      </p>
                      <p className="font-semibold text-foreground">
                        {user.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Email
                      </p>
                      <p className="font-semibold text-foreground">
                        {user.email}
                      </p>
                    </div>
                    {user.phone && (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Phone
                        </p>
                        <p className="font-semibold text-foreground">
                          {user.phone}
                        </p>
                      </div>
                    )}
                    {hasAddress ? (
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Address
                        </p>
                        <p className="font-semibold text-foreground">
                          {user.address.street}
                        </p>
                        <p className="text-sm text-foreground">
                          {user.address.city}, {user.address.state} {user.address.zipCode}
                        </p>
                        <p className="text-sm text-foreground">
                          {user.address.country}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-destructive/10 border border-destructive rounded-lg space-y-2">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-destructive">
                              Shipping address required
                            </p>
                            <p className="text-sm text-destructive/80">
                              Please add a complete shipping address in your profile to continue.
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate("/profile")}
                          className="flex items-center gap-2 text-sm font-semibold text-destructive hover:text-destructive/80 transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          Go to Profile
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-sm text-foreground font-semibold mb-2">
                        Sign in to continue
                      </p>
                      <p className="text-sm text-muted-foreground">
                        You'll be able to enter your shipping address after
                        signing in or creating an account.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items Summary */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg">
                  Order Items
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${JSON.stringify(item.selectedVariations)}`}
                      className="flex justify-between pb-3 border-b border-border last:border-0"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-foreground">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {checkoutError && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-sm text-destructive">
                  {checkoutError}
                </div>
              )}

              {/* Payment Method */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <h2 className="font-semibold text-foreground text-lg flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Payment Method
                </h2>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-3 border-2 border-primary bg-primary/5 rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      defaultChecked
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-foreground">
                        Credit/Debit Card
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Visa, Mastercard, American Express
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-3 border-2 border-border rounded-lg cursor-pointer hover:border-primary/30">
                    <input
                      type="radio"
                      name="payment"
                      value="paypal"
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-medium text-foreground">PayPal</p>
                      <p className="text-xs text-muted-foreground">
                        Fast and secure
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Order Notes */}
              <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div>
                  <h2 className="font-semibold text-foreground text-lg mb-2">
                    Order Notes
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add any special instructions for your order (optional)
                  </p>
                </div>
                <textarea
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="E.g., Please leave at the door if no one is home, or any special handling instructions..."
                  className="w-full px-4 py-3 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {orderNote.length}/500 characters
                </p>
              </div>
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
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Shipping</span>
                    <span className="font-semibold text-foreground">
                      {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-semibold text-foreground">
                      ${tax.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary text-xl">
                    ${total.toFixed(2)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={isSubmittingOrder}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!user ? "Sign In to Continue" : isSubmittingOrder ? "Placing Order..." : "Place Order"}
                </button>

                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    You'll be prompted to sign in or create an account
                  </p>
                )}
                {user && !hasAddress && !TEMP_PAYMENT_BYPASS_ENABLED && (
                  <p className="text-xs text-destructive text-center">
                    Please complete your shipping address in your profile to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <CheckoutModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={completeCheckout}
      />
    </Layout>
  );
}
