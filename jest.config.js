/* eslint-disable @typescript-eslint/no-var-requires */
module.exports = {
	testEnvironment: 'node',
	testMatch: ['**/*.steps.ts', '**/*.test.ts'],
	transform: {
		'^.+\\.(ts|tsx)$': 'ts-jest',
	},
	moduleDirectories: ['node_modules', 'src'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
