import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  Package,
  Truck,
  Settings,
  BarChart3,
  User,
  ChevronDown,
  ChevronRight,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(
    () => typeof window !== "undefined" && window.innerWidth >= 768
  );
  const sidebarOpenRef = useRef(sidebarOpen);
  sidebarOpenRef.current = sidebarOpen;
  const location = useLocation();
  const { user, logout } = useAuth();
  const [productsOpen, setProductsOpen] = useState(() => location.pathname.startsWith("/dashboard/products"));

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    if (mq.matches) setSidebarOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname.startsWith("/dashboard/products")) {
      setProductsOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const syncScrollLock = () => {
      if (!mq.matches) {
        document.body.style.overflow = "";
        return;
      }
      document.body.style.overflow = sidebarOpenRef.current ? "hidden" : "";
    };
    syncScrollLock();
    mq.addEventListener("change", syncScrollLock);
    return () => {
      mq.removeEventListener("change", syncScrollLock);
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  const navItems = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Products",
      href: "/dashboard/products",
      icon: Package,
      children: [
        { label: "All Products", href: "/dashboard/products" },
        { label: "Categories", href: "/dashboard/products/categories" },
        { label: "Tags", href: "/dashboard/products/tags" },
        { label: "Featured", href: "/dashboard/products/featured" },
      ],
    },
    {
      label: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart3,
    },
    {
      label: "Orders",
      href: "/dashboard/orders",
      icon: Truck,
    },
    {
      label: "Reviews",
      href: "/dashboard/reviews",
      icon: MessageSquare,
    },
    {
      label: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ];

  const isActive = (href: string) => location.pathname === href;
  const isProductsSection = location.pathname.startsWith("/dashboard/products");

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "bg-card border-r border-border transition-all duration-300 ease-out flex flex-col z-40 flex-shrink-0",
          "fixed inset-y-0 left-0 h-full md:static md:h-screen",
          "w-64",
          sidebarOpen
            ? "translate-x-0 md:w-64"
            : "-translate-x-full md:translate-x-0 md:w-20",
          "max-md:shadow-xl"
        )}
      >
        {/* Logo */}
        <div className="p-4 border-b border-border">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display font-bold">C</span>
            </div>
            {sidebarOpen && (
              <div>
                <div className="font-display font-bold text-foreground text-sm">
                  Craft
                </div>
                <div className="text-xs text-muted-foreground">Admin</div>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = item.children ? isProductsSection : isActive(item.href);
            const hasChildren = Boolean(item.children?.length);
            return (
              <div key={item.href} className="space-y-1">
                {hasChildren ? (
                  <button
                    type="button"
                    onClick={() => setProductsOpen((prev) => !prev)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-4 py-3 text-left transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && (
                      <>
                        <span className="font-medium">{item.label}</span>
                        <span className="ml-auto">
                          {productsOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </span>
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 768) setSidebarOpen(false);
                    }}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                      active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                    )}
                    title={!sidebarOpen ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </Link>
                )}
                {hasChildren && productsOpen && sidebarOpen && (
                  <div className="ml-8 space-y-1">
                    {item.children!.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => {
                          if (window.innerWidth < 768) setSidebarOpen(false);
                        }}
                        className={cn(
                          "block rounded-lg px-3 py-2 text-sm transition-colors",
                          isActive(child.href)
                            ? "bg-primary/15 text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted"
                        )}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-primary" />
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-destructive rounded-lg hover:bg-destructive/10 transition-colors",
              !sidebarOpen && "justify-center"
            )}
            title={!sidebarOpen ? "Logout" : undefined}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border bg-card p-3 sm:p-4">
          <button
            type="button"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="shrink-0 rounded-lg p-2 transition-colors hover:bg-muted"
            aria-expanded={sidebarOpen}
            aria-label={sidebarOpen ? "Collapse navigation" : "Open navigation"}
          >
            {sidebarOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>

          <div className="min-w-0 truncate text-right text-xs text-muted-foreground sm:text-sm">
            Welcome back,{" "}
            <span className="font-semibold text-foreground">{user?.name}</span>!
          </div>
        </div>

        {/* Content Area */}
        <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
