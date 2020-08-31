import type WebSocket from 'ws'

export interface IRPCCaller {
	send(data: string): void
}

export class RPCCaller implements IRPCCaller {
	constructor(private connection: WebSocket) {}

	send(data: string): void {
		console.log('send!')
		this.connection.send(data)
		console.log('this.connection.send(data)', data)
	}
}
