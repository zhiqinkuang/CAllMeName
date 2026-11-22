import { describe, expect, it } from "vitest";
import {
  FREE_NAMES_SESSION_KEY,
  readFreeNamesSession,
  writeFreeNamesSession,
} from "@/lib/free-session";
import type { FreeCard } from "@/lib/api/types";

const cards: FreeCard[] = [
  { hanzi: "林安然", pinyin: "Lín Ānrán" },
  { hanzi: "苏景行", pinyin: "Sū Jǐngxíng" },
  { hanzi: "沈清越", pinyin: "Shěn Qīngyuè" },
];

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const data = { ...initial };
  return {
    get length() {
      return Object.keys(data).length;
    },
    clear() {
      for (const k of Object.keys(data)) delete data[k];
    },
    getItem(key: string) {
      return key in data ? data[key] : null;
    },
    key(index: number) {
      return Object.keys(data)[index] ?? null;
    },
    removeItem(key: string) {
      delete data[key];
    },
    setItem(key: string, value: string) {
      data[key] = value;
    },
  };
}

describe("free names session", () => {
  it("round-trips a valid three-card set", () => {
    const storage = memoryStorage();
    writeFreeNamesSession({ cards }, storage);
    expect(storage.getItem(FREE_NAMES_SESSION_KEY)).toBeTruthy();
    expect(readFreeNamesSession(storage)).toEqual({ cards });
  });

  it("returns null when storage is empty or missing", () => {
    expect(readFreeNamesSession(memoryStorage())).toBeNull();
    expect(readFreeNamesSession(null)).toBeNull();
    expect(readFreeNamesSession(undefined)).toBeNull();
  });

  it("ignores malformed or incomplete payloads", () => {
    expect(
      readFreeNamesSession(
        memoryStorage({ [FREE_NAMES_SESSION_KEY]: "not-json" }),
      ),
    ).toBeNull();
    expect(
      readFreeNamesSession(
        memoryStorage({
          [FREE_NAMES_SESSION_KEY]: JSON.stringify({
            cards: [{ hanzi: "林安然", pinyin: "Lín Ānrán" }],
          }),
        }),
      ),
    ).toBeNull();
  });
});
