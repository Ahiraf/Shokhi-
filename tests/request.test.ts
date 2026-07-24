import { describe, expect, it } from "vitest";
import {
  MAX_HISTORY_ITEMS,
  MAX_MESSAGE_LENGTH,
  readHistory,
  readProfile,
  readText,
} from "../lib/server/request";

describe("API request guards", () => {
  it("rejects empty and oversized required text", () => {
    expect(readText({ message: "   " }, "message", MAX_MESSAGE_LENGTH, true)).toBeNull();
    expect(readText({ message: "x".repeat(MAX_MESSAGE_LENGTH + 1) }, "message", MAX_MESSAGE_LENGTH, true)).toBeNull();
  });

  it("keeps only bounded history strings", () => {
    const history = readHistory([
      ...Array.from({ length: MAX_HISTORY_ITEMS + 2 }, (_, i) => `message ${i}`),
      { invalid: true },
    ]);
    expect(history).toHaveLength(MAX_HISTORY_ITEMS);
    expect(history[0]).toBe("message 2");
  });

  it("keeps primitive profile values and ignores nested objects", () => {
    expect(readProfile({ age: 24, cycles_irregular: true, nested: {} })).toEqual({
      age: 24,
      cycles_irregular: true,
    });
  });
});
