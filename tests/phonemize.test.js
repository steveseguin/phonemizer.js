import { beforeAll, describe, expect, test } from "vitest";

// Equivalent to running the following from the CLI:
// espeak-ng --pho -q --ipa=3 -v <language> <text>
const TESTS = {
  "en-gb": {
    "Hello, world!": ["həlˈə‍ʊ", "wˈɜːld"],
    "hi and bye": ["hˈa‍ɪ and bˈa‍ɪ"],
    "Hi. Bye.": ["hˈa‍ɪ", "bˈa‍ɪ"],
  },
  "en-us": {
    "Hello, world!": ["həlˈo‍ʊ", "wˈɜːld"],
    "hi and bye": ["hˈa‍ɪ ænd bˈa‍ɪ"],
    "Hi. Bye.": ["hˈa‍ɪ", "bˈa‍ɪ"],
  },
};

describe("phonemizer", () => {
  let phonemize, list_voices;
  beforeAll(async () => {
    // We need to dynamically import for the following reasons:
    // - The library is a CommonJS module
    // - Using the path allows us to live-reload without building
    ({ phonemize, list_voices } = await import("../src/phonemizer.js"));
  });

  describe("phonemize", () => {
    test("phonemizes input text", async () => {
      for (const [language, tests] of Object.entries(TESTS)) {
        for (const [text, expected] of Object.entries(tests)) {
          const phonemes = await phonemize(text, language);
          expect(phonemes).toEqual(
            // When checking, ignore zero-width joiners
            expected.map((x) => x.replaceAll("\u200d", "")),
          );
        }
      }
    });

    test("switches back to a supported language alias", async () => {
      await phonemize("hi and bye", "en-us");
      expect(await phonemize("hi and bye", "en-gb")).toEqual(["hˈaɪ and bˈaɪ"]);
      await phonemize("Hello world.", "en-gb-scotland");
      expect(await phonemize("Hello world.", "en-gb")).toEqual(["həlˈəʊ wˈɜːld"]);
    });

    test("unsupported language", async () => {
      await expect(phonemize("Hello, world!", "unsupported")).rejects.toThrow();
    });
  });

  describe("list_voices", () => {
    test("default", async () => {
      const voices = await list_voices();
      expect(voices).toBeDefined();
      expect(voices.length).toBeGreaterThan(0);
    });
    test("language-specified", async () => {
      const voices = await list_voices("en");
      expect(voices).toBeDefined();
      expect(voices.length).toBeGreaterThan(0);
    });
  });
});
