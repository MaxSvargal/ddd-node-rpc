import { RPCErrorInternal, RPCErrorMethodNotFound } from './RPCErrors'
import { RPCController } from './RPCController'
import { AnyRequestDTO, AnyResponseDTO, RPCCall } from './RPCCall'
import { RPCErrorDTO, RPCResponseErrorDTO } from '../dtos/RPCResponseDTO'

export class RPCRouter {
	static methods: Map<string, RPCController> = new Map()

	static handle(controller: RPCController): void {
		this.methods.set(controller.method, controller)
	}

	static async call(req: RPCCall<AnyRequestDTO, AnyResponseDTO>): Promise<void> {
		if (!this.methods.has(req.method)) {
			return this.error(req, new RPCErrorMethodNotFound(req.id))
		}

		try {
			await this.methods.get(req.method)?.execute(req)
		} catch (err) {
			return this.error(req, new RPCErrorInternal(req.id, err))
		}
	}

	static error(req: RPCCall<AnyRequestDTO, AnyResponseDTO>, err: RPCResponseErrorDTO<RPCErrorDTO>): void {
		req.response(err)
	}
}
