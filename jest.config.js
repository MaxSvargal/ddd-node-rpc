module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	// roots: ['<rootDir>/src'],
	testMatch: ['**/*.steps.ts', '**/*.test.ts'],
	moduleDirectories: ['node_modules', 'src', 'tests'],
	moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
	transform: {
		'^.+\\.(t|j)s$': 'ts-jest',
	},
	moduleNameMapper: {
		'~/(.*)': '<rootDir>/src/$1',
	},
	modulePaths: ['<rootDir>/src'],
}
