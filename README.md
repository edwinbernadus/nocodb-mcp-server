# Nocodb MCP Server

## Introduction
The Nocodb MCP Server enables seamless interaction with a Nocodb database using the Model Context Protocol (MCP). It facilitates CRUD (Create, Read, Update, Delete) operations on Nocodb tables.  
This is forking from 

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
### 1. Fetch Records
Retrieve data from a specified Nocodb table.
```typescript
const records = await getRecords("Shinobi");
```

### 2. Create Record
Create a new record in a specified Nocodb table.
```typescript
const response = await postRecords("Shinobi", {
        Title: "sasuke"
    }
)
``` 

### 3. Update Record
Update an existing record in a specified Nocodb table.
```typescript
const response = await updateRecords("Shinobi", {
        Title: "naruto",
        id: 1
    }
)
```

### 4. Delete Record
Delete a record from a specified Nocodb table.
```typescript
const response = await deleteRecords("Shinobi", {
        id: 1
    }
)
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
