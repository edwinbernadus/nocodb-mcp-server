#!/usr/bin/env node
import {McpServer, ResourceTemplate} from "@modelcontextprotocol/sdk/server/mcp.js";
import {StdioServerTransport} from "@modelcontextprotocol/sdk/server/stdio.js";
import {z} from "zod";
import axios, {AxiosInstance} from "axios";
import {fork} from "node:child_process";

let {NOCODB_URL, NOCODB_BASE_ID, NOCODB_API_TOKEN} = process.env;
if (!NOCODB_URL || !NOCODB_BASE_ID || !NOCODB_API_TOKEN) {
    // check from npx param input
    NOCODB_URL = process.argv[2] || NOCODB_URL;
    NOCODB_BASE_ID = process.argv[3] || NOCODB_BASE_ID;
    NOCODB_API_TOKEN = process.argv[4] || NOCODB_API_TOKEN;

    if (!NOCODB_URL || !NOCODB_BASE_ID || !NOCODB_API_TOKEN) {
        throw new Error("Missing required environment variables");
    }
}


const filterRules =
    `
Comparison Operators
Operation Meaning Example
eq  equal (colName,eq,colValue)
neq not equal (colName,neq,colValue)
not not equal (alias of neq)  (colName,not,colValue)
gt  greater than  (colName,gt,colValue)
ge  greater or equal  (colName,ge,colValue)
lt  less than (colName,lt,colValue)
le  less or equal (colName,le,colValue)
is  is  (colName,is,true/false/null)
isnot is not  (colName,isnot,true/false/null)
in  in  (colName,in,val1,val2,val3,val4)
btw between (colName,btw,val1,val2)
nbtw  not between (colName,nbtw,val1,val2)
like  like  (colName,like,%name)
isWithin  is Within (Available in Date and DateTime only) (colName,isWithin,sub_op)
allof includes all of (colName,allof,val1,val2,...)
anyof includes any of (colName,anyof,val1,val2,...)
nallof  does not include all of (includes none or some, but not all of) (colName,nallof,val1,val2,...)
nanyof  does not include any of (includes none of)  (colName,nanyof,val1,val2,...)


Comparison Sub-Operators
The following sub-operators are available in Date and DateTime columns.

Operation Meaning Example
today today (colName,eq,today)
tomorrow  tomorrow  (colName,eq,tomorrow)
yesterday yesterday (colName,eq,yesterday)
oneWeekAgo  one week ago  (colName,eq,oneWeekAgo)
oneWeekFromNow  one week from now (colName,eq,oneWeekFromNow)
oneMonthAgo one month ago (colName,eq,oneMonthAgo)
oneMonthFromNow one month from now  (colName,eq,oneMonthFromNow)
daysAgo number of days ago  (colName,eq,daysAgo,10)
daysFromNow number of days from now (colName,eq,daysFromNow,10)
exactDate exact date  (colName,eq,exactDate,2022-02-02)

For isWithin in Date and DateTime columns, the different set of sub-operators are used.

Operation Meaning Example
pastWeek  the past week (colName,isWithin,pastWeek)
pastMonth the past month  (colName,isWithin,pastMonth)
pastYear  the past year (colName,isWithin,pastYear)
nextWeek  the next week (colName,isWithin,nextWeek)
nextMonth the next month  (colName,isWithin,nextMonth)
nextYear  the next year (colName,isWithin,nextYear)
nextNumberOfDays  the next number of days (colName,isWithin,nextNumberOfDays,10)
pastNumberOfDays  the past number of days (colName,isWithin,pastNumberOfDays,10)
Logical Operators

Operation Example
~or (checkNumber,eq,JM555205)~or((amount, gt, 200)~and(amount, lt, 2000))
~and  (checkNumber,eq,JM555205)~and((amount, gt, 200)~and(amount, lt, 2000))
~not  ~not(checkNumber,eq,JM555205)


For date null rule
(date,isnot,null) -> (date,notblank).
(date,is,null) -> (date,blank).
`

