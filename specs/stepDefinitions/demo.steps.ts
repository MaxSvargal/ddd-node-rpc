import { loadFeature, defineFeature } from 'jest-cucumber'
import { AnyARecord, AnyRecord } from 'dns'

const feature = loadFeature('specs/features/demo.feature')

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number]

class Base<D extends string[]> {
	today: D | string
	// constructor() {}
	todayIs(day: ArrayElement<D>): boolean {
		return day === 'Friday'
	}
}

defineFeature(feature, (test) => {
	// let passwordValidator = new PasswordValidator();
	// let today: string = 'Sunday'
	let instance: Base<['Sunday', 'Monday', 'Friday']>
	let result: boolean

	beforeEach(() => {
		instance = new Base()
	})

	test("Sunday isn't Friday", ({ given, when, then }) => {
		given('today is Sunday', () => {
			instance.today = 'Sunday'
		})

		when("I ask whether it's Friday yet", () => {
			result = instance.todayIs('Friday')
		})

		then(/^I should be told "(.*)"$/, (arg0) => {
			expect(result).toBe(true)
		})
	})
})
