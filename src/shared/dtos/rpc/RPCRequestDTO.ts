import { RPCJsonVersion } from './RPCJsonVersion'

export type RPCRequestParamsDTO<T extends unknown> = T

export interface RPCRequestNotificationDTO extends RPCJsonVersion {
	method: string
	params: RPCRequestParamsDTO<unknown>
}

export interface RPCRequestObjectDTO extends RPCJsonVersion {
	id: string
	method: string
	params: RPCRequestParamsDTO<unknown>
}

export type RPCRequestDTO = RPCRequestObjectDTO | RPCRequestNotificationDTO