const nocodbClient: AxiosInstance = axios.create({
    baseURL: NOCODB_URL.replace(/\/$/, ""),
    headers: {
        "xc-token": NOCODB_API_TOKEN,
        "Content-Type": "application/json",
    },
    timeout: 30000,
});

export async function getRecords(tableName: string,
                                 filters?: string,
                                 limit?: number,
                                 offset?: number,
                                 sort?: string,
                                 fields?: string,
) {
    const tableId = await getTableId(tableName);

    const paramsArray = []
    if (filters) {
        paramsArray.push(`where=${filters}`);
    }
    if (limit) {
        paramsArray.push(`limit=${limit}`);
    }
    if (offset) {
        paramsArray.push(`offset=${offset}`);
    }
    if (sort) {
        paramsArray.push(`sort=${sort}`);
    }
    if (fields) {
        paramsArray.push(`fields=${fields}`);
    }

    const queryString = paramsArray.join("&");
    const response = await nocodbClient.get(`/api/v2/tables/${tableId}/records?${queryString}`,);
    return {
        input: {
            tableName,
            filters,
            limit,
            offset,
            sort,
            fields
        },
        output: response.data
    };
}

export async function postRecords(tableName: string, data: unknown) {
    const tableId = await getTableId(tableName);
    const response = await nocodbClient.post(`/api/v2/tables/${tableId}/records`, data);
    return {
        output: response.data,
        input: data
    };
}

export async function patchRecords(tableName: string, rowId: number, data: any) {
    const tableId = await getTableId(tableName);
    const newData = [{
        ...data,
        "Id": rowId,
    }]

    const response = await nocodbClient.patch(`/api/v2/tables/${tableId}/records`, newData);
    return {
        output: response.data,
        input: data
    };
}

export async function deleteRecords(tableName: string, rowId: number) {
    const tableId = await getTableId(tableName);
    const data: any =
        {
            "Id": rowId
        }
    const response = await nocodbClient.delete(`/api/v2/tables/${tableId}/records`, {data});
    return response.data;
}

export const getTableId = async (tableName: string): Promise<string> => {
    try {
        const response = await nocodbClient.get(`/api/v2/meta/bases/${NOCODB_BASE_ID}/tables`);
        const tables = response.data.list || [];
        const table = tables.find((t: any) => t.title === tableName);
        if (!table) throw new Error(`Table '${tableName}' not found`);
        return table.id;
    } catch (error: any) {
        throw new Error(`Error retrieving table ID: ${error.message}`);
    }
};

export async function getListTables() {
    try {
        const response = await nocodbClient.get(`/api/v2/meta/bases/${NOCODB_BASE_ID}/tables`);
        const tables = response.data.list || [];
        return tables.map((t: any) => t.title);
    } catch (error: any) {
        throw new Error(`Error get list tables: ${error.message}`);
    }
}

