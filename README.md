# Nocodb MCP Server

[![smithery badge](https://smithery.ai/badge/@edwinbernadus/nocodb-mcp-server)](https://smithery.ai/server/@edwinbernadus/nocodb-mcp-server)

## Introduction
The Nocodb MCP Server enables seamless interaction with a Nocodb database using the Model Context Protocol (MCP). It facilitates CRUD (Create, Read, Update, Delete) operations on Nocodb tables.  

## About This Fork
This repository is a TypeScript-based fork of [Nocodb-MCP-Server](https://github.com/granthooks/Nocodb-MCP-Server). It retains the core functionality while improving maintainability and compatibility with modern TypeScript development practices.

## Setup
Ensure that Node.js and TypeScript are installed, then execute:
```sh
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

### How to Obtain NOCODB_BASE_ID
To find your `NOCODB_BASE_ID`, check the URL of your Nocodb instance.  
For example:
https://app.nocodb.com/#/wi6evls6/pqmob3ammcknma5/maty9c5xkmf4012  
In this URL format:
```
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
        "NOCODB_API_TOKEN": "your_api_token_here",
        "NOCODB_BASE_ID": "your_base_id_here"
      }
    }
  }
}
```

## Prompt Example
```
read file EXAMPLE_PROMPT.md for examples
```


## API Functions
```
read file API_FUNCTION.md for API functions
```

## Project Structure
```
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
