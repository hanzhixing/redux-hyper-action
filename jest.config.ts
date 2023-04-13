import type {Config} from 'jest';

const config: Config = {
    verbose: true,
    preset: 'ts-jest',
    testPathIgnorePatterns: [
        '<rootDir>/dist',
    ],
};

export default config;
