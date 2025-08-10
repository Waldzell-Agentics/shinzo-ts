export class MockMcpServer {
  name: string
  version: string
  _tools: Map<string, any>
  _resources: Map<string, any>
  _prompts: Map<string, any>

  constructor(name: string = 'mock-server', version: string = '1.0.0') {
    this.name = name
    this.version = version
    this._tools = new Map()
    this._resources = new Map()
    this._prompts = new Map()
  }

  registerTool(name: string, config: any, handler: Function): any {
    this._tools.set(name, { name, config, handler })
    return this
  }

  registerResource(name: string, template: any, config: any, handler: Function): any {
    this._resources.set(name, { name, template, config, handler })
    return this
  }

  registerPrompt(name: string, config: any, handler: Function): any {
    this._prompts.set(name, { name, config, handler })
    return this
  }

  // Helper methods for testing
  getToolHandler(name: string): Function | undefined {
    return this._tools.get(name)?.handler
  }

  getResourceHandler(name: string): Function | undefined {
    return this._resources.get(name)?.handler
  }

  getPromptHandler(name: string): Function | undefined {
    return this._prompts.get(name)?.handler
  }

  reset(): void {
    this._tools.clear()
    this._resources.clear()
    this._prompts.clear()
  }
}

// Helper function to create test tools
export const createTestTools = (server: MockMcpServer) => {
  server.registerTool('calculator', {
    title: 'Calculator',
    description: 'Performs basic arithmetic operations',
    inputSchema: {
      type: 'object',
      properties: {
        operation: { type: 'string', enum: ['add', 'subtract', 'multiply', 'divide'] },
        a: { type: 'number' },
        b: { type: 'number' }
      },
      required: ['operation', 'a', 'b']
    }
  }, async ({ operation, a, b }: { operation: string, a: number, b: number }) => {
    switch (operation) {
      case 'add':
        return { result: a + b }
      case 'subtract':
        return { result: a - b }
      case 'multiply':
        return { result: a * b }
      case 'divide':
        if (b === 0) throw new Error('Division by zero')
        return { result: a / b }
      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  })

  server.registerTool('failing-tool', {
    title: 'Failing Tool'
  }, async () => {
    throw new Error('Tool failed')
  })
}

// Helper function to create test resources
export const createTestResources = (server: MockMcpServer) => {
  server.registerResource('file-reader', 'file://{path}', {
    title: 'File Reader'
  }, async (params: { path: string }) => {
    if (params.path === 'error.txt') {
      throw new Error('Resource not found')
    }
    return {
      uri: `file://${params.path}`,
      content: 'This is test content',
      mimeType: 'text/plain'
    }
  })
}

// Helper function to create test prompts
export const createTestPrompts = (server: MockMcpServer) => {
  server.registerPrompt('greeting', {
    title: 'Greeting'
  }, async ({ name }: { name?: string }) => {
    return {
      messages: [
        {
          role: 'user',
          content: `Hello${name ? ` ${name}` : ''}! How are you today?`
        }
      ]
    }
  })

  server.registerPrompt('failing-prompt', {
    title: 'Failing Prompt'
  }, async () => {
    throw new Error('Prompt failed')
  })
}
