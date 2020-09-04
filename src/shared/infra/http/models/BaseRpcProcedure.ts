import { RPCRequest } from '~/shared/domain/rpc/RPCRequest'
import { RPCResponse } from '~/shared/domain/rpc/RPCResponse'
import { RPCResponseError } from '~/shared/domain/rpc/RPCResponseError'

export type RPCMessage = { [key: string]: unknown }

export abstract class BaseRpcProcedure {
	constructor(public method: string) {}
	protected abstract executeImpl(message: RPCMessage): Promise<RPCResponse | RPCResponseError>

	public async execute(props: RPCRequest): Promise<RPCResponse | RPCResponseError> {
		try {
			await this.executeImpl(props)
		} catch (err) {
			console.log(`[BaseController]: Uncaught controller error`)
			console.log(err)
			this.fail(props, 'An unexpected error occurred')
		}
	}

	public fail(props: RPCMessage, error: Error | string): void {
		console.log(error)
		return res.status(500).json({
			message: error.toString(),
		})
	}
}

export class MyRpcProcedure extends BaseRpcProcedure {
	method: 'MyRpcReq'
	executeImpl(): void {}
}
