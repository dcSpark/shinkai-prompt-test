import { assertArrayIncludes, assertEquals } from "https://deno.land/std@0.220.1/assert/mod.ts";
import { LLMFormatter } from './LLMFormatter.ts';

Deno.test("LLMFormatter.extractStateMachine should correctly extract code blocks with their types", () => {
    // Create an instance of LLMFormatter
    const formatter = new LLMFormatter(undefined);

    // Sample text with different code blocks
    const sampleText = `
Here is some markdown content.

\`\`\`typescript
// TypeScript code block
function hello() {
  return "world";
}
\`\`\`

Some more text in between.

\`\`\`json
{
  "name": "test",
  "value": 123
}
\`\`\`

And some Python code:

\`\`\`python
def hello():
    return "world"
\`\`\`

And a markdown block:

\`\`\`markdown
# Header
Some **bold** text
\`\`\`

And a block with nested code:

\`\`\`typescript
function example() {
  const code = \`\`\`
  nested code
  \`\`\`;
  return code;
}
\`\`\`
`;

    // Access the private method using type assertion
    const result = (formatter as any).extractStateMachine(sampleText);

    // Assertions
    assertEquals(result.length, 5);

    // Check TypeScript block
    assertEquals(result[0].type, 'typescript');
    assertArrayIncludes(result[0].content.split('\n'), ['function hello() {']);

    // Check JSON block
    assertEquals(result[1].type, 'json');
    assertArrayIncludes(result[1].content.split('\n'), ['  "name": "test",']);

    // Check Python block
    assertEquals(result[2].type, 'python');
    assertArrayIncludes(result[2].content.split('\n'), ['def hello():']);

    // Check Markdown block
    assertEquals(result[3].type, 'markdown');
    assertArrayIncludes(result[3].content.split('\n'), ['# Header']);

    // Check nested code block
    assertEquals(result[4].type, 'typescript');
});

Deno.test("LLMFormatter.extractStateMachine should handle unclosed blocks", () => {
    const formatter = new LLMFormatter(undefined);

    const unclosedBlockText = `
Some text

\`\`\`typescript
// Unclosed TypeScript block
function test() {
  console.log("This block is not closed");
`;

    const result = (formatter as any).extractStateMachine(unclosedBlockText);

    assertEquals(result.length, 1);
    assertEquals(result[0].type, 'typescript');
    assertArrayIncludes(result[0].content.split('\n'), ['function test() {']);
});

Deno.test("LLMFormatter.extractStateMachine should handle empty input", () => {
    const formatter = new LLMFormatter(undefined);

    const result = (formatter as any).extractStateMachine('');

    assertEquals(result.length, 0);
});

Deno.test("LLMFormatter.extractStateMachine should handle input with no code blocks", () => {
    const formatter = new LLMFormatter(undefined);

    const noBlocksText = 'This is just plain text with no code blocks.';

    const result = (formatter as any).extractStateMachine(noBlocksText);

    assertEquals(result.length, 0);
});

Deno.test("LLMFormatter.extractStateMachine should handle blocks with no type specified", () => {
    const formatter = new LLMFormatter(undefined);

    const noTypeText = `
Some text

\`\`\`
// No type specified, should default to markdown
const x = 1;
\`\`\`
`;

    const result = (formatter as any).extractStateMachine(noTypeText);

    assertEquals(result.length, 1);
    assertEquals(result[0].type, 'markdown');
    assertArrayIncludes(result[0].content.split('\n'), ['const x = 1;']);
});

Deno.test("LLMFormatter.extractStateMachine should handle nested code fence markers", () => {
    const formatter = new LLMFormatter(undefined);

    const nestedCodeText = `
Here is a code block with nested code fence markers:

\`\`\`typescript
function generateMarkdown() {
  const markdown = \`
\`\`\`markdown
# This is a nested markdown block
- Item 1
- Item 2
\`\`\`
  \`;
  
  return markdown;
}
\`\`\`

And another one with multiple levels:

\`\`\`python
def code_example():
    # Python function that returns some code
    return '''
\`\`\`javascript
function nested() {
    const deeplyNested = \`
\`\`\`html
<div>Even deeper nesting</div>
\`\`\`
    \`;
    return deeplyNested;
}
\`\`\`
    '''
\`\`\`
`;

    const result = (formatter as any).extractStateMachine(nestedCodeText);

    // Should extract 2 blocks (typescript and python)
    assertEquals(result.length, 2);

    // First block should be typescript
    assertEquals(result[0].type, 'typescript');
    assertArrayIncludes(result[0].content.split('\n'), ['function generateMarkdown() {']);
    // Should contain the nested markdown block as text
    assertArrayIncludes(result[0].content.split('\n'), ['```markdown']);
    assertArrayIncludes(result[0].content.split('\n'), ['# This is a nested markdown block']);

    // Second block should be python
    assertEquals(result[1].type, 'python');
    assertArrayIncludes(result[1].content.split('\n'), ['def code_example():']);
    // Should contain the nested javascript block as text
    assertArrayIncludes(result[1].content.split('\n'), ['```javascript']);
    // Should also contain the deeply nested html block
    assertArrayIncludes(result[1].content.split('\n'), ['```html']);
});

Deno.test("LLMFormatter.extractStateMachine should handle inline code blocks", () => {
    const formatter = new LLMFormatter(undefined);

    const inlineCodeText = `
Here is some text with an inline code block:

\`\`\`typescript
const inlineExample = \`const x = 1;\`;
console.log(inlineExample);
\`\`\`

And here's a block with backticks on the same line:

\`\`\`python
print("This is a backtick: \`")
x = "\`\`\` not a code block"
\`\`\`
`;

    const result = (formatter as any).extractStateMachine(inlineCodeText);

    // Should extract 2 blocks (typescript and python)
    assertEquals(result.length, 2);

    // First block should be typescript
    assertEquals(result[0].type, 'typescript');
    assertArrayIncludes(result[0].content.split('\n'), ['const inlineExample = `const x = 1;`;']);

    // Second block should be python
    assertEquals(result[1].type, 'python');
    assertArrayIncludes(result[1].content.split('\n'), ['print("This is a backtick: `")']);
    assertArrayIncludes(result[1].content.split('\n'), ['x = "``` not a code block"']);
});

Deno.test("LLMFormatter.extractStateMachine should handle input that is entirely a code block", () => {
    const formatter = new LLMFormatter(undefined);

    const pureCodeText = `
function pureCode() {
    const greeting = "Hello, World!";
    console.log(greeting);
    return greeting;
}
`;

    const result = (formatter as any).tryToExtractTS(pureCodeText);

    assertEquals(result, pureCodeText);
}); 