import { UseCaseError } from 'shared/core/UseCaseError'
import { RPCRequest } from 'shared/infra/http/rpc/RPCRequest'
import { RPCCaller } from 'shared/infra/http/rpc/RPCCaller'
import { Either, left, Result, right } from 'shared/core/Result'
import { UnexpectedError } from 'shared/core/AppError'
import { RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { RPCResponseSuccessDTO } from 'shared/dtos/rpc/RPCResponseDTO'
import { RPCController } from 'shared/infra/http/rpc/RPCController'
import type WebSocket from 'ws'
import { UseCase } from '~/shared/core/UseCase'

type MyId = string & { _type: 'MyId' }
type MyName = string & { _type: 'MyName' }

interface MyRequestParams {
	id: MyId
	name: MyName
}

interface MyResponseParams {
	ok: boolean
	changed: {
		name: MyName
	}
}

type MyRequestDTO = RPCRequestObjectDTO<MyRequestParams>
type MyResponseDTO = RPCResponseSuccessDTO<MyResponseParams>

const useCaseFabric = () => {
	class ExpectedError extends Result<UseCaseError> {
		constructor(name: string) {
			super(false, {
				message: `Cannot change name to ${name}`,
			})
		}
	}

	// domain
	type ResponseLeft = ExpectedError | UnexpectedError
	type ResponseRight = Result<MyResponseParams>
	type Response = Either<ResponseLeft, ResponseRight>

	class MyUseCase implements UseCase<MyRequestParams, Promise<Response>> {
		// constructor() {}
		public async execute(params: MyRequestParams): Promise<Response> {
			try {
				// ...exec repo calls
				await Promise.resolve(params)

				return right(
					Result.ok<MyResponseParams>({ ok: true, changed: { name: params.name } }),
				)
			} catch (err) {
				return left(new UnexpectedError(err))
			}
		}
	}

	class MyController extends RPCController {
		public readonly method = 'MyProcedure' // RPC method name

		constructor(private useCase: MyUseCase) {
			super()
		}

		// We are not sure about correctness of data of this request, so need to sanitize
		async executeImpl(req: RPCRequest<MyRequestDTO, MyResponseDTO>): Promise<void> {
			const dto: MyRequestParams = {
				id: req.params.id,
				name: <MyName>req.params.name.trim(), // validate, trim, sanitize
			}

			try {
				const result = await this.useCase.execute(dto)

				if (result.isLeft()) {
					const error = result.value
					switch (error.constructor) {
						case ExpectedError:
							return this.fail(req, error.errorValue().message)
						default:
							return this.fail(req, error.errorValue().message)
					}
				} else {
					const value: MyResponseParams = result.value.getValue()
					// const response: MyResponseDTO = RPCResponse.create<MyResponseParams>(req, value)
					this.ok<MyResponseParams>(req, value)
				}
			} catch (err) {
				return this.fail(req, err)
			}
		}
	}

	return { MyUseCase, MyController }
}

describe('RPC', () => {
	describe('ProcedureExecuter with UseCase', () => {
		it('should answer on correct request', async () => {
			const { MyUseCase, MyController } = useCaseFabric()

			// Domain
			const myUseCase = new MyUseCase(/*...repos*/)
			const myProcedure = new MyController(myUseCase)

			// Infra
			// On Client connect
			const send = jest.fn()
			const conn = ({ send } as unknown) as WebSocket
			const client = new RPCCaller(conn)

			// On message receive
			const msg: MyRequestDTO = {
				jsonrpc: '2.0',
				id: '1',
				method: 'request',
				params: { id: '1' as MyId, name: 'foo' as MyName },
			}

			const req = RPCRequest.create(client, msg)
			expect(req.isSuccess).toBe(true)
			await myProcedure.execute(req.getValue())

			expect(send.mock.calls.length).toBe(1)
			expect(send.mock.calls[0][0]).toBe(
				JSON.stringify({ jsonrpc: '2.0', id: '1', result: { ok: true, changed: { name: 'foo' } } }),
			)
		})
	})
})
