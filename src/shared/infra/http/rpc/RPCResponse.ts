import { RPCCaller } from './RPCCaller'
import { RPCResponseError } from './RPCErrors'
import { RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { Result } from 'shared/core/Result'
import { RPCResponseSuccessDTO } from 'shared/dtos/rpc/RPCResponseDTO'
import { RPCRequest } from './RPCRequest'

export class RPCResponse<Res extends RPCResponseSuccessDTO> {
	get id(): string {
		return this.msg.id
	}

	get result(): Res['result'] {
		return this.msg.params
  }

	protected constructor(protected caller: RPCCaller, private readonly msg: RPCRequestObjectDTO<unknown>) {}

	static create<Result extends RPCRequestObjectDTO<Result>>(
		res: RPCResponse<unknown>,
		props: ,
	): Result<RPCResult<Props>> {
		// return Either
		// add guard here
		const req = new RPCResponse<Result>(caller, props)
		return Result.ok(req)
	}
}
