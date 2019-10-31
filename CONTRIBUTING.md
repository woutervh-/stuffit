## Running tests

### Running and debugging individual test files in VS Code

Here's a `launch.json` file which lets you run and debug each test file individually:

```json
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Launch test",
            "program": "${workspaceFolder}/node_modules/mocha/bin/_mocha",
            "args": [
                "--no-timeouts",
                "--colors",
                "${relativeFile}"
            ],
            "cwd": "${workspaceRoot}",
            "internalConsoleOptions": "openOnSessionStart"
        }
    ]
}
```