export async function getTableMetadata(tableName: string) {
    try {
        const tableId = await getTableId(tableName);
        const response = await nocodbClient.get(`/api/v2/meta/tables/${tableId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(`Error adding column: ${error.message}`);
    }
}


// column type

// SingleLineText
// Number
// Decimals
// DateTime
// Checkbox
export async function alterTableAddColumn(tableName: string, columnName: string, columnType: string) {
    try {
        const tableId = await getTableId(tableName);
        const response = await nocodbClient.post(`/api/v2/meta/tables/${tableId}/columns`, {
            title: columnName,
            uidt: columnType,
        });
        return response.data;
    } catch (error: any) {
        throw new Error(`Error adding column: ${error.message}`);
    }
}

export async function alterTableRemoveColumn(columnId: string) {
    try {
        const response = await nocodbClient.delete(`/api/v2/meta/columns/${columnId}`);
        return response.data;
    } catch (error: any) {
        throw new Error(`Error remove column: ${error.message}`);
    }
}

type ColumnType = "SingleLineText" | "Number" | "Checkbox" | "DateTime" | "ID";
type TableColumnType = {
    title: string;
    uidt: ColumnType
}

export async function createTable(tableName: string, data: TableColumnType[]) {
    try {

        const hasId = data.filter(x => x.title === "Id").length > 0
        if (!hasId) {
            // insert at first
            data.unshift({
                title: "Id",
                uidt: "ID"
            })
        }

        const response = await nocodbClient.post(`/api/v2/meta/bases/${NOCODB_BASE_ID}/tables`, {
            title: tableName,
            columns: data.map((value) => ({
                title: value.title,
                uidt: value.uidt
            })),
        });
        return response.data;
    } catch (error: any) {
        throw new Error(`Error creating table: ${error.message}`);
    }
}


// Create an MCP server
const server = new McpServer({
    name: "nocodb-mcp-server",
    version: "1.0.0"
});

async function main() {

    server.tool("nocodb-get-records",
        "Nocodb - Get Records" +
        `hint:
    1. Get all records from a table (limited to 10):
       retrieve_records(table_name="customers")
       
    3. Filter records with conditions:
       retrieve_records(
           table_name="customers", 
           filters="(age,gt,30)~and(status,eq,active)"
       )
       
    4. Paginate results:
       retrieve_records(table_name="customers", limit=20, offset=40)
       
    5. Sort results:
       retrieve_records(table_name="customers", sort="-created_at")
       
    6. Select specific fields:
       retrieve_records(table_name="customers", fields="id,name,email")
`,
        {
            tableName: z.string(),
            filters: z.string().optional().describe(
                `Example: where=(field1,eq,value1)~and(field2,eq,value2) will filter records where 'field1' is equal to 'value1' AND 'field2' is equal to 'value2'.
You can also use other comparison operators like 'ne' (not equal), 'gt' (greater than), 'lt' (less than), and more, to create complex filtering rules.
` + " " + filterRules),
            limit: z.number().optional(),
            offset: z.number().optional(),
            sort: z.string().optional().describe("Example: sort=field1,-field2 will sort the records first by 'field1' in ascending order and then by 'field2' in descending order."),
            fields: z.string().optional().describe("Example: fields=field1,field2 will include only 'field1' and 'field2' in the API response."),
        },
        async ({tableName, filters, limit, offset, sort, fields}) => {
            const response = await getRecords(tableName, filters, limit, offset, sort, fields);
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );

    server.tool(
        "nocodb-get-list-tables",
        `Nocodb - Get List Tables
notes: only show result from output to user
`,
        {},
        async () => {
            const response = await getListTables()
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    )

    server.tool(
        "nocodb-post-records",
        "Nocodb - Post Records",
        {
            tableName: z.string().describe("table name"),
            data: z.any()
                .describe(`The data to be inserted into the table. 
[WARNING] The structure of this object should match the columns of the table.
example:
const response = await postRecords("Shinobi", {
        Title: "sasuke"
})`)
        },
        async ({tableName, data}) => {
            const response = await postRecords(tableName, data)
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );


    server.tool(
        "nocodb-post-records-bulk",
        "Nocodb - Post Records Multiple Records",
        {
            tableName: z.string().describe("table name"),
            uploadItems: z.array(z.object({
                data: z.any()
                    .describe(`The data to be inserted into the table. 
[WARNING] The structure of this object should match the columns of the table.
example:
const response = await postRecords("Shinobi", {
        Title: "sasuke"
})`)
            })).describe("array of data to be inserted into the table")
        },
        async ({tableName, uploadItems}) => {
            const responses: any[] = [];
            for (const item of uploadItems) {
                const data = item.data;
                if (!data) {
                    throw new Error("Data is required");
                }
                const response = await postRecords(tableName, data)
                responses.push(response);
            }

            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(responses),
                }],
            }
        }
    )
    ;


    server.tool("nocodb-patch-records",
        "Nocodb - Patch Records",
        {
            tableName: z.string(),
            rowId: z.number(),
            data: z.any().describe(`The data to be updated in the table.
[WARNING] The structure of this object should match the columns of the table.
[WARNING] Do not use JavaScript-style Object with Stringified Data
example:
const response = await patchRecords("Shinobi", 2, {
            Title: "sasuke-updated"
})`)
        },
        async ({tableName, rowId, data}) => {
            if (typeof data === 'string'){
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    return {
                        content: [{
                            type: 'text',
                            mimeType: 'application/json',
                            text: JSON.stringify({
                                error: "Data must be a valid JSON object or stringified JSON object"
                            }),
                        }],
                    }
                }
            }
            const response = await patchRecords(tableName, rowId, data)
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );

    server.tool("nocodb-delete-records",
        "Nocodb - Delete Records",
        {tableName: z.string(), rowId: z.number()},
        async ({tableName, rowId}) => {
            const response = await deleteRecords(tableName, rowId)
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );

    server.tool("nocodb-delete-records-bulk",
        "Nocodb - Delete Records Multiple Records",
        {
            tableName: z.string().describe("table name"),
            deleteRowsId: z.array(z.object({
                rowId: z.number()
            })).describe("array of data to be deleted from the table")
        },
        async ({tableName, deleteRowsId}) => {
            const responses: any[] = [];
            for (const item of deleteRowsId) {
                const rowId = item.rowId;
                if (!rowId) {
                    throw new Error("Data is required");
                }
                const response = await deleteRecords(tableName, rowId)
                responses.push(response);
            }

            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(responses),
                }],
            }
        }
    );

    server.tool("nocodb-get-table-metadata",
        "Nocodb - Get Table Metadata",
        {tableName: z.string()},
        async ({tableName}) => {
            const response = await getTableMetadata(tableName)
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );

    server.tool("nocodb-alter-table-add-column",
        "Nocodb - Alter Table Add Column",
        {
            tableName: z.string(),
            columnName: z.string(),
            columnType: z.string().describe("SingleLineText, Number, Decimals, DateTime, Checkbox")
        },
        async ({tableName, columnName, columnType}) => {
            const response = await alterTableAddColumn(tableName, columnName, columnType)
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );

    server.tool("nocodb-alter-table-remove-column",
        "Nocodb - Alter Table Remove Column" +
        " get columnId from getTableMetadata" +
        " notes: remove column by columnId" +
        " example: c7uo2ruwc053a3a" +
        " [WARNING] this action is irreversible" +
        " [RECOMMENDATION] give warning to user",
        {columnId: z.string()},
        async ({columnId}) => {
            const response = await alterTableRemoveColumn(columnId)
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );

    server.tool("nocodb-create-table",
        "Nocodb - Create Table",
        {
            tableName: z.string(),
            data: z.array(z.object({
                title: z.string(),
                uidt: z.enum(["SingleLineText", "Number", "Checkbox", "DateTime"]).describe("SingleLineText, Number, Checkbox, DateTime")

            }).describe(`The data to be inserted into the table.
[WARNING] The structure of this object should match the columns of the table.
example:
const response = await createTable("Shinobi", [
        {
            title: "Name",
            uidt: "SingleLineText"
        },
        {
            title: "Age",
            uidt: "Number"
        },
        {
            title: "isHokage",
            uidt: "Checkbox"
        },
        {
            title: "Birthday",
            uidt: "DateTime"
        }
    ]
)`))
        },
        async ({tableName, data}) => {
            const response = await createTable(tableName, data)
            return {
                content: [{
                    type: 'text',
                    mimeType: 'application/json',
                    text: JSON.stringify(response),
                }],
            }
        }
    );


// Add a dynamic greeting resource
    server.resource(
        "greeting",
        new ResourceTemplate("greeting://{name}", {list: undefined}),
        async (uri, {name}) => ({
            contents: [{
                uri: uri.href,
                text: `Hello, ${name}!`
            }]
        })
    );

// Start receiving messages on stdin and sending messages on stdout
    const transport = new StdioServerTransport();
    await server.connect(transport);
}


void main();

