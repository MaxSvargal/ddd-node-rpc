import { RPCJsonVersion } from './RPCJsonVersion'

export interface RPCErrorDTO {
	code: -32700 | -32600 | -32601 | -32602 | -32603 | -32000
	message: string
	data?: unknown | unknown[]
}

export interface RPCResponseSuccessDTO<Result extends unknown> {
	result: Result
	id?: string | null
}

export interface RPCResponseErrorDTO<Error extends RPCErrorDTO> extends RPCJsonVersion {
	error: Error
	id: string | null
}
