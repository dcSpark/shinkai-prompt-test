import "jsr:@std/dotenv/load";
import { BaseEngine, getDeepSeekR132B, getLlama318bInstruct, getOpenAIO4Mini, Payload } from "./llm-engines.ts";
import { getFullHeadersAndTools } from "./support.ts";
import { getTests, Test } from "./Test.ts";
import { Language } from "./types.ts";
import { TestFileManager } from "./TestFileManager.ts";
import { DependencyDoc } from "./DependencyDoc.ts";
import { CheckCodeResponse, ShinkaiAPI } from "./ShinkaiAPI.ts";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { LLMFormatter } from "./LLMFormatter.ts";


const flags = parseArgs(Deno.args, {
    boolean: ["keepcache", "force-docs"],
});
const KEEP_CACHE = flags.keepcache || flags["force-docs"];
const FORCE_DOCS_GENERATION = flags["force-docs"];

class ShinkaiPipeline {
    // Setup in constructor
    private fileManager: TestFileManager;
    private llmFormatter: LLMFormatter;

    // State machine step
    private step: number = 0;

    // Final "Requirements" with feedback
    private feedback: string = '';

    // Used to pass the prompt history from requirements to feedback
    private promptHistory: Payload | undefined;

    // External libraries docs
    private docs: Record<string, string> = {};

    // Internal tools
    private internalToolsJSON: string[] = [];

    // Generated code
    private code: string = '';
    private metadata: string = '';

    // Shinkai prompts
    private shinkaiPrompts: any;;

    // Available tools
    private availableTools: string[] = [];

    // Start time
    private startTime: number;

    constructor(private language: Language, private test: Test, private llmModel: BaseEngine) {
        this.fileManager = new TestFileManager(language, test, llmModel);
        this.llmFormatter = new LLMFormatter();
        this.startTime = Date.now();
    }

    private async initialize() {
        const completeShinkaiPrompts = await getFullHeadersAndTools();
        this.shinkaiPrompts = completeShinkaiPrompts[this.language];
        this.availableTools = completeShinkaiPrompts.availableTools;
        await this.fileManager.log(`=========================================================`, true);
        await this.fileManager.log(`🔨 Running test #[${this.test.id}] ${this.test.code} @ ${this.language} w/ ${this.llmModel.name}`, true);
    }

