/** @format */

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    testEnvironmentOptions: {
        url: 'http://localhost:2001',
    },
    reporters: ['default', 'jest-junit'],
    modulePathIgnorePatterns: ['/dist', '/.template'],
}
