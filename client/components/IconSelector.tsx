import * as Icons from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const AVAILABLE_ICONS = [
  "Heart",
  "Leaf",
  "Award",
  "Users",
  "Star",
  "Zap",
  "Palette",
  "Lightbulb",
  "Target",
  "Rocket",
  "Shield",
  "Smile",
  "Gift",
  "Music",
  "Camera",
  "Coffee",
  "Globe",
  "Anchor",
] as const;

type IconName = (typeof AVAILABLE_ICONS)[number];

function isValidIconName(name: string): name is IconName {
  return AVAILABLE_ICONS.includes(name as IconName);
}

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export function IconSelector({ value, onChange, label }: IconSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-foreground">{label}</label>}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg border border-border bg-card">
            {isValidIconName(value) ? (
              (() => {
                const Icon = (Icons as Record<string, any>)[value];
                return <Icon className="w-6 h-6 text-primary" />;
              })()
            ) : (
              <span className="text-sm text-muted-foreground">No icon</span>
            )}
          </div>
          <span className="text-sm font-medium text-foreground">{value || "Select icon"}</span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted transition-colors text-sm text-foreground"
        >
          {isOpen ? "Hide Icons" : "Select Icon"}
        </button>

        {isOpen && (
          <div className="grid grid-cols-6 gap-2 p-3 border border-border rounded-lg bg-card">
            {AVAILABLE_ICONS.map((iconName) => {
              const Icon = (Icons as Record<string, any>)[iconName];
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => {
                    onChange(iconName);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "p-2 rounded-lg border transition-all hover:border-primary",
                    value === iconName
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted"
                  )}
                  title={iconName}
                >
                  <Icon className="w-5 h-5 mx-auto" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
