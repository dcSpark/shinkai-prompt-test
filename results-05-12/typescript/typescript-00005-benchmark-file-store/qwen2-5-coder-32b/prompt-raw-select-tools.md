
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
download a image URL and store it in a file. Return the file path.
'''
</command>