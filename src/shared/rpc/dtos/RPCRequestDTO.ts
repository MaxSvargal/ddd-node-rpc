import { RPCJsonVersion } from './RPCJsonVersion'

export interface RPCRequestNotificationDTO<Params extends unknown> extends RPCJsonVersion {
	method: string
	params: Params
}

export interface RPCRequestObjectDTO<Params extends unknown> extends RPCJsonVersion {
	id: string
	method: string
	params: Params
}

// export type RPCRequestDTO = RPCRequestObjectDTO | RPCRequestNotificationDTO
