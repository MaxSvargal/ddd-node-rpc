import { UseCaseError } from 'shared/core/UseCaseError'
import { RPCExecuter } from 'shared/infra/http/rpc/RPCExecuter'
import { RPCRequest } from 'shared/infra/http/rpc/RPCRequest'
import { RPCCaller } from 'shared/infra/http/rpc/RPCCaller'
import { Either, left, Result, right } from 'shared/core/Result'
import { UnexpectedError } from 'shared/core/AppError'
import { RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { RPCResponseSuccessDTO } from 'shared/dtos/rpc/RPCResponseDTO'
import type WebSocket from 'ws'
import { UseCase } from '~/shared/core/UseCase'

interface TestRequestProps extends RPCRequestObjectDTO {
	params: {
		id: string
		name: string
	}
}

interface TestResponseProps extends RPCResponseSuccessDTO {
	result: {
		new_name: string
		ok: boolean
	}
}

class ExpectedError extends Result<UseCaseError> {
	constructor(prop: string) {
		super(false, {
			message: `No user with the username ${prop} was found`,
		} as UseCaseError)
	}
}

const useCaseFabric = () => {
	// domain
	type ResponseLeft = ExpectedError | UnexpectedError
	type ResponseRight = Result<TestResponseProps>
	type Response = Either<ResponseLeft, ResponseRight>

	class MyUseCase implements UseCase<TestRequestProps, Promise<Response>> {
		// constructor() {}
		public async execute(params: TestRequestProps): Promise<Response> {
			try {
				// ...exec repo calls
				await Promise.resolve(params)

				return right(
					Result.ok<TestResponseProps>({ result: { new_name: 'new', ok: true } }),
				)
			} catch (err) {
				return left(new UnexpectedError(err))
			}
		}
	}

	// Add decoration for method?
	class MyProcedureExecuter extends RPCExecuter {
		public method = 'MyProcedure' // name of the method, move to DTO =(

		constructor(private useCase: MyUseCase) {
			super()
		}

		//We dont know correctness of this request
		async executeImpl(req: RPCRequest<TestRequestProps>): Promise<void> {
			// TODO: Make generic, separate type props from request
			const dto: TestRequestProps['params'] = {
				id: req.id.toString(),
				name: req.params.name.split('').join('-'), // validate simple data, trim, etc
			}

			try {
				// exec useCase
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
					// const response = RPCResponse.create<TestResponseProps>(req, result.value.getValue())
					// return this.ok<TestResponseProps>(req, response.getValue())
				}
			} catch (err) {
				return this.fail(req, err)
			}
		}
	}

	return { MyUseCase, MyProcedureExecuter }
}

describe('RPC', () => {
	describe('ProcedureExecuter with UseCase', () => {
		it('should answer on correct request', () => {
			const { MyUseCase, MyProcedureExecuter } = useCaseFabric()

			// Domain
			const myUseCase = new MyUseCase(/*...repos*/)
			const myProcedure = new MyProcedureExecuter(myUseCase)

			// Infra
			// On Client connect
			const send = jest.fn()
			const conn = ({ send } as unknown) as WebSocket
			const client = new RPCCaller(conn)

			// On message receive
			const msg = { jsonrpc: '2.0', id: '1', method: 'request', params: { arg0: 'foo' } }
			const req = RPCRequest.create(client, msg)
			expect(req.isSuccess).toBe(true)
			myProcedure.execute(req.getValue())

			expect(send.mock.calls.length).toBe(1)
			expect(send.mock.calls[0][0]).toBe({ jsonrpc: '2.0', method: 'test' })
		})
	})
})
