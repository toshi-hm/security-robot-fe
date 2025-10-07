import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useWebSocket } from '~/composables/useWebSocket'
import type { Socket } from 'socket.io-client'

describe('useWebSocket', () => {
  let mockSocket: Partial<Socket>
  let mockIo: any

  beforeEach(() => {
    // モックSocketの作成
    mockSocket = {
      connected: false,
      on: vi.fn(),
      emit: vi.fn(),
      disconnect: vi.fn(),
    }

    // モックio関数の作成
    mockIo = vi.fn(() => mockSocket)
  })

  describe('connect', () => {
    it('creates socket connection with runtime config URL', () => {
      const { connect } = useWebSocket(mockIo)

      connect()

      expect(mockIo).toHaveBeenCalled()
    })

    it('does not create multiple connections if already connected', () => {
      mockSocket.connected = true
      const { connect } = useWebSocket(mockIo)

      connect()
      connect()

      expect(mockIo).toHaveBeenCalledTimes(1)
    })

    it('sets up connection event listeners', () => {
      const { connect } = useWebSocket(mockIo)

      connect()

      expect(mockSocket.on).toHaveBeenCalledWith('connect', expect.any(Function))
      expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
    })

    it('updates isConnected when socket connects', () => {
      const { connect, isConnected } = useWebSocket(mockIo)

      connect()

      // 'connect'イベントのコールバックを取得して実行
      const onConnectCall = (mockSocket.on as any).mock.calls.find(
        (call: any) => call[0] === 'connect'
      )
      const onConnectCallback = onConnectCall[1]
      onConnectCallback()

      expect(isConnected.value).toBe(true)
    })

    it('updates isConnected when socket disconnects', () => {
      const { connect, isConnected } = useWebSocket(mockIo)

      connect()

      // まず接続状態にする
      const onConnectCall = (mockSocket.on as any).mock.calls.find(
        (call: any) => call[0] === 'connect'
      )
      onConnectCall[1]()

      // 切断イベントを発火
      const onDisconnectCall = (mockSocket.on as any).mock.calls.find(
        (call: any) => call[0] === 'disconnect'
      )
      onDisconnectCall[1]()

      expect(isConnected.value).toBe(false)
    })
  })

  describe('disconnect', () => {
    it('disconnects socket and sets it to null', () => {
      const { connect, disconnect, socket } = useWebSocket(mockIo)

      connect()
      disconnect()

      expect(mockSocket.disconnect).toHaveBeenCalled()
      expect(socket.value).toBeNull()
    })

    it('sets isConnected to false', () => {
      const { connect, disconnect, isConnected } = useWebSocket(mockIo)

      connect()
      // 接続状態にする
      const onConnectCall = (mockSocket.on as any).mock.calls.find(
        (call: any) => call[0] === 'connect'
      )
      onConnectCall[1]()

      disconnect()

      expect(isConnected.value).toBe(false)
    })

    it('does nothing if socket is already null', () => {
      const { disconnect } = useWebSocket(mockIo)

      // disconnectを呼んでもエラーにならない
      expect(() => disconnect()).not.toThrow()
    })
  })

  describe('initial state', () => {
    it('has null socket initially', () => {
      const { socket } = useWebSocket(mockIo)

      expect(socket.value).toBeNull()
    })

    it('has isConnected false initially', () => {
      const { isConnected } = useWebSocket(mockIo)

      expect(isConnected.value).toBe(false)
    })
  })

  describe('auto connect/disconnect lifecycle', () => {
    it('does not auto-connect when created', () => {
      useWebSocket(mockIo)

      // onMountedは実際のコンポーネントマウント時にのみ動作
      // テスト環境では手動connectが必要
      expect(mockIo).not.toHaveBeenCalled()
    })
  })
})
