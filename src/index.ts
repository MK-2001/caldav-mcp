#!/usr/bin/env node

import "dotenv/config"
import { CalDAVClient } from "ts-caldav"
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js"
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js"
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';

import { registerCreateEvent } from "./tools/create-event.js"
import { registerDeleteEvent } from "./tools/delete-event.js"
import { registerListCalendars } from "./tools/list-calendars.js"
import { registerListEvents } from "./tools/list-events.js"

const server = new McpServer({
  name: "caldav-mcp",
  version: "0.1.0",
})
const client = await CalDAVClient.create({
    baseUrl: process.env.CALDAV_BASE_URL || "",
    auth: {
      type: "basic",
      username: process.env.CALDAV_USERNAME || "",
      password: process.env.CALDAV_PASSWORD || "",
    },
  })
async function main() {
  

  registerCreateEvent(client, server)
  registerListEvents(client, server)
  registerDeleteEvent(client, server)
  await registerListCalendars(client, server)

}

main()

// Set up Express and HTTP transport
const app = express();
app.use(express.json());

app.post('/mcp', async (req, res) => {
    // Create a new transport for each request to prevent request ID collisions
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    });

    res.on('close', () => {
        transport.close();
    });

    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
});

const port = parseInt(process.env.PORT || '3000');
app.listen(port, () => {
    console.log(`Demo MCP Server running on http://localhost:${port}/mcp`);
}).on('error', error => {
    console.error('Server error:', error);
    process.exit(1);
});

