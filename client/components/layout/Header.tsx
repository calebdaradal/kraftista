import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, X, User, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import { useState, useRef, useEffect, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useUser } from "@/context/UserContext";
import { CheckoutModal } from "@/components/CheckoutModal";
import { api, type PublicCategory } from "@/lib/api";
import type { Product } from "@/types/product";
import { useSettings } from "@/context/SettingsContext";
import { SiteLogo } from "@/components/SiteLogo";

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [isShopMenuOpen, setIsShopMenuOpen] = useState(false);
  const [hoveredCollection, setHoveredCollection] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [mobileShopOpen, setMobileShopOpen] = useState(false);
  const [shopProducts, setShopProducts] = useState<Product[]>([]);
  const [publicCategories, setPublicCategories] = useState<PublicCategory[]>([]);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const shopMenuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { itemCount } = useCart();
  const { user, logout } = useUser();
  const { settings } = useSettings();

  const navLinks = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  // Load storefront data used to build the Shop mega-menu.
  useEffect(() => {
    api.products
      .list({ active: true })
      .then(setShopProducts)
      .catch(() => setShopProducts([]));
    api.products
      .listPublicCategories()
      .then(setPublicCategories)
      .catch(() => setPublicCategories([]));
  }, []);

  // Ordered list of collections that have at least one product.
  const collections = useMemo(() => {
    const set = new Set<string>();
    for (const product of shopProducts) {
      if (product.collection) set.add(product.collection);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [shopProducts]);

  // Dynamic map: collection name -> category names derived from products.
  const categoriesByCollection = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const product of shopProducts) {
      if (!product.collection || !product.category) continue;
      if (!map.has(product.collection)) map.set(product.collection, new Set());
      map.get(product.collection)!.add(product.category);
    }
    const result: Record<string, string[]> = {};
    for (const [collection, cats] of map.entries()) {
      result[collection] = Array.from(cats).sort((a, b) => a.localeCompare(b));
    }
    return result;
  }, [shopProducts]);

  // Lookup for a category's image + description.
  const categoryInfo = useMemo(() => {
    const map: Record<string, PublicCategory> = {};
    for (const category of publicCategories) {
      map[category.name.toLowerCase()] = category;
    }
    return map;
  }, [publicCategories]);

  const activeCollection = hoveredCollection ?? collections[0] ?? null;
  const activeCategories = activeCollection ? categoriesByCollection[activeCollection] ?? [] : [];
  const activeCategoryInfo = hoveredCategory ? categoryInfo[hoveredCategory.toLowerCase()] : undefined;
  const isImageSource = (src?: string | null) =>
    !!src && (src.startsWith("data:") || src.startsWith("http://") || src.startsWith("https://"));

  const closeShopMenu = () => {
    setIsShopMenuOpen(false);
    setHoveredCollection(null);
    setHoveredCategory(null);
  };

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
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <SiteLogo
            label={settings.siteName}
            sublabel="Handmade Goods"
            wideImgClass="max-h-12 w-auto max-w-[14rem]"
            squareImgClass="w-10 h-10"
            labelClassName="hidden sm:block"
          />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors font-medium text-sm"
            >
              Home
            </Link>

            {/* Shop mega-menu trigger */}
            <div
              className="static"
              onMouseEnter={() => setIsShopMenuOpen(true)}
            >
              <Link
                to="/shop"
                className={cn(
                  "flex items-center gap-1 text-foreground hover:text-primary transition-colors font-medium text-sm",
                  isShopMenuOpen && "text-primary",
                )}
              >
                Shop
                <ChevronDown
                  className={cn(
                    "w-4 h-4 transition-transform",
                    isShopMenuOpen && "rotate-180",
                  )}
                />
              </Link>
            </div>

            {navLinks
              .filter((link) => link.href !== "/")
              .map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  onMouseEnter={closeShopMenu}
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
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium text-sm"
            >
              Home
            </Link>

            {/* Shop accordion (lists only, no preview column) */}
            <button
              onClick={() => setMobileShopOpen((prev) => !prev)}
              className="flex items-center justify-between w-full px-4 py-2 text-foreground hover:bg-muted rounded-lg transition-colors font-medium text-sm"
            >
              Shop
              <ChevronDown
                className={cn(
                  "w-4 h-4 transition-transform",
                  mobileShopOpen && "rotate-180",
                )}
              />
            </button>
            {mobileShopOpen && (
              <div className="pl-4 flex flex-col gap-1 border-l border-border ml-4">
                <Link
                  to="/shop"
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-2 text-primary font-semibold hover:bg-muted rounded-lg transition-colors text-sm"
                >
                  Shop all products
                </Link>
                {collections.map((collection) => (
                  <div key={collection} className="flex flex-col">
                    <Link
                      to={`/shop?collection=${encodeURIComponent(collection)}`}
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-foreground font-medium hover:bg-muted rounded-lg transition-colors text-sm"
                    >
                      {collection}
                    </Link>
                    <div className="pl-4 flex flex-col">
                      {(categoriesByCollection[collection] ?? []).map((category) => (
                        <Link
                          key={category}
                          to={`/shop?category=${encodeURIComponent(category)}`}
                          onClick={() => setIsOpen(false)}
                          className="block px-4 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground rounded-lg transition-colors text-sm"
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {navLinks
              .filter((link) => link.href !== "/")
              .map((link) => (
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

      {/* Shop Mega-Menu (desktop) */}
      {isShopMenuOpen && (
        <div
          ref={shopMenuRef}
          onMouseLeave={closeShopMenu}
          className="hidden md:block absolute left-0 right-0 top-full border-t border-border bg-background shadow-lg"
        >
          <div className="container mx-auto px-4 sm:px-6 py-6">
            <div className="grid grid-cols-12 gap-6 min-h-[320px]">
              {/* Left: Shop all + collections */}
              <div className="col-span-3 border-r border-border pr-6">
                <Link
                  to="/shop"
                  onClick={closeShopMenu}
                  className="block px-3 py-2 rounded-lg font-semibold text-sm text-primary hover:bg-muted transition-colors"
                >
                  Shop all products
                </Link>
                <div className="mt-2 flex flex-col">
                  {collections.length === 0 && (
                    <span className="px-3 py-2 text-sm text-muted-foreground">
                      No collections yet
                    </span>
                  )}
                  {collections.map((collection) => (
                    <Link
                      key={collection}
                      to={`/shop?collection=${encodeURIComponent(collection)}`}
                      onMouseEnter={() => {
                        setHoveredCollection(collection);
                        setHoveredCategory(null);
                      }}
                      onClick={closeShopMenu}
                      className={cn(
                        "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
                        activeCollection === collection
                          ? "bg-muted text-primary font-medium"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      {collection}
                      <ChevronRight className="w-4 h-4 opacity-60" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Center: categories for the active collection */}
              <div className="col-span-4 border-r border-border pr-6">
                {activeCollection ? (
                  <>
                    <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {activeCollection}
                    </p>
                    <div className="grid grid-cols-1 gap-0.5">
                      {activeCategories.length === 0 && (
                        <span className="px-3 py-2 text-sm text-muted-foreground">
                          No categories
                        </span>
                      )}
                      {activeCategories.map((category) => (
                        <Link
                          key={category}
                          to={`/shop?category=${encodeURIComponent(category)}`}
                          onMouseEnter={() => setHoveredCategory(category)}
                          onClick={closeShopMenu}
                          className={cn(
                            "px-3 py-2 rounded-lg text-sm transition-colors",
                            hoveredCategory === category
                              ? "bg-muted text-primary font-medium"
                              : "text-foreground hover:bg-muted",
                          )}
                        >
                          {category}
                        </Link>
                      ))}
                    </div>
                  </>
                ) : (
                  <span className="px-3 py-2 text-sm text-muted-foreground">
                    Hover a collection to see its categories
                  </span>
                )}
              </div>

              {/* Right: hovered category image + description */}
              <div className="col-span-5">
                {activeCategoryInfo ? (
                  <Link
                    to={`/shop?category=${encodeURIComponent(activeCategoryInfo.name)}`}
                    onClick={closeShopMenu}
                    className="block group"
                  >
                    <div className="h-56 w-full flex items-center justify-center overflow-hidden rounded-xl bg-muted">
                      {isImageSource(activeCategoryInfo.image_url) ? (
                        <img
                          src={activeCategoryInfo.image_url as string}
                          alt={activeCategoryInfo.name}
                          className="max-w-full max-h-full w-auto h-auto object-contain transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="text-4xl">
                          🧺
                        </div>
                      )}
                    </div>
                    {activeCategoryInfo.description && (
                      <p className="mt-3 text-sm text-muted-foreground line-clamp-3">
                        {activeCategoryInfo.description}
                      </p>
                    )}
                  </Link>
                ) : (
                  <div className="h-full flex items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                    Hover a category to preview it
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      <CheckoutModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={() => setShowAuthModal(false)}
      />
    </header>
  );
}
