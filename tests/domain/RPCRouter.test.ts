import { AnyRequestDTO, AnyResponseDTO, RPCCall } from '~/shared/rpc/infra/RPCCall'
import { RPCController } from '~/shared/rpc/infra/RPCController'
import { RPCRouter } from '~/shared/rpc/infra/RPCRouter'

describe('RPCRouter', () => {
	it('when call unavailable method', () => {
		const rpcCallResponse = jest.fn()
		const rpcCall = ({
			method: 'MyProcedure',
			params: [],
			response: rpcCallResponse,
		} as unknown) as RPCCall<AnyRequestDTO, AnyResponseDTO>

		RPCRouter.call(rpcCall)

		expect(rpcCallResponse).toHaveBeenCalledTimes(1)
		// Take out error from class
		expect(rpcCallResponse).toHaveBeenCalledWith({
			error: {
				code: -32601,
				message: 'Method not found',
			},
			jsonrpc: '2.0',
		})
	})
	it('when register controller it can be called', () => {
		class MyController extends RPCController {
			public readonly method = 'MyProcedure'
			async executeImpl(req: RPCCall<AnyRequestDTO, AnyResponseDTO>): Promise<void> {
				return Promise.resolve(req.response({ ok: true }))
			}
		}

		const controller = new MyController()
		RPCRouter.handle(controller)

		const rpcCallResponse = jest.fn()
		const rpcCall = ({
			method: 'MyProcedure',
			params: [],
			response: rpcCallResponse,
		} as unknown) as RPCCall<AnyRequestDTO, AnyResponseDTO>

		RPCRouter.call(rpcCall)

		expect(rpcCallResponse).toHaveBeenCalledTimes(1)
		expect(rpcCallResponse).toHaveBeenCalledWith({ ok: true })
	})
})
