import { describe, it, expect } from "vitest";
import { cn } from "./utils";
import { formatPrice } from "../utils/currency";

describe("formatPrice", () => {
  it.each([
    [0, "₱0.00"],
    [5, "₱5.00"],
    [12450, "₱12,450.00"],
    [12.345, "₱12.35"],
    [-10.5, "-₱10.50"],
  ])("formats %s as PHP", (amount, expected) => {
    expect(formatPrice(amount)).toBe(expected);
  });
});

describe("cn function", () => {
  it("should merge classes correctly", () => {
    expect(cn("text-red-500", "bg-blue-500")).toBe("text-red-500 bg-blue-500");
  });

  it("should handle conditional classes", () => {
    const isActive = true;
    expect(cn("base-class", isActive && "active-class")).toBe(
      "base-class active-class",
    );
  });

  it("should handle false and null conditions", () => {
    const isActive = false;
    expect(cn("base-class", isActive && "active-class", null)).toBe(
      "base-class",
    );
  });

  it("should merge tailwind classes properly", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("should work with object notation", () => {
    expect(cn("base", { conditional: true, "not-included": false })).toBe(
      "base conditional",
    );
  });
});
