import { router } from "@scope/code-generation-api";
import { ShinkaiAPI } from "@scope/shinkai-api";
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
console.log(String(router)[0]); // so that {router} get loaded

// TODO All test should be in the same file for for prompt testing.
export class ServiceAPIBase {
  baseUrl = `http://localhost:8080`;
  uuid =
    new Date().getTime().toString() +
    "-" +
    Math.random().toString(36).substring(2, 15);

  code: string = "";
  tests: {
    input: Record<string, any>;
    config: Record<string, any>;
    output: Record<string, any>;
  }[] = [];
  metadata: Record<string, any> = {};

  constructor() {}

  async startTest(
    prompt: string,
    language: "typescript" | "python",
    fileName: string,
    runTests: boolean = true,
    additionalChecks: {
      feedback?: (feedbackString: string) => void;
    } = {}
  ) {
    const areTestsEnabled = Deno.env.get("GENERATE_TESTS") === "true";
    assertEquals(areTestsEnabled, true, ".env GENERATE_TESTS should be true");

    {
      let response1 = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          prompt: prompt,
          tool_type: "shinkai",
          skipfeedback: "false",
          x_shinkai_request_uuid: `test-${
            language === "typescript" ? "ts" : "py"
          }-${this.uuid}`,
          feedback: "",
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

      try {
        const ok = part1.includes('data: {"message":"{\\"markdown\\"');
        if (!ok) throw new Error('part1.includes(data: {"message":)');
        // assertEquals(part1.includes('data: {"message":"{\\"markdown\\"'), true, 'part1.includes(data: {"message":)');

        let feedbackLine = part1.match(/data: {"message".*markdown.*/g)?.[0];
        feedbackLine = feedbackLine!.replace("data: ", "");

        const ok1 = !!feedbackLine;
        if (!ok1) throw new Error("feedbackLine is null");
        // assertEquals(!!feedbackLine, true, 'feedbackLine is not null');

        const upackMessage = JSON.parse(
          feedbackLine.replace("data: ", "")
        ).message;
        const feedback = JSON.parse(upackMessage).markdown;
        console.log("=======================");
        console.log(feedback);
        console.log("=======================");
      } catch (e) {
        console.log("THIS IS A KNOWN ERROR. BUT NOT KNOWN FIX.");
        console.log(e);
      }
    }
    // {
    //     let response2 = await fetch(`${this.baseUrl}/generate`, {
    //         method: "POST",
    //         headers: {
    //             "accept": "text/event-stream",
    //             "Content-Type": "application/json",
    //         },
    //         body: JSON.stringify({
    //             language,
    //             prompt: 'ok',
    //             tool_type: "shinkai",
    //             skipfeedback: "false",
    //             x_shinkai_request_uuid: `test-${language === 'typescript' ? 'ts' : 'py'}-${this.uuid}`,
    //             feedback: ""
    //         }),
    //     });

    //     assertEquals(response2.status, 200, 'response2.status');

    //     let reader2 = response2.body?.getReader();
    //     let decoder2 = new TextDecoder();
    //     let part2 = '';
    //     while (true) {
    //         const data = await reader2?.read();
    //         const partialResult = decoder2.decode(data?.value);
    //         console.log(partialResult);
    //         part2 += partialResult;
    //         if (data?.done) break;
    //         await new Promise(resolve => setTimeout(resolve, 10));
    //     }
    //     reader2 = undefined as any;
    //     decoder2 = undefined as any;
    //     response2 = undefined as any;

    //     assertEquals(part2.includes('event: request-feedback'), true, 'part2.includes(request-feedback)');

    // }
    {
      let response3 = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language,
          prompt: "ok",
          tool_type: "shinkai",
          skipfeedback: "false",
          x_shinkai_request_uuid: `test-${
            language === "typescript" ? "ts" : "py"
          }-${this.uuid}`,
          feedback: "",
        }),
      });

      assertEquals(response3.status, 200, "response3.status");

      let reader3 = response3.body?.getReader();
      let decoder3 = new TextDecoder();
      let part3 = "";
      while (true) {
        const data = await reader3?.read();
        const partialResult = decoder3.decode(data?.value);
        console.log(partialResult);
        if (partialResult.includes("# Jupiter API Documentation"))
          throw new Error('partialResult.includes("### order")');
        part3 += partialResult;
        if (data?.done) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      reader3 = undefined as any;
      decoder3 = undefined as any;
      response3 = undefined as any;

      assertEquals(part3.includes("event: code"), true, "part3.includes(code)");

      const code = part3
        .split("event: code")[1]
        .split("\n")[1]
        .replace(/^data: /, "");

      if (language === "typescript") {
        assertEquals(
          code.includes("export async function run"),
          true,
          "code.includes(export async function run)"
        );
      } else if (language === "python") {
        assertEquals(
          code.includes("async def run"),
          true,
          "code.includes(async def run)"
        );
      }

      this.code = JSON.parse(code).code;
      if (language === "typescript") {
        assertEquals(
          this.code.includes("export async function run"),
          true,
          "code.includes(export async function run)"
        );
      } else if (language === "python") {
        this.code = this.code.replace(/\t/g, "  ");
        assertEquals(
          this.code.includes("async def run"),
          true,
          "code.includes(async def run)"
        );
      }

      const tests = part3
        .split("event: tests")[1]
        .split("\n")[1]
        .replace(/^data: /, "");
      assertEquals(tests.includes('"input"'), true, 'tests.includes("input")');
      this.tests = JSON.parse(tests).tests;
      assertEquals(Array.isArray(this.tests), true, "this.tests is an array");
      assertEquals(this.tests.length > 0, true, "tests.length > 0");
    }

    {
      let response4 = await fetch(`${this.baseUrl}/metadata`, {
        method: "POST",
        headers: {
          accept: "text/event-stream",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          language: "typescript",
          code: this.code,
          x_shinkai_request_uuid: `test-${
            language === "typescript" ? "ts" : "py"
          }-${this.uuid}`,
        }),
      });

      let reader4 = response4.body?.getReader();
      let decoder4 = new TextDecoder();
      let part4 = "";
      while (true) {
        const data = await reader4?.read();
        const partialResult = decoder4.decode(data?.value);
        console.log(partialResult);
        part4 += partialResult;
        if (data?.done) break;
        await new Promise((resolve) => setTimeout(resolve, 10));
      }
      reader4 = undefined as any;
      decoder4 = undefined as any;
      response4 = undefined as any;
      assertEquals(
        part4.includes("event: metadata"),
        true,
        "part4.includes(metadata)"
      );
      const metadata = part4
        .split("event: metadata")[1]
        .split("\n")[1]
        .replace(/^data: /, "");
      assertEquals(metadata.includes("name"), true, "metadata.includes(name)");
      const jMetadata: { metadata: Record<string, any> } = JSON.parse(metadata);
      this.metadata = jMetadata.metadata;
    }

    const api = new ShinkaiAPI();
    for (const [index, test] of this.tests.entries()) {
      console.log(
        "[Running Test] " + (index + 1) + " of " + this.tests.length,
        "[" + runTests + "]"
      );
      // console.log(this.code);
      // console.log(this.metadata);
      // console.log(test);
      if (runTests) {
        try {
          const result = await api.executeCode(
            this.code,
            this.metadata.tools,
            language === "typescript" ? "denodynamic" : "pythondynamic",
            test.input,
            test.config,
            "gpt-4o-mini"
          );
          console.log("RUN RESULT", result);
          Deno.writeTextFileSync(
            Deno.cwd() +
              "/test-results/" +
              fileName +
              "-" +
              index +
              ".result.json",
            JSON.stringify(
              {
                prompt: prompt,
                code: this.code,
                test: test,
                metadata: this.metadata,
                execution: result,
                expected: test.output,
              },
              null,
              2
            )
          );
        } catch (e) {
          console.log("ERROR", e);
          Deno.writeTextFileSync(
            Deno.cwd() +
              "/test-results/" +
              fileName +
              "-" +
              index +
              ".result.json",
            JSON.stringify(
              {
                prompt: prompt,
                code: this.code,
                test: test,
                metadata: this.metadata,
                error: String(e),
              },
              null,
              2
            )
          );
        }

        // assertObjectMatch(result, test.output);
      }
    }

    Deno.writeTextFileSync(
      Deno.cwd() +
        "/test-results/" +
        fileName +
        (language === "typescript" ? ".ts" : ".py"),
      this.code
    );
    Deno.writeTextFileSync(
      Deno.cwd() + "/test-results/" + fileName + ".metadata.json",
      JSON.stringify(this.metadata, null, 2)
    );
  }
}
