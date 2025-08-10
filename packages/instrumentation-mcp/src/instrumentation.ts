import { TelemetryManager } from './telemetry'
import { Span, SpanStatusCode } from '@opentelemetry/api'
import { generateUuid, getRuntimeInfo } from './utils'
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp'

export class McpServerInstrumentation {
  private telemetryManager: TelemetryManager
  private server: McpServer
  private isInstrumented: boolean = false

  constructor(server: McpServer, telemetryManager: TelemetryManager) {
    this.server = server
    this.telemetryManager = telemetryManager
  }

  public instrument(): void {
    if (this.isInstrumented) return

    this.instrumentTools()
    // this.instrumentCompletions()
    // this.instrumentLogs()
    // this.instrumentNotifications()
    // this.instrumentPings()
    this.instrumentPrompts()
    this.instrumentResources()
    // this.instrumentRoots()
    // this.instrumentSampling()
    this.isInstrumented = true
  }

  private instrumentTools(): void {
    if (typeof this.server.registerTool !== 'function') {
      return
    }
  
    const originalRegisterTool = this.server.registerTool.bind(this.server)

    this.server.registerTool = (name: string, config: any, handler: (...args: any[]) => any): any => {
      const wrappedHandler = this.createInstrumentedHandler(handler, 'tools/call', name)
      return originalRegisterTool(name, config, wrappedHandler)
    }
  }

  private instrumentPrompts(): void {
    if (typeof this.server.registerPrompt !== 'function') {
      return
    }

    const originalRegisterPrompt = this.server.registerPrompt.bind(this.server)

    this.server.registerPrompt = (name: string, config: any, handler: (...args: any[]) => any): any => {
      const wrappedHandler = this.createInstrumentedHandler(handler, 'prompts/call', name)
      return originalRegisterPrompt(name, config, wrappedHandler)
    }
  }

  private instrumentResources(): void {
    if (typeof this.server.registerResource !== 'function') {
      return
    }

    const originalRegisterResource = this.server.registerResource.bind(this.server)

    this.server.registerResource = (name: string, template: any, config: any, handler: (...args: any[]) => any): any => {
      const wrappedHandler = this.createInstrumentedHandler(handler, 'resources/call', name)
      return originalRegisterResource(name, template, config, wrappedHandler)
    }
  }

  // TODO: Add instrumentation for other registerable methods if they exist
  // e.g. registerCompletion, registerLog, etc.

  private createInstrumentedHandler(originalHandler: (...args: any[]) => any, method: string, name: string): (...args: any[]) => any {
    const { address, port } = getRuntimeInfo()

    const [methodType, _] = method.split('/')

    const baseAttributes = {
      'mcp.method.name': method,
      [`mcp.${methodType}.name`]: name
    }

    const recordHistogram = this.telemetryManager.getHistogram('mcp.server.operation.duration', {
      description: 'MCP request or notification duration as observed on the receiver from the time it was received until the result or ack is sent.',
      unit: 'ms'
    })

    const incrementCounter = this.telemetryManager.getIncrementCounter(`${method} ${name}`, {
      description: 'MCP request or notification count as observed on the receiver.',
      unit: 'calls'
    })

    return async (params: any) => {
      const spanAttributes = {
        ...baseAttributes,
        'mcp.request.id': generateUuid(),
        'client.address': address,
        ...(port ? { 'client.port': port } : {}),
        ...(this.telemetryManager.getArgumentAttributes(params))
      }

      return this.telemetryManager.startActiveSpan(`${method} ${name}`, spanAttributes, async (span: Span) => {
        incrementCounter(1)

        let result: any
        let error: any

        const startTime = Date.now()

        try {
          result = await originalHandler.apply(this.server, [params])
          span.setStatus({ code: SpanStatusCode.OK })
        } catch (e) {
          error = e;
          span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message })
          span.setAttribute('error.type', (error as Error).name)
        }

        const endTime = Date.now()
        const duration = endTime - startTime

        recordHistogram(duration, {
          ...baseAttributes,
          'error.type': error ? (error as Error).name : undefined
        })

        span.end()

        if (error) throw error

        return result
      })
    }
  }
}
