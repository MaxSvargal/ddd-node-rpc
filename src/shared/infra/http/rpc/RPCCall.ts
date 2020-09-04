import { RPCClient } from './RPCClient'
import { RPCErrorInvalidRequest, RPCErrorParse, RPCResponseError } from './RPCErrors'
import { RPCRequestNotificationDTO, RPCRequestObjectDTO } from 'shared/dtos/rpc/RPCRequestDTO'
import { Either, left, right } from 'shared/core/Result'
import { RPCErrorDTO, RPCResponseErrorDTO, RPCResponseSuccessDTO } from 'shared/dtos/rpc/RPCResponseDTO'
import { Guard } from 'shared/core/Guard'

export type AnyRequestDTO = RPCRequestObjectDTO<unknown> | RPCRequestNotificationDTO<unknown>
export type AnyResponseDTO =
	| Exclude<RPCResponseSuccessDTO, 'jsonrpc'>
	| Exclude<RPCResponseErrorDTO<RPCErrorDTO>, 'jsonrpc'>

// rename to RPCQuery
export class RPCCall<Req extends AnyRequestDTO, Res extends AnyResponseDTO> {
	public readonly jsonrpc = '2.0'

	get id(): string | null {
		// TODO: SPlit to different classes
		return (this.msg as RPCRequestObjectDTO<unknown>).id ?? null
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

	response<R extends Record<string, unknown>>(res: R): void {
		const { jsonrpc, id } = this
		const msg = JSON.stringify({ jsonrpc, id, ...res })
		this.caller.send(msg)
	}

	protected constructor(protected caller: RPCClient, private readonly msg: Req) {}

	static create<Req extends AnyRequestDTO, Res extends AnyResponseDTO>(
		client: RPCClient,
		message: string,
	): Either<RPCResponseError, RPCCall<Req, Res>> {
		try {
			const msg: Req = JSON.parse(message.toString())
			const nullGuard = Guard.againstNullOrUndefinedBulk([
				{ argument: msg.jsonrpc, argumentName: 'RPCCall.jsonrpc' },
				{ argument: msg.method, argumentName: 'RPCCall.method' },
				{ argument: msg.params, argumentName: 'RPCCall.params' },
			])

			if (nullGuard.succeeded) return right(new RPCCall<Req, Res>(client, msg))
			else return left(new RPCErrorInvalidRequest((msg as RPCRequestObjectDTO<unknown>).id ?? null, '[RPCCall]: '))
		} catch (e) {
			const err = new RPCErrorParse()
			return left(err)
		}
	}
}
