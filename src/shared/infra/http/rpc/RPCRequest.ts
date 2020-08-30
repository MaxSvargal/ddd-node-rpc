import { RPCCaller } from './RPCCaller'
import { RPCResponseError } from './RPCErrors'
import { RPCResponse } from './RPCResponse'
import { RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { Result } from 'shared/core/Result'

export class RPCRequest<Req extends RPCRequestObjectDTO> {
	get id(): string {
		return this.msg.id
	}

	get method(): string {
		return this.msg.method
	}

	get params(): Req['params'] {
		return this.msg.params
	}

	response(res: RPCResponse | RPCResponseError): void {
		this.caller.send(res.toString())
	}

	protected constructor(protected caller: RPCCaller, private readonly msg: RPCRequestObjectDTO) {}

	static create<Props extends RPCRequestObjectDTO>(
		caller: RPCCaller,
		props: RPCRequestObjectDTO,
	): Result<RPCRequest<Props>> {
		// return Either
		// add guard here
		const req = new RPCRequest<Props>(caller, props)
		return Result.ok(req)
	}
}
