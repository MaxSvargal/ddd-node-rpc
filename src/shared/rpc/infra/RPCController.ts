import { AnyRequestDTO, AnyResponseDTO, RPCCall } from './RPCCall'
import { RPCErrorServer } from './RPCErrors'
import { RPCErrorDTO, RPCResponseErrorDTO, RPCResponseSuccessDTO } from '../dtos/RPCResponseDTO'

type AnyRPCRequest = RPCCall<AnyRequestDTO, AnyResponseDTO>
export abstract class RPCController {
	abstract readonly method: string
	// public readonly req: RPCRequest<Req>
	protected abstract executeImpl(req: AnyRPCRequest): Promise<void>
	public async execute(req: AnyRPCRequest): Promise<void> {
		try {
			await this.executeImpl(req)
		} catch (err) {
			console.log(`[RPCController]: Uncaught controller error`, err)
			this.fail(req, new RPCErrorServer(req.id, 'An unexpected error occurred'))
		}
	}

	ok<Res extends unknown>(req: AnyRPCRequest, result: Res): void {
		// if (dto) console.log('no id passed')
		req.response({ result })
	}

	fail(req: AnyRPCRequest, error: RPCResponseErrorDTO<RPCErrorDTO>): void {
		req.response({ error: error.error }) // WAT!?
	}
}
