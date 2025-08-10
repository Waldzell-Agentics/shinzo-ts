import { McpServerInstrumentation } from '../src/instrumentation'
import { TelemetryManager } from '../src/telemetry'
import { MockMcpServer, createTestTools, createTestResources, createTestPrompts } from './mocks/MockMcpServer'
import { SpanStatusCode } from '@opentelemetry/api'

// Mock the telemetry manager
jest.mock('../src/telemetry', () => ({
  TelemetryManager: jest.fn().mockImplementation(() => ({
    startActiveSpan: jest.fn().mockImplementation((name, options, fn) => fn(mockSpan)),
    getHistogram: jest.fn().mockReturnValue(jest.fn()),
    getIncrementCounter: jest.fn().mockReturnValue(jest.fn()),
    getArgumentAttributes: jest.fn().mockReturnValue({}),
  })),
}));

let mockSpan: any;

describe('McpServerInstrumentation', () => {
  let mockServer: MockMcpServer
  let instrumentation: McpServerInstrumentation

  beforeEach(() => {
    mockServer = new MockMcpServer()
    const mockTelemetryManager = new TelemetryManager({
        serverName: 'test-server',
        serverVersion: '1.0.0',
    });
    instrumentation = new McpServerInstrumentation(mockServer as any, mockTelemetryManager)

    mockSpan = {
      setStatus: jest.fn(),
      setAttribute: jest.fn(),
      end: jest.fn(),
    }
  })

  afterEach(() => {
    mockServer.reset()
    jest.clearAllMocks()
  })

  describe('instrument', () => {
    it('should wrap registerTool method', () => {
      const originalRegisterTool = mockServer.registerTool
      instrumentation.instrument()
      expect(mockServer.registerTool).not.toBe(originalRegisterTool)
    })

    it('should wrap registerPrompt method', () => {
      const originalRegisterPrompt = mockServer.registerPrompt
      instrumentation.instrument()
      expect(mockServer.registerPrompt).not.toBe(originalRegisterPrompt)
    })

    it('should wrap registerResource method', () => {
      const originalRegisterResource = mockServer.registerResource
      instrumentation.instrument()
      expect(mockServer.registerResource).not.toBe(originalRegisterResource)
    })

    it('should not double-instrument', () => {
      instrumentation.instrument()
      const instrumentedRegisterTool = mockServer.registerTool
      instrumentation.instrument()
      expect(mockServer.registerTool).toBe(instrumentedRegisterTool)
    })
  })

  describe('instrumented handlers', () => {
    beforeEach(() => {
      instrumentation.instrument()
    })

    it('should instrument tool calls', async () => {
      createTestTools(mockServer)
      const handler = mockServer.getToolHandler('calculator')
      expect(handler).toBeDefined()
      if (handler) {
        const result = await handler({ operation: 'add', a: 2, b: 3 })
        expect(result).toEqual({ result: 5 })
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK })
      }
    })

    it('should instrument failing tool calls', async () => {
      createTestTools(mockServer)
      const handler = mockServer.getToolHandler('failing-tool')
      expect(handler).toBeDefined()
      if (handler) {
        await expect(handler()).rejects.toThrow('Tool failed')
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR, message: 'Tool failed' })
      }
    })

    it('should instrument resource calls', async () => {
      createTestResources(mockServer)
      const handler = mockServer.getResourceHandler('file-reader')
      expect(handler).toBeDefined()
      if (handler) {
        const result = await handler({ path: 'test.txt' })
        expect(result.content).toBe('This is test content')
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK })
      }
    })

    it('should instrument failing resource calls', async () => {
      createTestResources(mockServer)
      const handler = mockServer.getResourceHandler('file-reader')
      expect(handler).toBeDefined()
      if (handler) {
        await expect(handler({ path: 'error.txt' })).rejects.toThrow('Resource not found')
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR, message: 'Resource not found' })
      }
    })

    it('should instrument prompt calls', async () => {
      createTestPrompts(mockServer)
      const handler = mockServer.getPromptHandler('greeting')
      expect(handler).toBeDefined()
      if (handler) {
        const result = await handler({ name: 'World' })
        expect(result.messages[0].content).toContain('Hello World!')
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.OK })
      }
    })

    it('should instrument failing prompt calls', async () => {
      createTestPrompts(mockServer)
      const handler = mockServer.getPromptHandler('failing-prompt')
      expect(handler).toBeDefined()
      if (handler) {
        await expect(handler()).rejects.toThrow('Prompt failed')
        expect(mockSpan.setStatus).toHaveBeenCalledWith({ code: SpanStatusCode.ERROR, message: 'Prompt failed' })
      }
    })
  })
})
