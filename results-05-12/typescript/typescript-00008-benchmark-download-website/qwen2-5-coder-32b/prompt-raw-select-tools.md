
<available-tools-definitions>
  # Available Tools Definitions:
  undefined
</available-tools-definitions>

<agent-code-rules>
  * Only return a list of the function names from this list.
  * Avoid all comments, text, notes and metadata.
  * Select the minimum required tools that are needed to execute the instruction in the command tag from this list.
  * If there is a required tool that is not in the list, prefix with '!' to indicate that it is not available, but needed to execute the command tag instruction.
</agent-code-rules>

<command>
'''
Generate a tool that downloads a website, and return the complete HTML as { content: string }.
'''
</command>