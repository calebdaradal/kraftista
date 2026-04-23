import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { CheckoutModal } from "@/components/CheckoutModal";
import { api } from "@/lib/api";
import { useSettings } from "@/context/SettingsContext";

export function Header() {
  const resolveAssetUrl = (assetPath?: string) => {
    if (!assetPath) return "";
    if (assetPath.startsWith("http://") || assetPath.startsWith("https://") || assetPath.startsWith("data:")) {
      return assetPath;
    }
    const base =
      typeof window === "undefined"
        ? "http://127.0.0.1:8000"
        : import.meta.env.DEV
          ? "http://127.0.0.1:8000"
          : window.location.origin;
    return `${base}${assetPath.startsWith("/") ? "" : "/"}${assetPath}`;
  };
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout } = useUser();
  const { settings } = useSettings();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("craft_customer_token");
    if (!user || !token) {
      setPendingReviewCount(0);
      return;
    }
    api.customer
      .getReviewNotifications(token)
      .then((res) => setPendingReviewCount(res.pending_count))
      .catch(() => setPendingReviewCount(0));
  }, [user]);

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsUserMenuOpen(false);
  };

  const handleMenuNavigate = (href: string) => {
    navigate(href);
    setIsUserMenuOpen(false);
  };

  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group"
          >
            {settings.logoUrl ? (
              <img
                src={resolveAssetUrl(settings.logoUrl)}
                alt={`${settings.siteName} logo`}
                className="h-10 w-10 rounded-lg object-contain"
              />
            ) : (
              <div className="w-10 h-10 rounded-lg flex items-center justify-center border border-border text-lg font-display font-bold text-foreground">
                {settings.logo || settings.siteName.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="hidden sm:block">
              <div className="font-display font-bold text-lg text-foreground">
                {settings.siteName}
              </div>
              <div className="text-xs text-muted-foreground">
                Handmade Goods
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-foreground hover:text-primary transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link to="/cart" className="relative p-2 hover:bg-muted rounded-lg transition-colors">
              <ShoppingCart className="w-5 h-5 text-foreground" />
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User Menu / Login Button */}
            {user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-sm font-medium text-foreground truncate max-w-[100px]">
                    {user.name}
                  </span>
                </button>

                {/* User Menu Dropdown */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-40">
                    <div className="p-3 border-b border-border">
                      <p className="text-sm font-semibold text-foreground">
                        {user.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </button>
                    <button
                      onClick={() => handleMenuNavigate("/account/orders")}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Orders
                    </button>
                    <button
                      onClick={() => handleMenuNavigate("/account/likes")}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors"
                    >
                      Likes
                    </button>
                    <button
                      onClick={() => handleMenuNavigate("/account/reviews")}
                      className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-muted transition-colors flex items-center justify-between gap-3"
                    >
                      <span>Reviews</span>
                      {pendingReviewCount > 0 ? (
                        <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-semibold text-primary-foreground">
                          {pendingReviewCount > 99 ? "99+" : pendingReviewCount}
                        </span>
                      ) : null}
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-sm text-destructive hover:bg-muted transition-colors flex items-center gap-2 border-t border-border"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden sm:block px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
            >
              {isOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={() => setIsOpen(false)}
                className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium text-sm"
              >
                {link.label}
              </Link>
            ))}
            {!user && (
              <button
                onClick={() => {
                  setShowAuthModal(true);
                  setIsOpen(false);
                }}
                className="mx-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium text-sm hover:bg-primary/90 transition-colors"
              >
                Login / Register
              </button>
            )}
          </nav>
        )}
      </div>

      {/* Auth Modal */}
      <CheckoutModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </header>
  );
}
