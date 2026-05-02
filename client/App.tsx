import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { UserProvider } from "@/context/UserContext";
import { SettingsProvider } from "@/context/SettingsContext";
import { CustomizationProvider } from "@/context/CustomizationContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Public Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Services from "./pages/Services";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import AccountOrders from "./pages/AccountOrders";
import AccountLikes from "./pages/AccountLikes";
import AccountReviews from "./pages/AccountReviews";
import NotFound from "./pages/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

// Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import Products from "./pages/dashboard/Products";
import ProductEdit from "./pages/dashboard/ProductEdit";
import ProductCategories from "./pages/dashboard/ProductCategories";
import ProductTags from "./pages/dashboard/ProductTags";
import ProductFeatured from "./pages/dashboard/ProductFeatured";
import Analytics from "./pages/dashboard/Analytics";
import Settings from "./pages/dashboard/Settings";
import Orders from "./pages/dashboard/Orders";
import Reviews from "./pages/dashboard/Reviews";
import Refunds from "./pages/dashboard/Refunds";
import CustomizeAbout from "./pages/dashboard/CustomizeAbout";
import CustomizeFooter from "./pages/dashboard/CustomizeFooter";
import CustomizeHero from "./pages/dashboard/CustomizeHero";
import CustomizeServices from "./pages/dashboard/CustomizeServices";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <CartProvider>
            <SettingsProvider>
              <CustomizationProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner position="bottom-right" richColors closeButton />
                  <BrowserRouter>
                    <Routes>
                      {/* Public Routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/shop" element={<Shop />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/account/orders" element={<AccountOrders />} />
                      <Route path="/account/likes" element={<AccountLikes />} />
                      <Route path="/account/reviews" element={<AccountReviews />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/services" element={<Services />} />

                      {/* Auth Routes */}
                      <Route path="/login" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />

                      {/* Protected Dashboard Routes */}
                      <Route
                        path="/dashboard"
                        element={
                          <ProtectedRoute>
                            <Dashboard />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/products"
                        element={
                          <ProtectedRoute>
                            <Products />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/products/categories"
                        element={
                          <ProtectedRoute>
                            <ProductCategories />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/products/tags"
                        element={
                          <ProtectedRoute>
                            <ProductTags />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/products/featured"
                        element={
                          <ProtectedRoute>
                            <ProductFeatured />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/products/:id/edit"
                        element={
                          <ProtectedRoute>
                            <ProductEdit />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/products/new"
                        element={
                          <ProtectedRoute>
                            <ProductEdit />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/orders"
                        element={
                          <ProtectedRoute>
                            <Orders />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/reviews"
                        element={
                          <ProtectedRoute>
                            <Reviews />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/refunds"
                        element={
                          <ProtectedRoute>
                            <Refunds />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/analytics"
                        element={
                          <ProtectedRoute>
                            <Analytics />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/settings"
                        element={
                          <ProtectedRoute>
                            <Settings />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/customize/about"
                        element={
                          <ProtectedRoute>
                            <CustomizeAbout />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/customize/footer"
                        element={
                          <ProtectedRoute>
                            <CustomizeFooter />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/customize/hero"
                        element={
                          <ProtectedRoute>
                            <CustomizeHero />
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dashboard/customize/services"
                        element={
                          <ProtectedRoute>
                            <CustomizeServices />
                          </ProtectedRoute>
                        }
                      />

                      {/* Catch All */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                </TooltipProvider>
              </CustomizationProvider>
            </SettingsProvider>
          </CartProvider>
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
