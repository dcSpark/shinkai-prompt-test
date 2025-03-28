import { router } from "@scope/code-generation-api";
import { ShinkaiAPI } from "@scope/shinkai-api";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
console.log(String(router)[0]); // so that {router} get loaded

const body = {
  language: "typescript",
  prompt:
    "can you generate a tool that scan for jupiter (solana exchange) stablecoin pools and analyzes if there are arbitrage opportunities by swapping assets between them (you need to end up with the same starting asset but with a higher quantity).  very important: you need to use some API or something to get the list of available pools and then extracts the ones related to stablecoins  docs: https://station.jup.ag/docs/",
  feedback: "",
  tool_type: "shinkai",
  tool_headers: Deno.readTextFileSync(Deno.cwd() + "/tests/tool_headers.ts"),
  x_shinkai_request_uuid: "replace-me",
  skipfeedback: "true",
};

Deno.test(
  "POST /generate should return 200 with valid parameters",
  async () => {
    let code = "";
    let tests = "";
    let metadata = "";
    assertEquals(
      Deno.env.get("GENERATE_TESTS"),
      "true",
      "Set .env GENERATE_TESTS=true"
    );

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
      // assertEquals(part1.includes('event: request-feedback'), true, 'part1.includes(request-feedback)');
      // }

      assertEquals(part1.includes("event: code"), true, "part1.includes(code)");

      code = part1
        .split("event: code")[1]
        .split("\n")[1]
        .replace(/^data: /, "");
      assertEquals(
        code.includes("export async function run"),
        true,
        "code.includes(export async function run)"
      );

      tests = part1
        .split("event: tests")[1]
        .split("\n")[1]
        .replace(/^data: /, "");
      assertEquals(tests.includes('"input"'), true, 'tests.includes("input")');
    }

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
      assertEquals(metadata.includes("name"), true, "metadata.includes(name)");
    }

    // Now we have tests and code.
    const jCode: { code: string } = JSON.parse(code);
    const jTest: {
      tests: {
        input: Record<string, any>;
        config: Record<string, any>;
        output: Record<string, any>;
      }[];
    } = JSON.parse(tests);
    const api = new ShinkaiAPI();
    const jMetadata: { metadata: string } = JSON.parse(metadata);
    const jjMetadata: Record<string, any> = JSON.parse(jMetadata.metadata);
    for (const [index, test] of jTest.tests.entries()) {
      if (index > 0) break;
      // console.log('[Running Test] ' + (index + 1) + ' of ' + jTest.tests.length);
      // const result = await api.executeCode(jCode.code, jjMetadata.tools, test.input, test.config, 'gpt-4o-mini');
      // console.log(test.output, result);
      // assertObjectMatch(result, test.output);
    }

    console.log(
      "Done logs @\n",
      `./cache/.execution/test--${uuid}/src/tool.ts \n`,
      `./cache/.execution/test-${uuid}/step_0.c.metadata.json \n`
    );

    Deno.writeTextFileSync(
      Deno.cwd() + "/test-results/" + "jupiter.ts",
      jCode.code
    );
    Deno.writeTextFileSync(
      Deno.cwd() + "/test-results/" + "jupiter.metadata.json",
      jMetadata.metadata
    );
  }
);
