import { RPCJsonVersion } from './RPCJsonVersion'

export type RPCRequestParamsDTO = Record<string, unknown> | unknown

export interface RPCRequestNotificationDTO extends RPCJsonVersion {
	method: string
	params: RPCRequestParamsDTO
}

export interface RPCRequestObjectDTO extends RPCRequestNotificationDTO {
	id: string
}

export type RPCRequestDTO = RPCRequestObjectDTO | RPCRequestNotificationDTO
