export const selectInPageUrlsPrompt = (context: string[], possiblePages: string[], finalQuery: string) => `
In the search we have a lot possible pages that contain documentation, there is JSON with an Internet search result for the query: "${finalQuery}"
We have some general incomplete information about the documentation in the context tag below.
<context>
${context.join('\n')}   
</context>

<search_results>
${possiblePages.join('\n')}   
</search_results>

<rules>
* Use the context to get an idea of what possible pages might be important to the documentation, but also asume the context is incomplete.
* We want to get the links that may contain the official programming documentation. Ideally the complete documentation.
* Keep only those that might have the documentation. 
* Return the links as a JSON array.
</rules>

<format>
* Output only the JSON array as in the output tag below
<output>
\`\`\`json
["https://URL1", "https://URL2", "https://URL3"]
\`\`\`
</output>
* JSON have valid syntax and only urls.
</format>

            `