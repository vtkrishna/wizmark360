export class MCPServer {
  constructor(private config: any) {}
  
  start() {
    console.log('MCP Server stub started');
  }
  
  getInfo() {
    return {
      stats: {
        tools: 0,
        resources: 0,
        promptTemplates: 0,
      }
    };
  }
}
