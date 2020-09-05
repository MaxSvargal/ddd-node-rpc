import { myController } from './rpc.setup'
import { RPCCall } from 'shared/rpc/infra/RPCCall'
import { RPCClient } from 'shared/rpc/infra/RPCClient'

import type WebSocket from 'ws'

describe('RPC', () => {
	describe('Controller with UseCase', () => {
		let send: jest.Mock<void, string[]>
		let client: RPCClient

		beforeEach(() => {
			// Infra
			// On HTTP WS Client connect
			send = jest.fn()
			const conn = ({ send } as unknown) as WebSocket
			client = new RPCClient(conn)
		})

		it('with jrpc query message get result of use case', async () => {
			// On message receive
			const msg = JSON.stringify({
				jsonrpc: '2.0',
				id: '1',
				method: 'request',
				params: { id: '1', name: 'foo' },
			})

			const req = RPCCall.create(client, msg)
			expect(req.isRight()).toBe(true)
			if (req.isRight()) {
				await myController.execute(req.value)
			}

			expect(send).toHaveBeenCalled()
			expect(send).lastCalledWith(
				JSON.stringify({ jsonrpc: '2.0', id: '1', result: { ok: true, changed: { name: 'foo' } } }),
			)
		})

		it('with incorrect data get error of use case', async () => {
			// On message receive
			const msg = JSON.stringify({
				jsonrpc: '2.0',
				id: '2',
				method: 'request',
				params: {},
			})

			const req = RPCCall.create(client, msg)

			expect(req.isRight()).toBe(true)
			if (req.isRight()) {
				await myController.execute(req.value)
			}

			expect(send).toHaveBeenCalled()
			expect(send).lastCalledWith(
				JSON.stringify({
					jsonrpc: '2.0',
					id: '2',
					error: { code: -32600, message: 'Invalid Request', data: 'name is null or undefined' },
				}),
			)
		})
	})
})
