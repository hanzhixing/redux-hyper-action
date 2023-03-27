import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    preset: 'ts-jest',
    testEnvironment: 'node',
    testPathIgnorePatterns: [
        '<rootDir>/dist',
    ],
};

export default config;
