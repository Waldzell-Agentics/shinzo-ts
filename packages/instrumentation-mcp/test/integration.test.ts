import { instrumentServer } from '../src/index'
import { MockMcpServer, createTestTools, createTestResources, createTestPrompts } from './mocks/MockMcpServer'
import { TelemetryConfig, ObservabilityInstance } from '../src/types'

// Mock OpenTelemetry modules to avoid real network calls
jest.mock('@opentelemetry/sdk-node', () => ({
  NodeSDK: jest.fn().mockImplementation(() => ({
    start: jest.fn(),
    shutdown: jest.fn().mockResolvedValue(undefined)
  }))
}))
jest.mock('@opentelemetry/resources', () => ({
  Resource: jest.fn(),
  hostDetector: {},
  envDetector: {},
  osDetector: {},
  serviceInstanceIdDetectorSync: {}
}))
jest.mock('@opentelemetry/sdk-trace-base', () => ({
  TraceIdRatioBasedSampler: jest.fn(),
  ConsoleSpanExporter: jest.fn(),
}))
jest.mock('@opentelemetry/exporter-trace-otlp-http', () => ({
  OTLPTraceExporter: jest.fn(),
}))
jest.mock('@opentelemetry/exporter-metrics-otlp-http', () => ({
  OTLPMetricExporter: jest.fn(),
}))
jest.mock('@opentelemetry/sdk-metrics', () => ({
  PeriodicExportingMetricReader: jest.fn(),
}))
jest.mock('@opentelemetry/api', () => ({
  trace: {
    getTracer: jest.fn().mockReturnValue({
      startActiveSpan: jest.fn().mockImplementation((name, options, fn) => fn({
        setStatus: jest.fn(),
        setAttribute: jest.fn(),
        end: jest.fn(),
      })),
    }),
  },
  metrics: {
    getMeter: jest.fn().mockReturnValue({
      createHistogram: jest.fn().mockReturnValue({ record: jest.fn() }),
      createCounter: jest.fn().mockReturnValue({ add: jest.fn() }),
    }),
  },
}));

describe('Integration Tests', () => {
  let mockServer: MockMcpServer
  let observabilityInstance: ObservabilityInstance
  let mockConfig: TelemetryConfig

  beforeEach(() => {
    mockServer = new MockMcpServer('test-mcp-server', '1.0.0')
    mockConfig = {
      serverName: 'test-mcp-service',
      serverVersion: '1.0.0',
      exporterType: 'console',
    }
    createTestTools(mockServer)
    createTestResources(mockServer)
    createTestPrompts(mockServer)
  })

  afterEach(async () => {
    if (observabilityInstance) {
      await observabilityInstance.shutdown()
    }
    mockServer.reset()
    jest.clearAllMocks()
  })

  describe('Full Integration Flow', () => {
    it('should initialize observability and instrument MCP server', () => {
      observabilityInstance = instrumentServer(mockServer as any, mockConfig)
      expect(observabilityInstance).toBeDefined()
    })

    it('should execute tool calls with instrumentation', async () => {
      observabilityInstance = instrumentServer(mockServer as any, mockConfig)
      const handler = mockServer.getToolHandler('calculator')
      expect(handler).toBeDefined()
      if(handler) {
        const result = await handler({ operation: 'add', a: 5, b: 3 })
        expect(result).toEqual({ result: 8 })
      }
    })

    it('should handle failed tool calls with instrumentation', async () => {
      observabilityInstance = instrumentServer(mockServer as any, mockConfig)
      const handler = mockServer.getToolHandler('failing-tool')
      expect(handler).toBeDefined()
      if(handler) {
        await expect(handler()).rejects.toThrow('Tool failed')
      }
    })

    it('should execute resource calls with instrumentation', async () => {
        observabilityInstance = instrumentServer(mockServer as any, mockConfig)
        const handler = mockServer.getResourceHandler('file-reader')
        expect(handler).toBeDefined()
        if(handler) {
            const result = await handler({ path: 'test.txt' })
            expect(result.content).toEqual('This is test content')
        }
    })

    it('should execute prompt calls with instrumentation', async () => {
        observabilityInstance = instrumentServer(mockServer as any, mockConfig)
        const handler = mockServer.getPromptHandler('greeting')
        expect(handler).toBeDefined()
        if(handler) {
            const result = await handler({ name: 'Integration Test' })
            expect(result.messages[0].content).toContain('Hello Integration Test!')
        }
    })

    it('should handle multiple concurrent operations', async () => {
      observabilityInstance = instrumentServer(mockServer as any, mockConfig)
      const calcHandler = mockServer.getToolHandler('calculator')
      const resourceHandler = mockServer.getResourceHandler('file-reader')
      const promptHandler = mockServer.getPromptHandler('greeting')

      expect(calcHandler).toBeDefined()
      expect(resourceHandler).toBeDefined()
      expect(promptHandler).toBeDefined()

      if(calcHandler && resourceHandler && promptHandler) {
        const promises = [
            calcHandler({ operation: 'add', a: 1, b: 2 }),
            resourceHandler({ path: 'test.txt' }),
            promptHandler({ name: 'Test' }),
        ]
        const results = await Promise.all(promises)
        expect(results).toHaveLength(3)
        expect(results[0]).toEqual({ result: 3 })
      }
    })

    it('should handle graceful shutdown', async () => {
      observabilityInstance = instrumentServer(mockServer as any, mockConfig)
      const handler = mockServer.getToolHandler('calculator')
      expect(handler).toBeDefined()
      if(handler) {
        await handler({ operation: 'add', a: 1, b: 2 })
      }
      await expect(observabilityInstance.shutdown()).resolves.not.toThrow()
    })
  })
})
