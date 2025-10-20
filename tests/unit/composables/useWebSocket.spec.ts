import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'

import { useWebSocket } from '~/composables/useWebSocket'
import type { TrainingRepository } from '~/libs/repositories/training/TrainingRepository'

// Mock useRuntimeConfig globally
vi.stubGlobal('useRuntimeConfig', () => ({
  public: {
    wsUrl: 'ws://localhost:8000',
  },
}))

// Mock TrainingRepository
const createMockRepository = (): TrainingRepository => ({
  create: vi.fn(),
  findAll: vi.fn(),
  findById: vi.fn().mockResolvedValue({
    id: 1,
    name: 'Test Session',
    status: 'running',
  }),
  getMetrics: vi.fn().mockResolvedValue([
    { timestep: 100, reward: 10 },
    { timestep: 200, reward: 20 },
  ]),
  stop: vi.fn(),
})

describe('useWebSocket', () => {
  let mockWebSocket: any

  beforeEach(() => {
    vi.useFakeTimers()

    // Native WebSocketのモック作成
    mockWebSocket = {
      readyState: 0,
      send: vi.fn(),
      close: vi.fn(),
      onopen: null,
      onmessage: null,
      onerror: null,
      onclose: null,
    }

    // グローバルWebSocketのモック設定
    const MockWebSocket: any = vi.fn(() => mockWebSocket)
    MockWebSocket.CONNECTING = 0
    MockWebSocket.OPEN = 1
    MockWebSocket.CLOSING = 2
    MockWebSocket.CLOSED = 3

    global.WebSocket = MockWebSocket as any
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  describe('connect', () => {
    it('creates WebSocket connection with session ID', () => {
      const { connect } = useWebSocket()

      connect(1)

      expect(global.WebSocket).toHaveBeenCalledWith(expect.stringContaining('/ws/v1/training/1'))
    })

    it('does not create multiple connections if already open', () => {
      mockWebSocket.readyState = 1 // OPEN
      const { connect } = useWebSocket()

      connect(1)
      connect(1)

      expect(global.WebSocket).toHaveBeenCalledTimes(1)
    })

    it('updates isConnected when socket opens', () => {
      const { connect, isConnected } = useWebSocket()

      connect(1)
      mockWebSocket.onopen()

      expect(isConnected.value).toBe(true)
    })

    it('handles incoming messages', () => {
      const { connect, on } = useWebSocket()
      const handler = vi.fn()

      connect(1)
      on('test_message', handler)

      const messageEvent = {
        data: JSON.stringify({ type: 'test_message', data: 'hello' }),
      }
      mockWebSocket.onmessage(messageEvent)

      expect(handler).toHaveBeenCalledWith({ type: 'test_message', data: 'hello' })
    })

    it('sets error on WebSocket error', () => {
      const { connect, error } = useWebSocket()

      connect(1)
      mockWebSocket.onerror(new Error('Connection failed'))

      expect(error.value).toBe('WebSocket connection error')
    })

    it('updates isConnected to false on close', () => {
      const { connect, isConnected } = useWebSocket()

      connect(1)
      mockWebSocket.onopen()
      mockWebSocket.onclose({ code: 1000, reason: 'Normal closure' })

      expect(isConnected.value).toBe(false)
    })
  })

  describe('disconnect', () => {
    it('closes WebSocket connection', () => {
      const { connect, disconnect } = useWebSocket()

      connect(1)
      disconnect()

      expect(mockWebSocket.close).toHaveBeenCalledWith(1000, 'Client initiated disconnect')
    })

    it('resets state after disconnect', () => {
      const { connect, disconnect, isConnected, socket } = useWebSocket()

      connect(1)
      mockWebSocket.onopen()
      disconnect()

      expect(isConnected.value).toBe(false)
      expect(socket.value).toBeNull()
    })
  })

  describe('send', () => {
    it('sends JSON message when connected', () => {
      mockWebSocket.readyState = 1 // OPEN
      const { connect, send } = useWebSocket()

      connect(1)
      send({ type: 'test', data: 'hello' })

      expect(mockWebSocket.send).toHaveBeenCalledWith('{"type":"test","data":"hello"}')
    })

    it('does not send when not connected', () => {
      const { send } = useWebSocket()

      send({ type: 'test' })

      expect(mockWebSocket.send).not.toHaveBeenCalled()
    })
  })

  describe('sendPing', () => {
    it('sends ping message', () => {
      mockWebSocket.readyState = 1 // OPEN
      const { connect, sendPing } = useWebSocket()

      connect(1)
      sendPing()

      expect(mockWebSocket.send).toHaveBeenCalledWith('{"type":"ping"}')
    })
  })

  describe('message handlers', () => {
    it('registers and calls message handler', () => {
      const { connect, on } = useWebSocket()
      const handler = vi.fn()

      on('training_progress', handler)
      connect(1)

      const messageEvent = {
        data: JSON.stringify({ type: 'training_progress', timestep: 100 }),
      }
      mockWebSocket.onmessage(messageEvent)

      expect(handler).toHaveBeenCalledWith({ type: 'training_progress', timestep: 100 })
    })

    it('removes message handler with off', () => {
      const { connect, on, off } = useWebSocket()
      const handler = vi.fn()

      on('test', handler)
      off('test')
      connect(1)

      const messageEvent = {
        data: JSON.stringify({ type: 'test' }),
      }
      mockWebSocket.onmessage(messageEvent)

      expect(handler).not.toHaveBeenCalled()
    })
  })

  describe('initial state', () => {
    it('has null socket initially', () => {
      const { socket } = useWebSocket()

      expect(socket.value).toBeNull()
    })

    it('has isConnected false initially', () => {
      const { isConnected } = useWebSocket()

      expect(isConnected.value).toBe(false)
    })

    it('has null error initially', () => {
      const { error } = useWebSocket()

      expect(error.value).toBeNull()
    })

    it('has useFallbackPolling false initially', () => {
      const { useFallbackPolling } = useWebSocket()

      expect(useFallbackPolling.value).toBe(false)
    })
  })

  describe('fallback polling', () => {
    it('starts polling after max reconnection attempts', async () => {
      const mockRepository = createMockRepository()
      const { connect, useFallbackPolling } = useWebSocket(mockRepository)

      // 初回接続
      connect(1)

      // 5回の再接続を失敗させる
      for (let i = 0; i < 5; i++) {
        mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })
        await vi.runAllTimersAsync()
      }

      // 6回目の切断で最大再接続回数に達する
      mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })

      expect(useFallbackPolling.value).toBe(true)
    })

    it('polls for metrics during fallback mode', async () => {
      const mockRepository = createMockRepository()
      const { connect, on } = useWebSocket(mockRepository)
      const metricsHandler = vi.fn()

      on('metrics', metricsHandler)

      // 初回接続
      connect(1)

      // 5回の再接続を失敗させる
      for (let i = 0; i < 5; i++) {
        mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })
        await vi.runAllTimersAsync()
      }

      // 6回目の切断で最大再接続回数に達し、ポーリング開始
      mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })

      // 3秒待機（ポーリング間隔）
      await vi.advanceTimersByTimeAsync(3000)

      expect(mockRepository.findById).toHaveBeenCalledWith(1)
      expect(mockRepository.getMetrics).toHaveBeenCalledWith(1, 10)
      expect(metricsHandler).toHaveBeenCalledWith({
        type: 'metrics',
        data: [
          { timestep: 100, reward: 10 },
          { timestep: 200, reward: 20 },
        ],
      })
    })

    it('stops polling on disconnect', async () => {
      const mockRepository = createMockRepository()
      const { connect, disconnect, useFallbackPolling } = useWebSocket(mockRepository)

      // 初回接続
      connect(1)

      // 5回の再接続を失敗させる
      for (let i = 0; i < 5; i++) {
        mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })
        await vi.runAllTimersAsync()
      }

      // 6回目の切断で最大再接続回数に達し、ポーリング開始
      mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })

      expect(useFallbackPolling.value).toBe(true)

      // 切断
      disconnect()

      expect(useFallbackPolling.value).toBe(false)
    })

    it('does not start multiple polling intervals', async () => {
      const mockRepository = createMockRepository()
      const { connect } = useWebSocket(mockRepository)

      // 初回接続
      connect(1)

      // 5回の再接続を失敗させる
      for (let i = 0; i < 5; i++) {
        mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })
        await vi.runAllTimersAsync()
      }

      // 6回目の切断で最大再接続回数に達し、ポーリング開始
      mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })

      // さらに切断イベントを発生させる
      mockWebSocket.onclose({ code: 1006, reason: 'Abnormal closure' })

      // 3秒待機
      await vi.advanceTimersByTimeAsync(3000)

      // findByIdは1回のみ呼ばれる（重複したポーリングが開始されていない）
      expect(mockRepository.findById).toHaveBeenCalledTimes(1)
    })
  })
})
