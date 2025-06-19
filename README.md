[![MseeP Badge](https://mseep.net/pr/edwinbernadus-nocodb-mcp-server-badge.jpg)](https://mseep.ai/app/edwinbernadus-nocodb-mcp-server)

# NocoDB MCP Server

[![smithery badge](https://smithery.ai/badge/@edwinbernadus/nocodb-mcp-server)](https://smithery.ai/server/@edwinbernadus/nocodb-mcp-server)

## Introduction

The NocoDB MCP Server enables seamless interaction with your NocoDB database using the Model Context Protocol (MCP). This server makes it easy to perform CRUD (Create, Read, Update, Delete) operations on NocoDB tables through natural language commands.

## Example Prompt

```text
[Get Records]
get data from nocodb, table: Shinobi

[Create Record]
add new row, with name: sasuke-2
add other row, with name: naruto-2

[Update Record]
update all rows, remove suffix -

[Delete Record]
delete all rows with name naruto

[Add Column]
add column with name: Age

update all rows, set Age to 18

[Delete Column]
delete column with name: Age
```

## Example Prompt - Upload File

```text
[Create table]
from the json files
put on nocodb database
table name is TableShinobi
```
JSON location file in: [example_upload.json](example_upload.json)

## Example Prompt - Bulk Create Records and Bulk Delete Records


![bulk_sample1](https://raw.githubusercontent.com/edwinbernadus/nocodb-mcp-server/refs/heads/main/docs/sample-bulk/bulk-screen1.png)
![bulk_sample2](https://raw.githubusercontent.com/edwinbernadus/nocodb-mcp-server/refs/heads/main/docs/sample-bulk/bulk-screen2.png)
![bulk_sample3](https://raw.githubusercontent.com/edwinbernadus/nocodb-mcp-server/refs/heads/main/docs/sample-bulk/bulk-screen3.png)

## About This Fork

This repository is a TypeScript-based fork of [NocoDB-MCP-Server](https://github.com/granthooks/Nocodb-MCP-Server). It retains the core functionality while improving maintainability and compatibility with modern TypeScript development practices.

## Setup

Ensure that Node.js and TypeScript are installed, then execute:

```bash
npm install
npm run build
```

## Configuration

Define the required environment variables in a `.env` file:

```env
NOCODB_URL=https://your-nocodb-instance.com
NOCODB_API_TOKEN=your_api_token_here
NOCODB_BASE_ID=your_base_id_here
```

**Tip:** You can copy the template from [env.example](env.example) and fill in your values.

### How to Obtain NOCODB_BASE_ID

To find your `NOCODB_BASE_ID`, check the URL of your Nocodb instance.  
For example:
https://app.nocodb.com/#/wi6evls6/pqmob3ammcknma5/maty9c5xkmf4012  
In this URL format:

```text
https://app.nocodb.com/#/{USERNAME}/{NOCODB_BASE_ID}/{TABLE_ID}
```

## Integration with Claude Desktop

Modify `claude_desktop_config.json` to include:

```json
{
  "mcpServers": {
    "nocodb": {
      "command": "node",
      "args": ["{working_folder}/dist/start.js"],
      "env": {
        "NOCODB_URL": "https://your-nocodb-instance.com",
        "NOCODB_BASE_ID": "your_base_id_here",
        "NOCODB_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

## Direct call from CLI

You can directly call the MCP server from the command line:  
NOCODB_URL, NOCODB_API_TOKEN, and NOCODB_BASE_ID are required parameters.  
`NOCODB_URL=https://app.nocodb.com` if you are using NocoDB cloud.

```bash
npx -y nocodb-mcp-server {NOCODB_URL} {NOCODB_BASE_ID} {NOCODB_API_TOKEN} 
```

## Testing CLI

To run the tests, execute:

```bash
npx -y @wong2/mcp-cli npx nocodb-mcp-server {NOCODB_URL} {NOCODB_BASE_ID} {NOCODB_API_TOKEN} 
```

## API Functions

For detailed information about available API functions, please refer to [API_FUNCTION.md](API_FUNCTION.md).

## Project Structure

```text
/project-root
  ├── src/            # TypeScript source files
  ├── dist/           # Compiled JavaScript output
  ├── .env            # Environment variable configurations
  ├── package.json    # Project dependencies and scripts
  ├── tsconfig.json   # TypeScript settings
```

## Contribution Guidelines

Contributions are encouraged! Feel free to open issues or submit pull requests.

## License

This project is distributed under MIT.
