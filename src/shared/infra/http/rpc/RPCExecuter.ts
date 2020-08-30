import { RPCRequest } from './RPCRequest'
import { RPCResponse } from './RPCResponse'

export abstract class RPCExecuter {
	abstract readonly method: string
	// public readonly req: RPCRequest<Req>
	protected abstract executeImpl(req: RPCRequest<unknown>): Promise<void>
	public async execute(req: RPCRequest<unknown>): Promise<void> {
		try {
			await this.executeImpl(req)
		} catch (err) {
			console.log(`[RPCRequestProcedure]: Uncaught controller error`)
			console.log(err)
			this.fail(req, 'An unexpected error occurred')
		}
	}

	ok<T>(req: RPCRequest<unknown>, res: RPCResponse<T>, dto?: T): void {
		if (dto) console.log('no id passed')
		req.response(res.toString())
	}

	fail<T>(req: RPCRequest<unknown>, error: Error | string): void {
		req.response(err.toString())
	}
}