    private async processRequirementsAndFeedback() {
        // Check if output file exists
        if (await this.fileManager.exists(this.step, 'c', 'requirements.md') &&
            await this.fileManager.exists(this.step, 'x', 'promptHistory.json')
        ) {
            console.log(`<SKIPPING> Step ${this.step} - Requirements & Feedback already exists`);
            const existingFile = await this.fileManager.load(this.step, 'c', 'requirements.md');
            this.feedback = existingFile;
            const promptHistory = await this.fileManager.load(this.step, 'x', 'promptHistory.json');
            this.promptHistory = JSON.parse(promptHistory);
            this.step++;
            return;
        }

        const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {
            this.fileManager.log(`[Step ${this.step}] System Requirements & Feedback Prompt`, true);
            const headers: string = (this.shinkaiPrompts.headers as any)['shinkai-local-tools'] || (this.shinkaiPrompts.headers as any)['shinkai_local_tools'];
            const prompt = (await Deno.readTextFile(Deno.cwd() + '/prompts/requirements-feedback.md')).replace(
                '<input_command>\n\n</input_command>',
                `<input_command>\n${this.test.prompt}\n\n</input_command>`
            )
                .replace(/\{LANGUAGE\}/g, this.language)
                .replace(/\{RUNTIME\}/g, this.language === 'typescript' ? 'Deno' : 'Python')
                .replace("<internal-libraries>\n\n</internal-libraries>", `<internal-libraries>\n${headers}\n</internal-libraries>`)
            await this.fileManager.save(this.step, 'a', prompt, 'requirements-prompt.md');
            const llmResponse = await this.llmModel.run(prompt, this.fileManager, undefined);
            await this.fileManager.save(this.step, 'x', JSON.stringify(llmResponse.metadata), 'promptHistory.json');
            this.promptHistory = llmResponse.metadata;
            await this.fileManager.save(this.step, 'b', llmResponse.message, 'raw-requirements-response.md');
            return llmResponse.message;
        }, 'markdown', {
            regex: [
                new RegExp("# Requirements"),
                new RegExp("# Standard Libraries"),
                new RegExp("# Internal Libraries"),
                new RegExp("# External Libraries"),
                new RegExp("# Example Inputs and Outputs"),
            ]
        });
        this.feedback = parsedLLMResponse;
        await this.fileManager.save(this.step, 'c', this.feedback, 'requirements.md');
        this.step++;
    }

    private async processUserFeedback() {
        // Check if output file exists
        if (await this.fileManager.exists(this.step, 'c', 'feedback.md')) {
            console.log(`<SKIPPING> Step ${this.step} - User Requirements & Feedback already exists`);
            const existingFile = await this.fileManager.load(this.step, 'c', 'feedback.md');
            this.feedback = existingFile;
            this.step++;
            return;
        }

        const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {

            this.fileManager.log(`[Step ${this.step}] User Requirements & Feedback Prompt`, true);
            let user_feedback = '';
            if ((this.test as any).feedback) {
                user_feedback = (this.test as any).feedback;
            }
            if (this.language === 'typescript' && (this.test as any).feedback_ts) {
                user_feedback = (this.test as any).feedback_ts;
            } if (this.language === 'python' && (this.test as any).feedback_python) {
                user_feedback = (this.test as any).feedback_python;
            }
            if (!user_feedback) user_feedback = 'Ok';

            const prompt = (await Deno.readTextFile(Deno.cwd() + '/prompts/feedback.md')).replace(
                '<input_command>\n\n</input_command>',
                `<input_command>\n${user_feedback}\n\n</input_command>`
            );
            await this.fileManager.save(this.step, 'a', prompt, 'feedback-prompt.md');
            const llmResponse = await this.llmModel.run(prompt, this.fileManager, this.promptHistory);
            await this.fileManager.save(this.step, 'b', llmResponse.message, 'raw-feedback-response.md');
            return llmResponse.message;
        }, 'markdown', {
            regex: [
                new RegExp("# Requirements"),
                new RegExp("# Standard Libraries"),
                new RegExp("# Internal Libraries"),
                new RegExp("# External Libraries"),
                new RegExp("# Example Inputs and Outputs"),
            ]
        });

        this.feedback = parsedLLMResponse;
        await this.fileManager.save(this.step, 'c', this.feedback, 'feedback.md');
        this.step++;
    }

    private async processLibrarySearch() {

        let parsedLLMResponse = ''
        if (await this.fileManager.exists(this.step, 'c', 'library.json')) {
            console.log(`<SKIPPING> Step ${this.step} - Library Search already exists`);
            const existingLibraryJson = await this.fileManager.load(this.step, 'c', 'library.json');
            parsedLLMResponse = existingLibraryJson;
            // Load existing dependency docs
        } else {
            parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {
                this.fileManager.log(`[Step ${this.step}] Library Search Prompt`, true);
                const prompt = (await Deno.readTextFile(Deno.cwd() + '/prompts/library.md')).replace(
                    '<input_command>\n\n</input_command>',
                    `<input_command>\n${this.feedback}\n\n</input_command>`
                );
                await this.fileManager.save(this.step, 'a', prompt, 'library-prompt.md');
                const llmResponse = await this.llmModel.run(prompt, this.fileManager, undefined);
                const promptResponse = llmResponse.message;
                await this.fileManager.save(this.step, 'b', promptResponse, 'raw-library-response.md');
                return promptResponse;
            }, 'json', {
                isJSONArray: true
            });

            await this.fileManager.save(this.step, 'c', parsedLLMResponse, 'library.json');
        }


        const libQueries = JSON.parse(parsedLLMResponse) as string[];
        const codes = 'defghijklmnopqrstuvwxyz';
        const docManager = new DependencyDoc(this.llmModel, this.fileManager);
        for (const [index, library] of libQueries.entries()) {
            const safeLibraryName = library.replace(/[^a-zA-Z0-9]/g, '_').toLocaleLowerCase();
            if (!FORCE_DOCS_GENERATION && await this.fileManager.exists(this.step, codes[index % codes.length], safeLibraryName + '-dependency-doc.md')) {
                console.log(`<SKIPPING> Step ${this.step} - Dependency Doc already exists`);
                const existingFile = await this.fileManager.load(this.step, codes[index % codes.length], safeLibraryName + '-dependency-doc.md');
                this.docs[library] = existingFile;
            } else {
                this.fileManager.log(`[Step ${this.step}] Dependency Doc Prompt : ${library}`, true);
                const dependencyDoc = await docManager.getDependencyDocumentation(library, this.language);
                this.docs[library] = dependencyDoc;
                await this.fileManager.save(this.step, codes[index % codes.length], dependencyDoc, safeLibraryName + '-dependency-doc.md');
            }
        }

        this.step++;
    }

    private async processInternalTools() {
        // Check if output file exists
        if (await this.fileManager.exists(this.step, 'c', 'internal-tools.json')) {
            console.log(`<SKIPPING> Step ${this.step} - Internal Tools already exists`);
            const existingFile = await this.fileManager.load(this.step, 'c', 'internal-tools.json');
            this.internalToolsJSON = JSON.parse(existingFile) as string[];
            this.step++;
            return;
        }

        const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {
            this.fileManager.log(`[Step ${this.step}] Internal Libraries Prompt`, true);
            const prompt = (await Deno.readTextFile(Deno.cwd() + '/prompts/internal-tools.md')).replace(
                '<input_command>\n\n</input_command>',
                `<input_command>\n${this.feedback}\n\n</input_command>`
            ).replace('<tool_router_key>\n\n</tool_router_key>', `<tool_router_key>\n${this.availableTools.join('\n')}\n</tool_router_key>`)
            await this.fileManager.save(this.step, 'a', prompt, 'internal-tools-prompt.md');
            const llmResponse = await this.llmModel.run(prompt, this.fileManager, undefined);
            await this.fileManager.save(this.step, 'b', llmResponse.message, 'raw-internal-tools-response.md');
            return llmResponse.message;
        }, 'json', {
            regex: [
                new RegExp(".+?:::.+?:::.+?"),
            ],
            isJSONArray: true
        });

        await this.fileManager.save(this.step, 'c', parsedLLMResponse, 'internal-tools.json');
        this.internalToolsJSON = JSON.parse(parsedLLMResponse) as string[];
        this.step++;
    }

    private async generateCode() {
        // Check if output file exists
        if (this.language === 'typescript' && await this.fileManager.exists(this.step, 'c', 'tool.ts')) {
            console.log(`<SKIPPING> Step ${this.step} - Tool code already exists`);
            const existingFile = await this.fileManager.load(this.step, 'c', 'tool.ts');
            this.code = existingFile;
            this.step++;
            return;
        }
        if (this.language === 'python' && await this.fileManager.exists(this.step, 'c', 'tool.py')) {
            console.log(`<SKIPPING> Step ${this.step} - Tool code already exists`);
            const existingFile = await this.fileManager.load(this.step, 'c', 'tool.py');
            this.code = existingFile;
            this.step++;
            return;
        }

        const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {

            this.fileManager.log(`[Step ${this.step}] Generate the tool code`, true);
            let toolPrompt = '';
            if (this.language === 'typescript') {
                toolPrompt = (await new ShinkaiAPI().getTypescriptToolImplementationPrompt(this.internalToolsJSON)).codePrompt;
            } else {
                toolPrompt = (await new ShinkaiAPI().getPythonToolImplementationPrompt(this.internalToolsJSON)).codePrompt;
            }

            const toolCode_1 = toolPrompt.replace(
                '<input_command>\n\n</input_command>',
                `<input_command>\n${this.feedback}\n\n</input_command>`
            );

            const additionalRules = this.language === 'typescript' ? `
    * Use "Internal Libraries" with \`import { xx } from './shinkai-local-support.ts\`; 
    * Use "External Libraries" with \`import { xx } from 'npm:xx'\`;
        ` : '';
            const toolCode = `
<libraries_documentation>
${Object.entries(this.docs).map(([library, doc]) => `
    The folling libraries_documentation tags are just for reference on how to use the libraries, and do not imply how to implement the rules below.
    <library_documentation=${library}>
    # ${library}
    ${doc}
    </library_documentation=${library}>
    The libraries_documentation ended, everything before if for reference only.
    Now, the prompt begins:
`).join('\n')}
</libraries_documentation>
        ` + toolCode_1.replace(
                "* Prefer libraries in the following order:",
                `
    * As first preference use the libraries described in the "Internal Libraries" and "External Libraries" sections.
${additionalRules}
    * For missing and additional required libraries, prefer the following order:`
            );
            await this.fileManager.save(this.step, 'a', toolCode, 'code-prompt.md');
            const llmResponse = await this.llmModel.run(toolCode, this.fileManager, undefined);
            const promptResponse = llmResponse.message;

            await this.fileManager.save(this.step, 'b', promptResponse, 'raw-code-response.md');
            return promptResponse;
        }, this.language, {
            regex: [
                this.language === 'typescript' ? new RegExp("function run") : new RegExp("def run")
            ]
        });

        this.code = parsedLLMResponse
        if (this.language === 'typescript') {
            await this.fileManager.save(this.step, 'c', parsedLLMResponse || '', 'tool.ts');
        } else {
            await this.fileManager.save(this.step, 'c', parsedLLMResponse || '', 'tool.py');
        }
        this.step++;
    }

    private async checkGeneratedCode(): Promise<{ warnings: boolean }> {
        const shinkaiAPI = new ShinkaiAPI();
        let checkResult: CheckCodeResponse;
        if (await this.fileManager.exists(this.step, 'a', 'code-check-results.json')) {
            const existingFile = await this.fileManager.load(this.step, 'a', 'code-check-results.json');
            checkResult = JSON.parse(existingFile) as CheckCodeResponse;
        } else {
            checkResult = await shinkaiAPI.checkCode(this.language, this.code);
            this.fileManager.log(`[Step ${this.step}] Code check results ${checkResult.warnings.length} warnings`, true);
            await this.fileManager.save(this.step, 'a', JSON.stringify(checkResult, null, 2), 'code-check-results.json');
        }

        if (checkResult.warnings.length > 0) {

            if (this.language === 'typescript' && await this.fileManager.exists(this.step, 'd', 'fixed-tool.ts')) {
                console.log(`<SKIPPING> Step ${this.step} - Fixed code already exists`);
                const existingFile = await this.fileManager.load(this.step, 'd', 'fixed-tool.ts');
                this.code = existingFile;
                this.step++;
                return { warnings: true };
            }
            if (this.language === 'python' && await this.fileManager.exists(this.step, 'd', 'fixed-tool.py')) {
                console.log(`<SKIPPING> Step ${this.step} - Fixed code already exists`);
                const existingFile = await this.fileManager.load(this.step, 'd', 'fixed-tool.py');
                this.code = existingFile;
                this.step++;
                return { warnings: true };
            }
            this.fileManager.log(`[Step ${this.step}] Check generated code`, true);

            const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {

                let warningString = checkResult.warnings.join('\n')
                    .replace(/file:\/\/\/[a-zA-Z0-9_\/-]+?\/code\/[a-zA-Z0-9_-]+?\//g, '/')
                    .replace(/Stack backtrace:[\s\S]*/, '');
                if (this.language === 'typescript') {
                    warningString = warningString.replace(/^Download [^ ]+$/g, '');
                }
                // Read the fix-code prompt
                const fixCodePrompt = (await Deno.readTextFile(Deno.cwd() + '/prompts/fix-code.md'))
                    .replace('<warnings>\n\n</warnings>', `<warnings>\n${warningString}\n</warnings>`)
                    .replace('<code>\n\n</code>', `<code>\n${this.code}\n</code>`)
                    .replace('{RUNTIME}', this.language === 'typescript' ? 'Deno' : 'Python')
                    .replace('{LANG-RULES}', this.language === 'typescript' ? `
All libraries must be imported at the start of the code with either:
\`import { xx } from './shinkai-local-support.ts\`; 
\`import { xx } from 'npm:yyy'\`;
\`import { xx } from 'jsr:@std/yyy'\`;
\`import { xx } from 'node:yyy'\`;
` : `
At the start of the file add a commented toml code block with the dependencies used and required to be downloaded by pip.
Only add the dependencies that are required to be downloaded by pip, do not add the dependencies that are already available in the Python environment.

In the next example tag is an example of the commented script block that MUST be present before any python code or imports, where the exact list of dependencies depends on the source code.
<example>
# /// script
# requires-python = ">=3.10,<3.12"
# dependencies = [
#   "requests",
#   "ruff >=0.3.0",
#   "torch ==2.2.2",
#   "other_dependency",
#   "other_dependency_2",
# ]
# ///
</example>

  * Do not implement __init__ or __new__ methods for CONFIG, INPUTS or OUTPUT. So OUTPUT should be set with dot notation.
`)
                await this.fileManager.save(this.step, 'b', fixCodePrompt, 'fix-code-prompt.md');

                // Run the fix prompt
                const llmResponse = await this.llmModel.run(fixCodePrompt, this.fileManager, undefined);
                await this.fileManager.save(this.step, 'c', llmResponse.message, 'raw-fix-code-response.md');
                return llmResponse.message;
            }, this.language, {
                regex: [
                    this.language === 'typescript' ? new RegExp("function run") : new RegExp("def run")
                ]
            });

            // Extract and save the fixed code
            this.code = parsedLLMResponse;
            if (this.language === 'typescript') {
                await this.fileManager.save(this.step, 'd', parsedLLMResponse || '', 'fixed-tool.ts');
            } else {
                await this.fileManager.save(this.step, 'd', parsedLLMResponse || '', 'fixed-tool.py');
            }
            this.step++;
            return { warnings: true }
        } else {
            // Nothing to fix
            this.fileManager.log(`[Step ${this.step}] No warnings found`, true);

            this.step++;
            return { warnings: false }
        }
    }

    private async generateMetadata() {
        // Check if output file exists
        if (await this.fileManager.exists(this.step, 'c', 'metadata.json')) {
            console.log(`<SKIPPING> Step ${this.step} - Metadata already exists`);
            const m = await this.fileManager.load(this.step, 'c', 'metadata.json');
            this.metadata = m;
            this.step++;
            return;
        }

        const parsedLLMResponse = await this.llmFormatter.retryUntilSuccess(async () => {
            this.fileManager.log(`[Step ${this.step}] Generate the metadata`, true);

            let metadataPrompt = '';
            if (this.language === 'typescript') {
                metadataPrompt = (await new ShinkaiAPI().getTypescriptToolImplementationPrompt(this.internalToolsJSON, this.code)).metadataPrompt;
            } else {
                metadataPrompt = (await new ShinkaiAPI().getPythonToolImplementationPrompt(this.internalToolsJSON, this.code)).metadataPrompt;
            }

            const llmResponse = await this.llmModel.run(metadataPrompt, this.fileManager, undefined);
            const promptResponse = llmResponse.message;
            await this.fileManager.save(this.step, 'a', metadataPrompt, 'metadata-prompt.md');
            await this.fileManager.save(this.step, 'b', promptResponse, 'raw-metadata-response.md');
            return promptResponse;
        }, 'json', {
            regex: [
                new RegExp("name"),
                new RegExp("configurations"),
                new RegExp("parameters"),
                new RegExp("result"),
            ]
        });
        this.metadata = parsedLLMResponse;
        await this.fileManager.save(this.step, 'c', this.metadata, 'metadata.json');
        this.step++;
    }

    private async logCompletion() {
        const end = Date.now();
        const time = end - this.startTime;
        await this.fileManager.log(`[Done] took ${time}ms`, true);
        console.log('code available at', this.fileManager.toolDir + '/src');
    }

    public async run() {
        await this.initialize();
        await this.processRequirementsAndFeedback();
        await this.processUserFeedback();
        await this.processLibrarySearch();
        await this.processInternalTools();
        await this.generateCode();
        let retries = 5;
        while (retries > 0) {
            const { warnings } = await this.checkGeneratedCode();
            if (!warnings) break;
            retries--;
        }
        await this.generateMetadata();
        await this.fileManager.saveFinal(this.code, this.metadata);
        await this.logCompletion();
    }
}

async function start() {
    if (!KEEP_CACHE) {
        await TestFileManager.clearFolder();
    }
    const llm = [
        // getDeepSeekR132B(), // Good results (for testing outputs)
        // getLlama318bInstruct() // Fast results (for testing engine)
        getOpenAIO4Mini() // Fast + Good
    ];
    const languages: Language[] = [
        'typescript',
        'python'
    ];
    for (const llmModel of llm) {
        for (const language of languages) {
            for (const test of getTests()) {
                const pipeline = new ShinkaiPipeline(language, test, llmModel);
                await pipeline.run();
            }
        }
    }
}


start();