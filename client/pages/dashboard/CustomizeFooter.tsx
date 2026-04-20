import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useCustomization } from "@/context/CustomizationContext";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { FooterLink, FooterSection } from "@shared/customization";

export default function CustomizeFooter() {
  const { footer, updateFooter, resetFooter } = useCustomization();
  const [formData, setFormData] = useState(footer);
  const [activeTab, setActiveTab] = useState<"brand" | "sections" | "social" | "bottom">("brand");

  const handleSave = async () => {
    await updateFooter(formData);
    alert("Footer customization saved!");
  };

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset to defaults?")) {
      await resetFooter();
      setFormData(footer);
    }
  };

  // Brand Section
  const handleBrandChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Sections
  const updateSection = (sectionId: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) => (s.id === sectionId ? { ...s, [field]: value } : s)),
    }));
  };

  const updateLink = (sectionId: string, linkId: string, field: "label" | "href", value: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: s.links.map((l) => (l.id === linkId ? { ...l, [field]: value } : l)),
            }
          : s
      ),
    }));
  };

  const deleteLink = (sectionId: string, linkId: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: s.links.filter((l) => l.id !== linkId),
            }
          : s
      ),
    }));
  };

  const addLink = (sectionId: string) => {
    const newLink: FooterLink = {
      id: Date.now().toString(),
      label: "New Link",
      href: "#",
    };
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.map((s) =>
        s.id === sectionId
          ? {
              ...s,
              links: [...s.links, newLink],
            }
          : s
      ),
    }));
  };

  const deleteSection = (sectionId: string) => {
    setFormData((prev) => ({
      ...prev,
      sections: prev.sections.filter((s) => s.id !== sectionId),
    }));
  };

  const addSection = () => {
    const newSection: FooterSection = {
      id: Date.now().toString(),
      title: "New Section",
      links: [],
    };
    setFormData((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  // Social Links
  const updateSocialLink = (id: string, field: "platform" | "url", value: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.map((s) => (s.id === id ? { ...s, [field]: value as any } : s)),
    }));
  };

  const deleteSocialLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: prev.socialLinks.filter((s) => s.id !== id),
    }));
  };

  const addSocialLink = () => {
    setFormData((prev) => ({
      ...prev,
      socialLinks: [
        ...prev.socialLinks,
        {
          id: Date.now().toString(),
          platform: "email" as const,
          url: "#",
        },
      ],
    }));
  };

  // Policy Links
  const updatePolicyLink = (id: string, field: "label" | "href", value: string) => {
    setFormData((prev) => ({
      ...prev,
      policyLinks: prev.policyLinks.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));
  };

  const deletePolicyLink = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      policyLinks: prev.policyLinks.filter((p) => p.id !== id),
    }));
  };

  const addPolicyLink = () => {
    setFormData((prev) => ({
      ...prev,
      policyLinks: [
        ...prev.policyLinks,
        {
          id: Date.now().toString(),
          label: "New Policy",
          href: "#",
        },
      ],
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Customize Footer</h1>
            <p className="text-sm text-muted-foreground">Edit footer content, links, and social media</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 rounded-lg border border-destructive text-destructive hover:bg-destructive/10 transition-colors text-sm font-medium"
            >
              Reset
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border overflow-x-auto">
          {["brand", "sections", "social", "bottom"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="rounded-xl border border-border bg-card p-6">
          {/* Brand Section */}
          {activeTab === "brand" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Brand Name</label>
                <input
                  type="text"
                  value={formData.brandName}
                  onChange={(e) => handleBrandChange("brandName", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Brand Tagline</label>
                <textarea
                  value={formData.brandTagline}
                  onChange={(e) => handleBrandChange("brandTagline", e.target.value)}
                  rows={3}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Brand Emoji (Optional)</label>
                <input
                  type="text"
                  value={formData.brandEmoji || ""}
                  onChange={(e) => handleBrandChange("brandEmoji", e.target.value)}
                  maxLength={2}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="Leave empty for letter initial"
                />
              </div>
            </div>
          )}

          {/* Sections */}
          {activeTab === "sections" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Footer Sections</h3>
                <button
                  onClick={addSection}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Section
                </button>
              </div>

              {formData.sections.map((section) => (
                <div key={section.id} className="border border-border rounded-lg p-4 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Section Title</label>
                        <input
                          type="text"
                          value={section.title}
                          onChange={(e) => updateSection(section.id, "title", e.target.value)}
                          className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Links</label>
                          <button
                            onClick={() => addLink(section.id)}
                            className="text-xs px-2 py-1 rounded border border-border hover:bg-muted transition-colors"
                          >
                            Add Link
                          </button>
                        </div>

                        {section.links.map((link) => (
                          <div key={link.id} className="flex gap-2 items-start bg-muted/30 p-2 rounded">
                            <div className="flex-1 space-y-1">
                              <input
                                type="text"
                                value={link.label}
                                onChange={(e) => updateLink(section.id, link.id, "label", e.target.value)}
                                placeholder="Label"
                                className="w-full px-2 py-1 rounded border border-border bg-background text-xs"
                              />
                              <input
                                type="text"
                                value={link.href}
                                onChange={(e) => updateLink(section.id, link.id, "href", e.target.value)}
                                placeholder="URL"
                                className="w-full px-2 py-1 rounded border border-border bg-background text-xs"
                              />
                            </div>
                            <button
                              onClick={() => deleteLink(section.id, link.id)}
                              className="p-1 text-destructive hover:bg-destructive/10 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Social Links */}
          {activeTab === "social" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Social Media Links</h3>
                <button
                  onClick={addSocialLink}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Social
                </button>
              </div>

              {formData.socialLinks.map((social) => (
                <div key={social.id} className="border border-border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">Platform</label>
                        <select
                          value={social.platform}
                          onChange={(e) => updateSocialLink(social.id, "platform", e.target.value)}
                          className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                        >
                          <option value="facebook">Facebook</option>
                          <option value="instagram">Instagram</option>
                          <option value="twitter">Twitter</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-muted-foreground">URL</label>
                        <input
                          type="text"
                          value={social.url}
                          onChange={(e) => updateSocialLink(social.id, "url", e.target.value)}
                          className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => deleteSocialLink(social.id)}
                      className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Section */}
          {activeTab === "bottom" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Copyright Text</label>
                <input
                  type="text"
                  value={formData.bottomText}
                  onChange={(e) => handleBrandChange("bottomText", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="Use {year} as placeholder for current year"
                />
                <p className="text-xs text-muted-foreground mt-1">Use {"{year}"} to insert the current year automatically</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Policy Links</h3>
                  <button
                    onClick={addPolicyLink}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Policy
                  </button>
                </div>

                {formData.policyLinks.map((policy) => (
                  <div key={policy.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Label</label>
                          <input
                            type="text"
                            value={policy.label}
                            onChange={(e) => updatePolicyLink(policy.id, "label", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">URL</label>
                          <input
                            type="text"
                            value={policy.href}
                            onChange={(e) => updatePolicyLink(policy.id, "href", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deletePolicyLink(policy.id)}
                        className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
