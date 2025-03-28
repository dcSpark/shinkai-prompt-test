export const mapReducePrompt = (library: string, chunk: string) => `
This next documentation tag contains a partial chunk of markdown documentation of "${library}" library.
<documentation>
\`\`\`markdown
${chunk}
\`\`\`
</documentation>

<rules>
## You are builing a final documentation document that will be used by another system to understand and use this library inside a program.
## Summarize, but do not lose any of the following information:
* documentation
* descriptions
* information
* methods
* invocations
* examples
* function
* arguments
* properties
* classes 
* how to initialize
* import into code
* require
* install
* download
* other dependencies
* how use the library 
* other information related to the library usage.

## If a section has no relation with the documentation, then remove it, for example:
* changelogs
* release notes
* ads
* sitemaps
* external websites
* sponsors
* external links that add no value to the documentation.

## If not sure, or possibly ambiguous, then keep it.  
</rules>

`;