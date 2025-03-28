import "jsr:@std/dotenv/load";
import {
  getModelLarge,
  getModelSmall,
} from "../../code-generation/src/Engines/index.ts";
import { Requirement } from "../../code-generation/src/ShinkaiPipeline/Requirement.ts";
import { ShinkaiPipeline } from "../../code-generation/src/ShinkaiPipeline/ShinkaiPipeline.ts";
import { Language } from "../../code-generation/src/ShinkaiPipeline/types.ts";

// Parse command line arguments in the format key=value
const args = Deno.args;
const argMap: Record<string, string> = {};

args.forEach((arg) => {
  const [key, value] = arg.split("=");
  if (key && value !== undefined) {
    argMap[key] = value;
  }
});
const delimiter = `"#|#"`;

const skipFeedback = argMap["skipfeedback"] === "true";
const language = argMap["language"] as Language;
const requestUUID = argMap["request-uuid"];
let prompt = argMap["prompt"] || "";
prompt = prompt.replaceAll(delimiter, "");
prompt = decodeURIComponent(prompt);
// prompt = prompt.match(/^#|#(.*)#|#$/)?.[1] || '';
let feedback = argMap["feedback"] || ""; // Default to empty string if not provided
feedback = feedback.replaceAll(delimiter, "");
feedback = decodeURIComponent(feedback);
// feedback = feedback.match(/^#|#(.*)#|#$/)?.[1] || '';
const toolType = (argMap["tool_type"] as "shinkai" | "mcp") || "shinkai"; // Default to 'shinkai' if not provided

if (!language || !requestUUID || !prompt) {
  console.log(
    JSON.stringify({ language, requestUUID, prompt, feedback, toolType })
  );
  console.log(
    "Usage: deno run pipeline-runner-metadata.ts language=<language> request-uuid=<request-uuid> prompt=<prompt> feedback=<feedback> tool_type=<tool_type>"
  );
  Deno.exit(1);
}

// Run the pipeline and stream output
const runPipeline = async () => {
  try {
    const codeTest: Requirement = new Requirement({
      code: requestUUID,
      prompt: prompt,
      feedback: feedback,
      prompt_type: "",
      tools: [],
      input: {},
      config: {},
    });

    const llmModel = getModelSmall();
    const advancedLlmModel = getModelLarge();

    console.log("EVENT: start");
    const pipeline = new ShinkaiPipeline(
      skipFeedback,
      language,
      codeTest,
      llmModel,
      advancedLlmModel,
      true,
      toolType
    );

    // Add event listeners to the pipeline if ShinkaiPipeline supports them
    // If not, you might need to modify ShinkaiPipeline to emit progress events

    await pipeline.run();

    // console.log('EVENT: complete');
  } catch (error: unknown) {
    console.error(`EVENT: error\n${(error as Error).message}`);
  }
};

// Execute the pipeline
runPipeline();
