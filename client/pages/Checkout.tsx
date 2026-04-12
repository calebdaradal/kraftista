import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { useState } from "react";
import { CheckoutModal } from "@/components/CheckoutModal";
import { Check, Package, Truck, Lock, AlertCircle, Link as LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useUser();
  const navigate = useNavigate();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderNote, setOrderNote] = useState("");

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
    if (!user) {
      setShowAuthModal(true);
      return;
    }
    if (!hasAddress) {
      return; // Show warning in UI, prevent checkout
    }
    completeCheckout();
  };

  const completeCheckout = () => {
    setOrderPlaced(true);
    clearCart();
    setTimeout(() => {
      window.location.href = "/";
    }, 3000);
  };

  if (orderPlaced) {
    return (
      <Layout>
        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
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
              <p className="text-sm text-muted-foreground">
                Redirecting you home in a moment...
              </p>
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
          <div className="container mx-auto px-4 text-center">
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
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h1 className="font-display text-3xl font-bold text-foreground mb-8">
            Checkout
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  onClick={handleCheckout}
                  disabled={user && !hasAddress}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!user ? "Sign In to Continue" : hasAddress ? "Place Order" : "Complete Address in Profile"}
                </button>

                {!user && (
                  <p className="text-xs text-muted-foreground text-center">
                    You'll be prompted to sign in or create an account
                  </p>
                )}
                {user && !hasAddress && (
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
