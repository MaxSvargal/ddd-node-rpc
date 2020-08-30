import { RPCJsonVersion } from './RPCJsonVersion'

export interface RPCErrorDTO {
	code: -32700 | -32600 | -32601 | -32602 | -32603 | -32000
	message: string
	data?: unknown | unknown[]
}

export type RPCResponseResultDTO = Record<string, unknown> | unknown

export interface RPCResponseSuccessDTO {
	result: RPCResponseResultDTO
	id?: string | null
}

export interface RPCResponseErrorDTO extends RPCJsonVersion {
	error: RPCErrorDTO
	id: string | null
}
