module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/*.steps.ts'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
}
