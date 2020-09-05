export class Semaphore {
	private counter = 1
	private size = 1
	private timeout = 10000
	private queue: Array<{ resolve: () => void; timer: NodeJS.Timeout }> = []

	constructor(concurrency: number, size: number, timeout: number) {
		this.counter = concurrency
		this.timeout = timeout
		this.size = size
		this.queue = []
	}

	enter(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.counter > 0) {
				this.counter--
				resolve()
				return
			}
			if (this.queue.length >= this.size) {
				reject(new Error('Semaphore queue is full'))
				return
			}
			const timer = setTimeout(() => reject(new Error('Semaphore timeout')), this.timeout)

			this.queue.push({ resolve, timer })
		})
	}

	leave(): void {
		if (this.queue.length === 0) {
			this.counter++
			return
		}

		const { resolve, timer } = this.queue.shift()!

		clearTimeout(timer)
		setTimeout(resolve, 0)
	}
}
