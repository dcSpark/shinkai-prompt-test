<rules>
* Given the program description in the requierement tag.
* And Given the program code in the code tag.
* A example is given to showcase the output format.
* Extract the input and output example.
* And generate exactly 2 additional possible test cases.
* We will run these examples in the with the code provided to check if they will work.
</rules>

<requirement>

</requirement>

<code>

</code>

<example>
```json
[
    { "inputs": { "key-1": 1, "key-2": 2 }, "config": {}, "output": { "sum": 3 } },
    { "inputs": { "key-1": 5, "key-2": 5 }, "config": {}, "output": { "sum": 10 } },
    { "inputs": { "key-1": 2, "key-2": 2 }, "config": {}, "output": { "sum": 7 } }
]
```
</example>

<formatting>
* Generate a valid JSON Array of Objects.
* Return exacty 3 Objects in the Array.
* Each Object has a 'input', 'config' and 'output'.
* The output must be inside a fenced triple tick json block.
</formating>