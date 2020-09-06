import { Semaphore } from 'shared/rpc/infra/Semaphore'

const sleep = (msec: number) =>
	new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, msec)
	})

describe('Semaphore', () => {
	it('when add tasks in queue', async () => {
		const semaphore = new Semaphore(2, 10, 1000)

		let step = 0

		;(async () => {
			expect(step++).toBe(0)
			await semaphore.enter()
			expect(step++).toBe(1)
			await sleep(50)
			expect(step++).toBe(3)
			semaphore.leave()
			expect(step++).toBe(4)
		})()
		// .
		;(async () => {
			await semaphore.enter()
			expect(step++).toBe(2)
			await sleep(100)
			expect(step++).toBe(6)
			semaphore.leave()
			expect(step++).toBe(7)
		})()
		// .
		;(async () => {
			await semaphore.enter()
			expect(step++).toBe(5)
			await sleep(150)
			expect(step++).toBe(9)
			await sleep(200)
		})()
		// .
		;(async () => {
			await semaphore.enter()
			expect(step++).toBe(8)
			try {
				await semaphore.enter()
			} catch (err) {
				expect(step++).toBe(10)
			}
			expect(step++).toBe(11)
		})()

		await sleep(800)
	})

	it.skip('when task is out of timeout', async () => {
		const semaphore = new Semaphore(2, 10, 100)
		const exit = jest.fn()
		try {
			await semaphore.enter()
			// should be rejexted
		} catch (err) {
			console.log({ err })
			exit()
		}

		try {
			await sleep(200)
		} finally {
			semaphore.leave()
			expect(exit).toHaveBeenCalledTimes(1)
		}
	})
})
