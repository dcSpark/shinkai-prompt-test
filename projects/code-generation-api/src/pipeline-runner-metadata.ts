import "jsr:@std/dotenv/load";
import { getModelSmall } from "../../code-generation/src/Engines/index.ts";
import { emptyRequirement } from "../../code-generation/src/ShinkaiPipeline/Requirement.ts";
import { ShinkaiPipelineMetadata } from "../../code-generation/src/ShinkaiPipeline/ShinkaiPipelineMeta.ts";
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

const language = argMap["language"] as Language;
const requestUUID = argMap["request-uuid"];
let code = argMap["code"] || "";
code = code.replaceAll(delimiter, "");
code = decodeURIComponent(code);

if (!language || !requestUUID || !code) {
  console.log(
    JSON.stringify({
      language,
      requestUUID,
      code: (code || "").substring(0, 100),
    })
  );
  console.log(
    "Usage: deno run pipeline-runner.ts language=<language> request-uuid=<request-uuid> prompt=<prompt> feedback=<feedback> tool_type=<tool_type>"
  );
  Deno.exit(1);
}

// Run the pipeline and stream output
const runPipeline = async () => {
  try {
    const llmModel = getModelSmall();

    console.log("EVENT: start");
    const test = emptyRequirement();
    test.code = requestUUID;
    const pipeline = new ShinkaiPipelineMetadata(
      code,
      language,
      test,
      llmModel,
      true
    );

    // Add event listeners to the pipeline if ShinkaiPipeline supports them
    // If not, you might need to modify ShinkaiPipeline to emit progress events

    const metadata = await pipeline.run();
    console.log("EVENT: metadata\n" + JSON.stringify(metadata));
    // console.log('EVENT: complete');
  } catch (error: unknown) {
    console.error(`EVENT: error\n${(error as Error).message}`);
  }
};

// Execute the pipeline
runPipeline();
