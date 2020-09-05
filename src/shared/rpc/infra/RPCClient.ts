import type WebSocket from 'ws'

export interface IRPCClient {
	send(data: string): void
}

export class RPCClient implements IRPCClient {
	constructor(private connection: WebSocket) {}

	send(data: string): void {
		this.connection.send(data)
	}
}
