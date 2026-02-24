import { describe, it, expect } from "vitest";
import en from "../../locales/en.json";
import zh from "../../locales/zh.json";

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return flattenKeys(value as Record<string, unknown>, path);
    }
    return [path];
  });
}

describe("i18n locale parity", () => {
  const enKeys = flattenKeys(en).sort();
  const zhKeys = flattenKeys(zh).sort();

  it("en and zh have the same top-level sections", () => {
    expect(Object.keys(en).sort()).toEqual(Object.keys(zh).sort());
  });

  it("en and zh have the same set of keys", () => {
    const missingInZh = enKeys.filter((k) => !zhKeys.includes(k));
    const missingInEn = zhKeys.filter((k) => !enKeys.includes(k));

    expect(missingInZh).toEqual([]);
    expect(missingInEn).toEqual([]);
  });

  it("no empty translation values", () => {
    for (const key of enKeys) {
      const value = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], en);
      expect(value, `en.${key} is empty`).toBeTruthy();
    }
    for (const key of zhKeys) {
      const value = key.split(".").reduce<unknown>((o, k) => (o as Record<string, unknown>)?.[k], zh);
      expect(value, `zh.${key} is empty`).toBeTruthy();
    }
  });
});
