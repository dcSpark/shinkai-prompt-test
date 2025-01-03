export type TestData = {
  id?: number;
  code: string;
  prompt: string;
  prompt_type: string;
  tools: string[];
  inputs: Record<string, unknown>;
  config: Record<string, unknown>;
  check?: (output: string) => number; // between 0 and 1
  save?: boolean;
  supportFiles?: { fileName: string; path: string }[];
  limited_language?: Language;
  skip?: string;
};

export type Language = "python" | "typescript";
