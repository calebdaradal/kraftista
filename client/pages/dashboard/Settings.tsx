import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Save, Eye } from "lucide-react";
import { useSettings } from "@/context/SettingsContext";

export default function Settings() {
  const { settings: globalSettings, updateSettings } = useSettings();
  const [settings, setSettings] = useState(globalSettings);

  const [activeTab, setActiveTab] = useState<
    "general" | "branding" | "content" | "colors"
  >("general");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  const handleSave = () => {
    updateSettings(settings);
    alert("Settings saved successfully!");
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "branding", label: "Branding" },
    { id: "content", label: "Content" },
    { id: "colors", label: "Colors" },
  ] as const;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">
            Settings
          </h1>
          <p className="text-muted-foreground">
            Customize your store's branding, content, and appearance
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 font-semibold border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form */}
          <div className="lg:col-span-2">
            {/* General */}
            {activeTab === "general" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">
                  General Settings
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Site Name
                  </label>
                  <input
                    type="text"
                    name="siteName"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Headline
                  </label>
                  <input
                    type="text"
                    name="headline"
                    value={settings.headline}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This appears on your homepage hero section
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={settings.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={settings.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            )}

            {/* Branding */}
            {activeTab === "branding" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">
                  Branding
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Logo/Icon
                  </label>
                  <input
                    type="text"
                    name="logo"
                    value={settings.logo}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-center text-3xl"
                    maxLength={2}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter an emoji to use as your logo
                  </p>
                </div>

                <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-muted-foreground">
                  Featured products are now managed in the Products submenu under the Featured page.
                </p>
              </div>
            )}

            {/* Content */}
            {activeTab === "content" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">
                  Content
                </h2>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    About Us Text
                  </label>
                  <textarea
                    name="aboutText"
                    value={settings.aboutText}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    This text appears on your About page
                  </p>
                </div>

                <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
                  <p className="text-sm text-foreground font-semibold mb-2">
                    Coming Soon
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Additional content sections and customization options will be
                    available soon
                  </p>
                </div>
              </div>
            )}

            {/* Colors */}
            {activeTab === "colors" && (
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h2 className="font-semibold text-foreground text-lg">
                  Color Palette
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Primary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="primaryColor"
                        value={settings.primaryColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        name="primaryColor"
                        value={settings.primaryColor}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Secondary Color
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        name="secondaryColor"
                        value={settings.secondaryColor}
                        onChange={handleInputChange}
                        className="w-12 h-12 rounded-lg border-2 border-border cursor-pointer"
                      />
                      <input
                        type="text"
                        name="secondaryColor"
                        value={settings.secondaryColor}
                        onChange={handleInputChange}
                        className="flex-1 px-4 py-2 border border-border rounded-lg bg-input text-foreground focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Note:</strong> Color changes will be reflected across
                    the entire site after saving
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
              >
                <Save className="w-5 h-5" />
                Save Settings
              </button>
              <button
                onClick={() => {
                  /* Preview functionality */
                  alert("Preview will open the site in a new tab");
                }}
                className="flex items-center gap-2 px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
              >
                <Eye className="w-5 h-5" />
                Preview Site
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-card border border-border rounded-xl p-6 h-fit sticky top-6 space-y-4">
            <h2 className="font-semibold text-foreground">Preview</h2>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  Site Name
                </p>
                <p className="text-lg font-bold text-foreground">
                  {settings.siteName}
                </p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  Headline
                </p>
                <p className="text-foreground">{settings.headline}</p>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  Logo
                </p>
                <div className="text-4xl">{settings.logo}</div>
              </div>

              <div className="border-t border-border pt-4">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">
                  Primary Color
                </p>
                <div
                  className="w-full h-12 rounded-lg border-2 border-border"
                  style={{ backgroundColor: settings.primaryColor }}
                />
                <p className="text-xs text-muted-foreground mt-1 font-mono">
                  {settings.primaryColor}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
