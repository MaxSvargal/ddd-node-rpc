import { RPCErrorDTO, RPCResponseErrorDTO } from 'shared/dtos/rpc/RPCResponseDTO'
import { ObjectUtils } from 'shared/utils/ObjectUtils'

export abstract class RPCResponseError implements RPCResponseErrorDTO<RPCErrorDTO> {
	[index: string]: unknown

	public readonly jsonrpc = '2.0'

	constructor(public readonly error: RPCErrorDTO, public readonly id: string | null) {}

	toDTO(): RPCResponseErrorDTO<RPCErrorDTO> {
		const { jsonrpc, id, error } = this

		return ObjectUtils.cleanNullables({
			jsonrpc,
			id,
			error: ObjectUtils.cleanNullables(error),
		})
	}
}

export class RPCErrorMethodNotFound extends RPCResponseError {
	constructor(id: string, data?: unknown | unknown[]) {
		super(
			{
				code: -32601,
				message: 'Method not found',
				data,
			},
			id,
		)
	}
}

export class RPCErrorInternal extends RPCResponseError {
	constructor(id: string, data?: unknown | unknown[]) {
		super(
			{
				code: -32603,
				message: 'Internal error',
				data,
			},
			id,
		)
	}
}

export class RPCErrorInvalidRequest extends RPCResponseError {
	constructor(id: string | null, data?: unknown | unknown[]) {
		super(
			{
				code: -32600,
				message: 'Invalid Request',
				data,
			},
			id,
		)
	}
}

export class RPCErrorParse extends RPCResponseError {
	constructor(data?: unknown | unknown[]) {
		super(
			{
				code: -32700,
				message: 'Parse error',
				data,
			},
			null,
		)
	}
}

export class RPCErrorServer extends RPCResponseError {
	constructor(id: string | null, data?: unknown | unknown[]) {
		super(
			{
				code: -32000,
				message: 'Server error',
				data,
			},
			id,
		)
	}
}

export class RPCErrorInvalidParams extends RPCResponseError {
	constructor(id: string | null, data?: unknown | unknown[]) {
		super(
			{
				code: -32602,
				message: 'Invalid params',
				data,
			},
			id,
		)
	}
}
