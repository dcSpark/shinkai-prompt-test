import { router } from "@scope/code-generation-api";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
console.log(String(router)[0]); // so that {router} get loaded

const body = {
  language: "python",
  prompt:
    "Get a youtube video complete transcript from a youtube video URL. I cannot provide any APIKEY.\n",
  feedback: "",
  tool_type: "shinkai",
  tool_headers: Deno.readTextFileSync(Deno.cwd() + "/tests/tool_headers.py"),
  x_shinkai_request_uuid: "replace-me",
  skipfeedback: "false",
};

Deno.test(
  "POST /generate should return 200 with valid parameters",
  async () => {
    const baseUrl = `http://localhost:8080`;
    const uuid =
      new Date().getTime().toString() +
      "-" +
      Math.random().toString(36).substring(2, 15);
    {
      let response1 = await fetch(`${baseUrl}/generate`, {
        method: "POST",
        headers: {
          accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...body,
          x_shinkai_request_uuid: "test-" + uuid,
        }),
      });
      assertEquals(response1.status, 200, "response1.status");

      let reader1 = response1.body?.getReader();
      let decoder1 = new TextDecoder();
      let part1 = "";
      while (true) {
        const data = await reader1?.read();
        const partialResult = decoder1.decode(data?.value);
        console.log(partialResult);
        part1 += partialResult;
        if (data?.done) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      reader1 = undefined as any;
      decoder1 = undefined as any;
      response1 = undefined as any;
      assertEquals(
        part1.includes("event: request-feedback"),
        true,
        "part1.includes(request-feedback)"
      );
    }

    let code = "";
    {
      let response2 = await fetch(`${baseUrl}/generate`, {
        method: "POST",
        headers: {
          accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "python",
          prompt: "ok",
          tool_type: "shinkai",
          skipfeedback: "false",
          x_shinkai_request_uuid: "test-" + uuid,
          feedback: "",
        }),
      });

      let reader2 = response2.body?.getReader();
      let decoder2 = new TextDecoder();
      let part2 = "";
      while (true) {
        const data = await reader2?.read();
        const partialResult = decoder2.decode(data?.value);
        console.log(partialResult);
        part2 += partialResult;
        if (data?.done) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      reader2 = undefined as any;
      decoder2 = undefined as any;
      response2 = undefined as any;
      assertEquals(part2.includes("event: code"), true, "part2.includes(code)");

      code = part2
        .split("event: code")[1]
        .split("\n")[1]
        .replace(/^data: /, "");
      assertEquals(
        code.includes("async def run"),
        true,
        "code.includes(async def run)"
      );
    }

    let metadata = "";
    {
      let response3 = await fetch(`${baseUrl}/metadata`, {
        method: "POST",
        headers: {
          accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "typescript",
          code,
          x_shinkai_request_uuid: "test-" + uuid,
        }),
      });

      let reader3 = response3.body?.getReader();
      let decoder3 = new TextDecoder();
      let part3 = "";
      while (true) {
        const data = await reader3?.read();
        const partialResult = decoder3.decode(data?.value);
        console.log(partialResult);
        part3 += partialResult;
        if (data?.done) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      reader3 = undefined as any;
      decoder3 = undefined as any;
      response3 = undefined as any;
      assertEquals(
        part3.includes("event: metadata"),
        true,
        "part3.includes(metadata)"
      );
      metadata = part3
        .split("event: metadata")[1]
        .split("\n")[1]
        .replace(/^data: /, "");
    }

    const jCode: { code: string } = JSON.parse(code);
    const jMetadata: { metadata: string } = JSON.parse(metadata);
    Deno.writeTextFileSync(
      Deno.cwd() + "/test-results/" + "youtube.py",
      jCode.code
    );
    Deno.writeTextFileSync(
      Deno.cwd() + "/test-results/" + "youtube.metadata.json",
      jMetadata.metadata
    );
  }
);
