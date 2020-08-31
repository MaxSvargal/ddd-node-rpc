import { RPCCaller } from './RPCCaller'
import { RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { Result } from 'shared/core/Result'
import { RPCErrorDTO, RPCResponseErrorDTO, RPCResponseSuccessDTO } from 'shared/dtos/rpc/RPCResponseDTO'

export type AnyRequestDTO = RPCRequestObjectDTO<unknown>
export type AnyResponseDTO =
	| Exclude<RPCResponseSuccessDTO<unknown>, 'jsonrpc'>
	| Exclude<RPCResponseErrorDTO<RPCErrorDTO>, 'jsonrpc'>

// TODO: Rename class to procedure?
// rename to RPCQuery
export class RPCRequest<Req extends AnyRequestDTO, Res extends AnyResponseDTO> {
	public readonly jsonrpc = '2.0'

	get id(): string {
		return this.msg.id
	}

	get method(): string {
		return this.msg.method
	}

	get params(): Req['params'] {
		return this.msg.params
	}

	// get isNotification(): boolean {
	// 	return this.id === undefined || this.id === null
	// }

	response(res: Res): void {
		const { jsonrpc, id } = this
		const msg = JSON.stringify({ jsonrpc, id, ...res })
		this.caller.send(msg)
	}

	protected constructor(protected caller: RPCCaller, private readonly msg: Req) {}

	static create<Req extends AnyRequestDTO, Res extends AnyResponseDTO>(
		caller: RPCCaller,
		props: Req,
	): Result<RPCRequest<Req, Res>> {
		// return Either
		// add guard here
		const req = new RPCRequest<Req, Res>(caller, props)
		return Result.ok(req)
	}
}
