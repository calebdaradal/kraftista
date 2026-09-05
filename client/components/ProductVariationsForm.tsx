import { useRef, type ReactNode } from "react";
import { ChevronDown, ChevronUp, ImagePlus, Plus, Trash2 } from "lucide-react";
import { newId } from "@/lib/ids";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type {
  PrimaryVariation,
  SecondaryVariation,
  TertiaryVariation,
  PrimaryVariationOption,
  SecondaryColorOption,
  TertiaryVariationOption,
} from "@/data/products";
import { cn } from "@/lib/utils";
import { ImageStorage } from "@/utils/imageStorage";

const HEX_PRESETS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
];

function normalizeHex(raw: string): string {
  const s = raw.trim();
  if (/^#[0-9A-Fa-f]{6}$/i.test(s)) return s.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/i.test(s)) {
    const h = s.slice(1);
    return (
      "#" +
      [0, 2, 4]
        .map((i) => h[i]! + h[i]!)
        .join("")
        .toUpperCase()
    );
  }
  return "#888888";
}

function move<T>(arr: T[], i: number, dir: -1 | 1): T[] {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const next = [...arr];
  [next[i], next[j]] = [next[j]!, next[i]!];
  return next;
}

function VariationCollapsibleSection({
  title,
  description,
  defaultOpen = true,
  children,
}: {
  title: string;
  description: ReactNode;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <CollapsibleTrigger
        type="button"
        className="group flex w-full items-start justify-between gap-3 border-border px-4 py-4 text-left transition-colors hover:bg-muted/40 data-[state=open]:border-b sm:px-6"
      >
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="mt-1 text-sm text-muted-foreground">{description}</div>
        </div>
        <ChevronDown className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
      </CollapsibleTrigger>
      <CollapsibleContent className="overflow-hidden">
        <div className="space-y-4 border-t border-border p-4 sm:p-6">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

interface Props {
  basePrice: number;
  primaryVariation: PrimaryVariation;
  secondaryVariation: SecondaryVariation;
  tertiaryVariation: TertiaryVariation;
  onPrimaryChange: (v: PrimaryVariation) => void;
  onSecondaryChange: (v: SecondaryVariation) => void;
  onTertiaryChange: (v: TertiaryVariation) => void;
}

export function ProductVariationsForm({
  basePrice,
  primaryVariation,
  secondaryVariation,
  tertiaryVariation,
  onPrimaryChange,
  onSecondaryChange,
  onTertiaryChange,
}: Props) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const setPrimaryOptions = (options: PrimaryVariationOption[]) =>
    onPrimaryChange({ ...primaryVariation, options });

  const setSecondaryOptions = (options: SecondaryColorOption[]) =>
    onSecondaryChange({ ...secondaryVariation, options });

  const setTertiaryOptions = (options: TertiaryVariationOption[]) =>
    onTertiaryChange({ ...tertiaryVariation, options });

  const handlePrimaryImage = async (optionId: string, file: File | null) => {
    if (!file || !file.type.startsWith("image/")) return;
    const dataUrl = await ImageStorage.compressImage(file);
    setPrimaryOptions(
      primaryVariation.options.map((o) =>
        o.id === optionId ? { ...o, image: dataUrl } : o
      )
    );
  };

  return (
    <div className="space-y-4">
      <VariationCollapsibleSection
        title="Primary variation"
        defaultOpen
        description={
          <>
            For different designs or styles—name the group, add a photo per option, and set the
            exact price for that design (for example base ${basePrice.toFixed(2)} → this design $
            {(basePrice + 2).toFixed(2)}).
          </>
        }
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-foreground">
            Collection name
          </span>
          <input
            type="text"
            value={primaryVariation.collectionName}
            onChange={(e) =>
              onPrimaryChange({ ...primaryVariation, collectionName: e.target.value })
            }
            placeholder="e.g. Design, Style, Pattern"
            className="w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <div className="space-y-3">
          {primaryVariation.options.map((opt, index) => (
            <div
              key={opt.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-end"
            >
              <div className="flex shrink-0 gap-1 sm:flex-col">
                <button
                  type="button"
                  onClick={() =>
                    setPrimaryOptions(move(primaryVariation.options, index, -1))
                  }
                  disabled={index === 0}
                  className="rounded border border-border p-1.5 hover:bg-muted disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPrimaryOptions(move(primaryVariation.options, index, 1))
                  }
                  disabled={index === primaryVariation.options.length - 1}
                  className="rounded border border-border p-1.5 hover:bg-muted disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-1 flex-wrap items-end gap-3">
                <div className="w-full min-w-[120px] sm:w-28">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Photo
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => {
                      fileRefs.current[opt.id] = el;
                    }}
                    onChange={(e) => {
                      const f = e.target.files?.[0] ?? null;
                      void handlePrimaryImage(opt.id, f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRefs.current[opt.id]?.click()}
                    className={cn(
                      "flex h-24 w-full items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-background transition-colors hover:border-primary/60 sm:h-24 sm:w-24",
                      opt.image && "border-solid"
                    )}
                  >
                    {opt.image ? (
                      <img
                        src={opt.image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    )}
                  </button>
                </div>

                <label className="min-w-0 flex-1">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Option name
                  </span>
                  <input
                    type="text"
                    value={opt.label}
                    onChange={(e) =>
                      setPrimaryOptions(
                        primaryVariation.options.map((o) =>
                          o.id === opt.id ? { ...o, label: e.target.value } : o
                        )
                      )
                    }
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <label className="w-full sm:w-32">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">
                    Price (USD)
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={opt.price}
                    onChange={(e) =>
                      setPrimaryOptions(
                        primaryVariation.options.map((o) =>
                          o.id === opt.id
                            ? { ...o, price: parseFloat(e.target.value) || 0 }
                            : o
                        )
                      )
                    }
                    className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setPrimaryOptions(primaryVariation.options.filter((o) => o.id !== opt.id))
                  }
                  className="rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"
                  aria-label="Remove option"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setPrimaryOptions([
              ...primaryVariation.options,
              {
                id: newId(),
                label: `Option ${primaryVariation.options.length + 1}`,
                image: "",
                price: basePrice,
              },
            ])
          }
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" />
          Add design option
        </button>
      </VariationCollapsibleSection>

      <VariationCollapsibleSection
        title="Secondary variation"
        defaultOpen
        description="Usually colors—no extra price. Pick a color with the palette or swatches below."
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-foreground">
            Collection name
          </span>
          <input
            type="text"
            value={secondaryVariation.collectionName}
            onChange={(e) =>
              onSecondaryChange({ ...secondaryVariation, collectionName: e.target.value })
            }
            placeholder="e.g. Color"
            className="w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <p className="mb-2 text-xs font-medium text-muted-foreground">Quick swatches</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {HEX_PRESETS.map((hex) => (
            <button
              key={hex}
              type="button"
              title={hex}
              className="h-9 w-9 rounded-full border-2 border-border shadow-sm ring-offset-2 hover:ring-2 hover:ring-primary"
              style={{ backgroundColor: hex }}
              onClick={() => {
                const last = secondaryVariation.options[secondaryVariation.options.length - 1];
                if (last) {
                  setSecondaryOptions(
                    secondaryVariation.options.map((o) =>
                      o.id === last.id ? { ...o, hex } : o
                    )
                  );
                }
              }}
            />
          ))}
        </div>

        <div className="space-y-3">
          {secondaryVariation.options.map((opt, index) => (
            <div
              key={opt.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-center"
            >
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setSecondaryOptions(move(secondaryVariation.options, index, -1))
                  }
                  disabled={index === 0}
                  className="rounded border border-border p-1.5 hover:bg-muted disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSecondaryOptions(move(secondaryVariation.options, index, 1))
                  }
                  disabled={index === secondaryVariation.options.length - 1}
                  className="rounded border border-border p-1.5 hover:bg-muted disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <div
                className="h-12 w-12 shrink-0 rounded-full border-2 border-border shadow-inner"
                style={{ backgroundColor: opt.hex }}
              />

              <label className="flex flex-1 flex-col gap-1 sm:max-w-[100px]">
                <span className="text-xs text-muted-foreground">Color</span>
                <input
                  type="color"
                  value={opt.hex.length === 7 ? opt.hex : "#888888"}
                  onChange={(e) =>
                    setSecondaryOptions(
                      secondaryVariation.options.map((o) =>
                        o.id === opt.id ? { ...o, hex: e.target.value.toUpperCase() } : o
                      )
                    )
                  }
                  className="h-10 w-full cursor-pointer rounded border border-border bg-input"
                />
              </label>

              <label className="min-w-0 flex-1">
                <span className="mb-1 block text-xs text-muted-foreground">Name</span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) =>
                    setSecondaryOptions(
                      secondaryVariation.options.map((o) =>
                        o.id === opt.id ? { ...o, label: e.target.value } : o
                      )
                    )
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="w-full sm:w-28">
                <span className="mb-1 block text-xs text-muted-foreground">Hex</span>
                <input
                  type="text"
                  value={opt.hex}
                  onChange={(e) =>
                    setSecondaryOptions(
                      secondaryVariation.options.map((o) =>
                        o.id === opt.id
                          ? { ...o, hex: normalizeHex(e.target.value) }
                          : o
                      )
                    )
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 font-mono text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setSecondaryOptions(secondaryVariation.options.filter((o) => o.id !== opt.id))
                }
                className="shrink-0 rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setSecondaryOptions([
              ...secondaryVariation.options,
              {
                id: newId(),
                label: `Color ${secondaryVariation.options.length + 1}`,
                hex: "#888888",
              },
            ])
          }
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" />
          Add color
        </button>
      </VariationCollapsibleSection>

      <VariationCollapsibleSection
        title="Tertiary variation"
        defaultOpen
        description={
          <>
            Text-only options with an <strong>extra</strong> amount added on top (for example Size:
            Large +$5.00).
          </>
        }
      >
        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-foreground">
            Collection name
          </span>
          <input
            type="text"
            value={tertiaryVariation.collectionName}
            onChange={(e) =>
              onTertiaryChange({ ...tertiaryVariation, collectionName: e.target.value })
            }
            placeholder="e.g. Size, Add-ons"
            className="w-full rounded-lg border border-border bg-input px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>

        <div className="space-y-3">
          {tertiaryVariation.options.map((opt, index) => (
            <div
              key={opt.id}
              className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3 sm:flex-row sm:items-end"
            >
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() =>
                    setTertiaryOptions(move(tertiaryVariation.options, index, -1))
                  }
                  disabled={index === 0}
                  className="rounded border border-border p-1.5 hover:bg-muted disabled:opacity-40"
                  aria-label="Move up"
                >
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setTertiaryOptions(move(tertiaryVariation.options, index, 1))
                  }
                  disabled={index === tertiaryVariation.options.length - 1}
                  className="rounded border border-border p-1.5 hover:bg-muted disabled:opacity-40"
                  aria-label="Move down"
                >
                  <ChevronDown className="h-4 w-4" />
                </button>
              </div>

              <label className="min-w-0 flex-1">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Label
                </span>
                <input
                  type="text"
                  value={opt.label}
                  onChange={(e) =>
                    setTertiaryOptions(
                      tertiaryVariation.options.map((o) =>
                        o.id === opt.id ? { ...o, label: e.target.value } : o
                      )
                    )
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <label className="w-full sm:w-40">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">
                  Extra price (USD)
                </span>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={opt.additionalPrice}
                  onChange={(e) =>
                    setTertiaryOptions(
                      tertiaryVariation.options.map((o) =>
                        o.id === opt.id
                          ? {
                              ...o,
                              additionalPrice: parseFloat(e.target.value) || 0,
                            }
                          : o
                      )
                    )
                  }
                  className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </label>

              <button
                type="button"
                onClick={() =>
                  setTertiaryOptions(tertiaryVariation.options.filter((o) => o.id !== opt.id))
                }
                className="rounded-lg border border-destructive/30 p-2 text-destructive hover:bg-destructive/10"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() =>
            setTertiaryOptions([
              ...tertiaryVariation.options,
              {
                id: newId(),
                label: `Option ${tertiaryVariation.options.length + 1}`,
                additionalPrice: 0,
              },
            ])
          }
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2.5 text-sm font-semibold text-primary hover:bg-primary/10"
        >
          <Plus className="h-4 w-4" />
          Add option
        </button>
      </VariationCollapsibleSection>
    </div>
  );
}
