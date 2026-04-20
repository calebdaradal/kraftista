import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { IconSelector } from "@/components/IconSelector";
import { useCustomization } from "@/context/CustomizationContext";
import { useState } from "react";
import { Trash2, Plus } from "lucide-react";
import type { AboutValue, AboutMilestone, AboutTeamMember } from "@shared/customization";

export default function CustomizeAbout() {
  const { about, updateAbout, resetAbout } = useCustomization();
  const [formData, setFormData] = useState(about);
  const [activeTab, setActiveTab] = useState<"hero" | "values" | "milestones" | "team" | "preview">("hero");

  const handleSave = () => {
    updateAbout(formData);
    alert("About page customization saved!");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset to defaults?")) {
      resetAbout();
      setFormData(about);
    }
  };

  // Hero Section
  const handleHeroChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Values Section
  const updateValue = (id: string, field: keyof AboutValue, value: string) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    }));
  };

  const deleteValue = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      values: prev.values.filter((v) => v.id !== id),
    }));
  };

  const addValue = () => {
    const newValue: AboutValue = {
      id: Date.now().toString(),
      icon: "star",
      title: "New Value",
      description: "Add description here",
    };
    setFormData((prev) => ({
      ...prev,
      values: [...prev.values, newValue],
    }));
  };

  // Milestones Section
  const updateMilestone = (id: string, field: keyof AboutMilestone, value: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const deleteMilestone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const addMilestone = () => {
    const newMilestone: AboutMilestone = {
      id: Date.now().toString(),
      year: new Date().getFullYear().toString(),
      title: "New Milestone",
      description: "Add description here",
    };
    setFormData((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone],
    }));
  };

  // Team Section
  const updateTeamMember = (id: string, field: keyof AboutTeamMember, value: string) => {
    setFormData((prev) => ({
      ...prev,
      team: prev.team.map((m) => (m.id === id ? { ...m, [field]: value } : m)),
    }));
  };

  const deleteTeamMember = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      team: prev.team.filter((m) => m.id !== id),
    }));
  };

  const addTeamMember = () => {
    const newMember: AboutTeamMember = {
      id: Date.now().toString(),
      name: "New Member",
      role: "Job Title",
    };
    setFormData((prev) => ({
      ...prev,
      team: [...prev.team, newMember],
    }));
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">Customize About Page</h1>
            <p className="text-sm text-muted-foreground">Edit the content, layout, and visuals of your about page</p>
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
          {["hero", "values", "milestones", "team", "preview"].map((tab) => (
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
          {/* Hero Section */}
          {activeTab === "hero" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Hero Title</label>
                <input
                  type="text"
                  value={formData.heroTitle}
                  onChange={(e) => handleHeroChange("heroTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Hero Subtitle</label>
                <textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => handleHeroChange("heroSubtitle", e.target.value)}
                  rows={4}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
          )}

          {/* Values Section */}
          {activeTab === "values" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Section Title</label>
                <input
                  type="text"
                  value={formData.valuesTitle}
                  onChange={(e) => handleHeroChange("valuesTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Values</h3>
                  <button
                    onClick={addValue}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Value
                  </button>
                </div>

                {formData.values.map((value) => (
                  <div key={value.id} className="border border-border rounded-lg p-4 space-y-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-4">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Icon</label>
                          <IconSelector value={value.icon} onChange={(icon) => updateValue(value.id, "icon", icon)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={value.title}
                            onChange={(e) => updateValue(value.id, "title", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Description</label>
                          <textarea
                            value={value.description}
                            onChange={(e) => updateValue(value.id, "description", e.target.value)}
                            rows={2}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteValue(value.id)}
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

          {/* Milestones Section */}
          {activeTab === "milestones" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Section Title</label>
                <input
                  type="text"
                  value={formData.milestonesTitle}
                  onChange={(e) => handleHeroChange("milestonesTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Milestones</h3>
                  <button
                    onClick={addMilestone}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Milestone
                  </button>
                </div>

                {formData.milestones.map((milestone) => (
                  <div key={milestone.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Year</label>
                          <input
                            type="text"
                            value={milestone.year}
                            onChange={(e) => updateMilestone(milestone.id, "year", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Title</label>
                          <input
                            type="text"
                            value={milestone.title}
                            onChange={(e) => updateMilestone(milestone.id, "title", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Description</label>
                          <textarea
                            value={milestone.description}
                            onChange={(e) => updateMilestone(milestone.id, "description", e.target.value)}
                            rows={2}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteMilestone(milestone.id)}
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

          {/* Team Section */}
          {activeTab === "team" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Section Title</label>
                <input
                  type="text"
                  value={formData.teamTitle}
                  onChange={(e) => handleHeroChange("teamTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Team Members</h3>
                  <button
                    onClick={addTeamMember}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border hover:bg-muted transition-colors text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Add Member
                  </button>
                </div>

                {formData.team.map((member) => (
                  <div key={member.id} className="border border-border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Name</label>
                          <input
                            type="text"
                            value={member.name}
                            onChange={(e) => updateTeamMember(member.id, "name", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground">Role</label>
                          <input
                            type="text"
                            value={member.role}
                            onChange={(e) => updateTeamMember(member.id, "role", e.target.value)}
                            className="w-full mt-1 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => deleteTeamMember(member.id)}
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

          {/* Preview */}
          {activeTab === "preview" && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-foreground">Preview Emoji</label>
                <input
                  type="text"
                  value={formData.previewEmoji}
                  onChange={(e) => handleHeroChange("previewEmoji", e.target.value)}
                  maxLength={2}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                  placeholder="🪄"
                />
                <p className="text-xs text-muted-foreground mt-1">Single emoji or character for the preview section</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Preview Title</label>
                <input
                  type="text"
                  value={formData.previewTitle}
                  onChange={(e) => handleHeroChange("previewTitle", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Preview Image Alt Text</label>
                <input
                  type="text"
                  value={formData.previewImageAlt}
                  onChange={(e) => handleHeroChange("previewImageAlt", e.target.value)}
                  className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
