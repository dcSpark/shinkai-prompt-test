
<agent-code-definition>
  Given this signature:
  ```typescript
  export async function run(config: CONFIG, inputs: INPUTS): Promise<OUTPUT>
  ```
</agent-code-definition>

<agent-code-output>
  * Define the Typescript type for INPUTS
  * Define the Typescript type for OUTPUT
</agent-code-output>

<agent-code-rules>
  * Write only typescript code in a single code block
  * Avoid all comments, text, notes and metadata.
  * CONFIG is defined outside and cannot be changed.
  * type INPUT = { /* keys */ }
  * type OUTPUT = { /* keys */ }
  * Keep only the minimum keys required to make the command viable.
  * Analyze the instruction in the command tag and define the INPUTS and OUTPUT following the rules above.
</agent-code-rules>

<command>
'''
Generate a tool that downloads a website, and return the complete HTML as { content: string }.
'''
</command>
