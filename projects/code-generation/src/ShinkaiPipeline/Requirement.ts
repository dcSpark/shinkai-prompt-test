import { Language } from "./types.ts";
// Keeping old format to keep old tests working.
// TODO Update this to only keep important tests and fields.
export class Requirement {
    static id = 0;
    private generate_tool_router_key(test: string) {
        const code = test.replace(/[^a-zA-Z0-9]/g, "_");
        return `local:::${code}_test_engine:::${code}`;
    }
    public tool_router_key: string;
    public id: number;
    public code: string;
    public prompt: string;
    public prompt_type: string;
    public tools: string[] | undefined;
    public input: Record<string, unknown>;
    public config: Record<string, unknown>;
    public check?: (output: string) => number; // between 0 and 1
    public save?: boolean;
    public supportFiles?: { fileName: string; path: string }[];
    public limited_language?: Language;
    public skip?: string
    public feedback?: string;
    public plan_feedback?: string;
    public feedback_ts?: string;
    public feedback_python?: string;
    constructor(
        { code, prompt, prompt_type, tools, input, config, check, save, supportFiles, limited_language, skip, feedback, feedback_ts, feedback_python }: {
            code: string,
            prompt: string,
            prompt_type: string,
            tools: string[] | undefined,
            input: Record<string, unknown>,
            config: Record<string, unknown>,
            check?: (output: string) => number, // between 0 and 1
            save?: boolean,
            supportFiles?: { fileName: string; path: string }[],
            limited_language?: Language,
            skip?: string,
            feedback?: string,
            feedback_ts?: string,
            feedback_python?: string
        }
    ) {
        this.id = Requirement.id++;
        this.code = code;
        this.prompt = prompt;
        this.prompt_type = prompt_type;
        this.tools = tools;
        this.input = input;
        this.config = config;
        this.check = check;
        this.save = save;
        this.supportFiles = supportFiles;
        this.limited_language = limited_language;
        this.skip = skip;
        this.tool_router_key = this.generate_tool_router_key(code);
        this.feedback = feedback;
        this.feedback_ts = feedback_ts;
        this.feedback_python = feedback_python;
    };
};


export const emptyRequirement = () => new Requirement({
    code: '',
    prompt: '',
    prompt_type: '',
    tools: [],
    input: {},
    config: {},
});

const benchmark_download_website = new Requirement(
    {
        code: `benchmark-download-website`,
        prompt: `Generate a tool that downloads a website, and return the complete HTML as { content: string }.`,
        prompt_type: "type INPUT = { url: string }",
        input: {
            url:
                "https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html",
        },
        tools: [],
        config: {},
        check: (result: string) => {
            return result.includes("This is a static site") ? 1 : 0;
        },
        save: true,
        feedback_ts: "Use the library npm:axios to download the website",
        feedback_python: "Use the library requests to download the website",
    });

// const benchmark_store_website = new Test(
//     {
//         code: `benchmark-store-website`,
//         prompt:
//     `Generate a tool that stores or updates a website content in a sqlite database, and returns the entire table`,
//     prompt_type: "type INPUT = { url: string }",
//     input: {
//     url:
//         "https://raw.githubusercontent.com/acedward/expert-octo-computing-machine/main/test.html",
//     },
//     tools: [
//     "local:::rust_toolkit:::shinkai_sqlite_query_executor",
//     benchmark_download_website.tool_router_key,
//     ],
//     config: {},
//     check: (result: string) => {
//     return result.includes("This is a static site") ? 1 : 0;
//     },
//     save: true,
// });

export const getTests = (): Requirement[] => [
    benchmark_download_website
    // , benchmark_store_website
];
