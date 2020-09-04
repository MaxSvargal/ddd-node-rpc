import { RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { RPCResponseSuccessDTO } from 'shared/dtos/rpc/RPCResponseDTO'
import type { RPCClient } from 'shared/infra/http/rpc/RPCClient'
import { RPCCall } from 'shared/infra/http/rpc/RPCCall'

describe.skip('RPCCall', () => {
	let send: jest.Mock<void, string[]>
	let client: RPCClient

	beforeEach(() => {
		send = jest.fn()
		client = ({ send } as unknown) as RPCClient
	})

	it('with correct parameters', () => {
		const msg = JSON.stringify({ jsonrpc: '2.0', method: 'subtract', params: [42, 23], id: '1' })
		const req = RPCCall.create<RPCRequestObjectDTO<unknown>, RPCResponseSuccessDTO>(client, msg)
		expect(req.isRight()).toBe(true)
		expect(req.isLeft()).toBe(false)

		if (req.isRight()) {
			const props = req.value
			expect(props.id).toBe('1')
			expect(props.method).toBe('subtract')
			expect(props.params).toEqual([42, 23])
		}
	})

	it('with incorrect method', () => {
		const msg = JSON.stringify({ jsonrpc: '2.0', params: [42, 23], id: '1' })
		const req = RPCCall.create<RPCRequestObjectDTO<unknown>, RPCResponseSuccessDTO>(client, msg)
		expect(req.isRight()).toBe(false)
		expect(req.isLeft()).toBe(true)
	})

	it('a Notification', () => {
		const msg = JSON.stringify({ jsonrpc: '2.0', method: 'update', params: [1, 2, 3, 4, 5] })
		const req = RPCCall.create(client, msg)
		expect(req.isRight()).toBe(true)
		expect(req.isLeft()).toBe(false)

		expect(req.value.id).toEqual(null)
	})

	it('with invalid JSON', () => {
		const msg = '{"jsonrpc": "2.0", "method": "foobar, "params": "bar", "baz]'
		const req = RPCCall.create(client, msg)
		expect(req.isLeft()).toBe(true)

		if (req.isLeft()) {
			const expected = {
				jsonrpc: '2.0',
				error: { code: -32700, message: 'Parse error' },
			}

			expect(req.value.toDTO()).toEqual(expected)
		}
	})
})
