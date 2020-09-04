import { Either, left, Result, right } from 'shared/core/Result'
import { UnexpectedError } from 'shared/core/AppError'
import { RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { RPCResponseSuccessDTO } from 'shared/dtos/rpc/RPCResponseDTO'
import { RPCController } from 'shared/infra/http/rpc/RPCController'
import { Guard } from 'shared/core/Guard'
import { RPCErrorInvalidParams, RPCErrorInvalidRequest, RPCErrorServer } from 'shared/infra/http/rpc/RPCErrors'
import { UseCaseError } from 'shared/core/UseCaseError'
import { RPCCall } from 'shared/infra/http/rpc/RPCCall'
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
type MyResponseDTO = RPCResponseSuccessDTO // TODO: Make it generic again?

export class ExpectedError extends Result<UseCaseError> {
	constructor(msg: string) {
		super(false, {
			message: `Custom expected error: ${msg}`,
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

			if (params.id === null) {
				const err = new ExpectedError('[MyUseCase]: id is not valid')
				return left(Result.fail(err))
			}

			const resp: MyResponseParams = { ok: true, changed: { name: params.name } }
			return right(Result.ok(resp))
		} catch (err) {
			return left(new UnexpectedError(err))
		}
	}
}

export class MyController extends RPCController {
	public readonly method = 'MyProcedure' // RPC method name

	constructor(private useCase: MyUseCase) {
		super()
	}

	// We are not sure about correctness of data of this request, so need to sanitize
	async executeImpl(req: RPCCall<MyRequestDTO, MyResponseDTO>): Promise<void> {
		// console.log({req})
		const nullGuard = Guard.againstNullOrUndefinedBulk([
			{ argument: req.id, argumentName: 'id' },
			{ argument: req.params.name, argumentName: 'name' },
		])

		if (!nullGuard.succeeded) {
			const err = new RPCErrorInvalidRequest(req.id, nullGuard.message)
			return this.fail(req, err)
		} else {
			const dto: MyRequestParams = {
				id: req.params.id,
				name: <MyName>req.params.name?.trim(), // validate, trim, sanitize
			}

			try {
				const result = await this.useCase.execute(dto)

				if (result.isLeft()) {
					const error = result.value.errorValue()

					switch (error.constructor) {
						case ExpectedError:
							return this.fail(req, new RPCErrorInvalidParams(req.id, error.message))
						default:
							return this.fail(req, new RPCErrorServer(req.id, error.message))
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
}

// Domain
export const myUseCase = new MyUseCase(/* ...repos */)
export const myController = new MyController(myUseCase)
