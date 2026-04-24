import { Layout } from "@/components/layout/Layout";
import { useUser } from "@/context/UserContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { User, Phone, MapPin, Save, AlertCircle } from "lucide-react";

export default function Profile() {
  const { user, updateProfile, isLoading } = useUser();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if not authenticated
  if (!user) {
    navigate("/");
    return null;
  }

  const [formData, setFormData] = useState({
    name: user.name || "",
    phone: user.phone || "",
    street: user.address?.street || "",
    city: user.address?.city || "",
    state: user.address?.state || "",
    zipCode: user.address?.zipCode || "",
    country: user.address?.country || "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate required fields
    if (
      !formData.name ||
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.zipCode ||
      !formData.country
    ) {
      setError("All address fields are required");
      return;
    }

    if (!formData.phone) {
      setError("Phone number is required");
      return;
    }

    try {
      await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
      });
      setSuccess("Profile updated successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile");
    }
  };

  return (
    <Layout>
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
          <div className="space-y-8">
            {/* Header */}
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                My Profile
              </h1>
              <p className="text-muted-foreground">
                Manage your personal information and shipping address
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-6">
              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive rounded-lg">
                  <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-4 bg-green-100 border border-green-300 rounded-lg text-sm text-green-800">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information Section */}
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-lg text-foreground mb-4">
                    <User className="w-5 h-5" />
                    Personal Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        <span className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          Mobile Number *
                        </span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        placeholder="+1 (555) 123-4567"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address Section */}
                <div>
                  <h2 className="flex items-center gap-2 font-semibold text-lg text-foreground mb-4">
                    <MapPin className="w-5 h-5" />
                    Shipping Address
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="street"
                        value={formData.street}
                        onChange={handleInputChange}
                        required
                        placeholder="123 Main Street"
                        className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          name="city"
                          value={formData.city}
                          onChange={handleInputChange}
                          required
                          placeholder="New York"
                          className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          State/Province *
                        </label>
                        <input
                          type="text"
                          name="state"
                          value={formData.state}
                          onChange={handleInputChange}
                          required
                          placeholder="NY"
                          className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Zip/Postal Code *
                        </label>
                        <input
                          type="text"
                          name="zipCode"
                          value={formData.zipCode}
                          onChange={handleInputChange}
                          required
                          placeholder="10001"
                          className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-foreground mb-2">
                          Country *
                        </label>
                        <input
                          type="text"
                          name="country"
                          value={formData.country}
                          onChange={handleInputChange}
                          required
                          placeholder="United States"
                          className="w-full px-4 py-2.5 border border-border rounded-lg bg-input text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </form>

              <p className="text-xs text-muted-foreground text-center">
                * Required fields
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
