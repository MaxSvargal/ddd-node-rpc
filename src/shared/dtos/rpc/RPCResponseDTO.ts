import { RPCJsonVersion } from './RPCJsonVersion'

export interface RPCErrorDTO extends Record<string, unknown> {
	code: number //-32700 | -32600 | -32601 | -32602 | -32603 | -32000
	message: string
	data?: unknown | unknown[]
}

export interface RPCResponseSuccessDTO {
	result: unknown
	id?: string | null
}

export interface RPCResponseErrorDTO<Error extends RPCErrorDTO> extends RPCJsonVersion {
	// [index: string]: Error | string | null
	error: Error
	id?: string | null
}
