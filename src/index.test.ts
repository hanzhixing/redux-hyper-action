import {omit, assocPath, mergeDeepRight} from 'ramda';
import {noop} from 'ramda-adjunct';
import {
    isValidAction,
    createActionId,
    createAction,
    createAsyncAction,
    createAsyncUniqueAction,
    idOfAction,
    pidOfAction,
    isAsync,
    isUnique,
    isStarted,
    isRunning,
    isFinished,
    continueWith,
    succeedWith,
    failWith,
    makeChildOf,
    isChildOf,
} from './index';

const SIGN = 'redux-hyper-action';

const PHASE_STARTED = 'started';
const PHASE_RUNNING = 'running';
const PHASE_FINISH = 'finish';

const REGEX_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REGEX_ISO8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

class Foo {}

describe('isValidAction', () => {
    const validAction = {
        type: 't',
        payload: 'p',
        error: false,
        meta: {
            sign: 'redux-hyper-action',
            id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
            pid: 'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy',
            phase: 'started',
            progress: 0,
            ctime: Date.now(),
            utime: Date.now(),
            async: true,
            uniq: true,
        },
    };

    it('should return FALSE if the action is not plain object.', () => {
        [
            'string',
            1,
            true,
            undefined,
            null,
            [],
            noop,
            new Foo(),
            /regex/,
        ].forEach(v => {
            expect(isValidAction(v)).toBe(false);
        });
    });

    it('should return FALSE if any of the required properties is missing.', () => {
        [
            omit(['type'], validAction),
            omit(['error'], validAction),
            omit(['meta'], validAction),
        ].forEach(v => {
            expect(isValidAction(v)).toBe(false);
        });
    });

    it ('should return FALSE if unknown properties have been found.', () => {
        expect(isValidAction(assocPath(['foo'], 'bar', validAction))).toBe(false);
    });

    it('should return FALSE if the action type is not string.', () => {
        [
            1,
            true,
            undefined,
            null,
            [],
            noop,
            new Foo(),
            /regex/,
        ].forEach(v => {
            expect(isValidAction(assocPath(['type'], v, validAction))).toBe(false);
        });
    });

    it('should return FALSE if the meta is not plain object.', () => {
        [
            'string',
            1,
            true,
            undefined,
            null,
            [],
            noop,
            new Foo(),
            /regex/,
        ].forEach(v => {
            expect(isValidAction(assocPath(['meta'], v, validAction))).toBe(false);
        });
    });

    it('should return FALSE if any of the required meta properties is missing.', () => {
        [
            omit(['sign'], validAction.meta),
            omit(['id'], validAction.meta),
            omit(['ctime'], validAction.meta),
            omit(['async'], validAction.meta),
            omit(['uniq'], validAction.meta),
        ].forEach(v => {
            expect(isValidAction(assocPath(['meta'], v, validAction))).toBe(false);
        });
    });

    it ('should return FALSE if unknown meta properties have been found.', () => {
        expect(isValidAction(assocPath(['meta', 'foo'], 'bar', validAction))).toBe(false);
    });

    it('should return FALSE if the sign is not correct.', () => {
        expect(isValidAction(assocPath(['meta', 'sign'], 'x', validAction))).toBe(false);
    });

    it('should return TRUE if the action is correct pattern.', () => {
        expect(isValidAction(validAction)).toBe(true);
    });
});

describe('createActionId', () => {
    it('should return UUID string', () => {
        expect(createActionId('type')).toMatch(REGEX_UUID);
        expect(createActionId('type', 'payload')).toMatch(REGEX_UUID);
        expect(createActionId('type', 'payload', true)).toMatch(REGEX_UUID);
    });

    it('should return the same id strings for actions having the same types and payloads.', () => {
        const id1 = createActionId('type', 'payload');
        const id2 = createActionId('type', 'payload');

        expect(id2).toBe(id1);
    });

    it('should return different id strings for actions having different types and payloads.', () => {
        const id1 = createActionId('type', 'payload1');
        const id2 = createActionId('type', 'payload2');

        expect(id2).not.toBe(id1);
    });

    it('should always return different id strings, if uniq option is TRUE', () => {
        const id1 = createActionId('type', 'payload', true);
        const id2 = createActionId('type', 'payload', true);

        expect(id2).not.toBe(id1);
    });
});

describe('createAction', () => {
    const desiredSync = {
        type: 'type',
        meta: {
            sign: SIGN,
            id: expect.stringMatching(REGEX_UUID),
            ctime: expect.stringMatching(REGEX_ISO8601),
            async: false,
            uniq: false,
        },
    };

    const desiredAsync = {
        type: 'type',
        meta: {
            sign: SIGN,
            id: expect.stringMatching(REGEX_UUID),
            phase: PHASE_STARTED,
            progress: 0,
            ctime: expect.stringMatching(REGEX_ISO8601),
            async: true,
            uniq: false,
        },
    };

    it('should return an action description.', () => {
        expect(createAction('type')).toMatchObject(desiredSync);
    });

    it('should return an action description according the option argument.', () => {
        expect(createAction('type', undefined, {async: true})).toMatchObject(desiredAsync);
        expect(createAction('type', undefined, {uniq: true})).toMatchObject(mergeDeepRight(desiredSync, {
            meta: {
                uniq: true,
            },
        }));
        expect(createAction('type', undefined, {async: true, uniq: true})).toMatchObject(mergeDeepRight(desiredAsync, {
            meta: {
                uniq: true,
            },
        }));
    });
});

describe('createAsyncAction', () => {
    const desired = {
        type: 'type',
        meta: {
            sign: SIGN,
            id: expect.stringMatching(REGEX_UUID),
            phase: PHASE_STARTED,
            progress: 0,
            ctime: expect.stringMatching(REGEX_ISO8601),
            async: true,
            uniq: false,
        },
    };

    it('should return correct async action description.', () => {
        expect(createAsyncAction('type')).toMatchObject(desired);
        expect(createAsyncAction('type', 'payload')).toMatchObject(assocPath(['payload'], 'payload', desired));
    });
});

describe('createAsyncUniqueAction', () => {
    const desired = {
        type: 'type',
        meta: {
            sign: SIGN,
            id: expect.stringMatching(REGEX_UUID),
            phase: PHASE_STARTED,
            progress: 0,
            ctime: expect.stringMatching(REGEX_ISO8601),
            async: true,
            uniq: true,
        },
    };

    it('should return correct async unique action description.', () => {
        expect(createAsyncUniqueAction('type')).toMatchObject(desired);
        expect(createAsyncUniqueAction('type', 'payload')).toMatchObject(assocPath(['payload'], 'payload', desired));
    });
});

describe('idOfAction', () => {
    it('should throw error if the action is not valid', () => {
        const action = createAction('type');
        expect(() => idOfAction(assocPath(['foo'], 'bar', action))).toThrow();
    });

    it('should return the id string.', () => {
        const action = createAction('type', 'payload');

        expect(idOfAction(action)).toMatch(REGEX_UUID);
    });
});

describe('pidOfAction', () => {
    it('should throw error if the action is not valid', () => {
        const action = createAction('type');
        expect(() => pidOfAction(assocPath(['foo'], 'bar', action))).toThrow();
    });

    it('should return pid string.', () => {
        const parent = createAction('type1');
        const child = createAction('type2');

        expect(pidOfAction(makeChildOf(parent)(child))).toMatch(REGEX_UUID);
    });

    it('should return pid which equals to actual id of the parent action.', () => {
        const parent = createAction('type1');
        const child = makeChildOf(parent)(createAction('type2'));

        expect(pidOfAction(child)).toBe(idOfAction(parent));
    });
});

describe('isAsync', () => {
    it('should throw error if the action is not valid', () => {
        const action = createAction('type');
        expect(() => isAsync(assocPath(['foo'], 'bar', action))).toThrow();
    });

    it('should return correct boolean values for corresponding actions', () => {
        expect(isAsync(createAction('type'))).toBe(false);
        expect(isAsync(createAsyncAction('type'))).toBe(true);
    });
});

describe('isUnique', () => {
    it('should throw error if the action is not valid', () => {
        const action = createAction('type');
        expect(() => isUnique(assocPath(['foo'], 'bar', action))).toThrow();
    });

    it('should return correct boolean values for corresponding actions', () => {
        expect(isUnique(createAction('type'))).toBe(false);
        expect(isUnique(createAsyncUniqueAction('type'))).toBe(true);
    });
});

describe('isStarted', () => {
    const action = createAsyncAction('type', 'payload');

    it('should throw error if the action is an async action', () => {
        expect(() => isStarted(createAction('type'))).toThrow();
    });

    it('should be TRUE if the action is branch new', () => {
        expect(isStarted(action)).toBe(true);
    });

    it('should be FALSE if the action is continued', () => {
        expect(isStarted(continueWith('success')(action))).toBe(false);
    });

    it('should be FALSE if the action is succeed', () => {
        expect(isStarted(succeedWith('success')(action))).toBe(false);
    });

    it('should be FALSE if the action is failed', () => {
        expect(isStarted(failWith(new Error('failed'))(action))).toBe(false);
    });
});

describe('isRunning', () => {
    const action = createAsyncAction('type', 'payload');

    it('should throw error if the action is an async action', () => {
        expect(() => isRunning(createAction('type'))).toThrow();
    });

    it('should be FALSE if the action is branch new', () => {
        expect(isRunning(action)).toBe(false);
    });

    it('should be TRUE if the action is continued', () => {
        expect(isRunning(continueWith('continue')(action))).toBe(true);
    });

    it('should be FALSE if the action is succeed', () => {
        expect(isRunning(succeedWith('success')(action))).toBe(false);
    });

    it('should be FALSE if the action is failed', () => {
        expect(isStarted(failWith(new Error('error'))(action))).toBe(false);
    });
});

describe('isFinished', () => {
    const action = createAsyncAction('type', 'payload');

    it('should throw error if the action is an async action', () => {
        expect(() => isFinished(createAction('type'))).toThrow();
    });

    it('should be FALSE if the action is branch new', () => {
        expect(isFinished(action)).toBe(false);
    });

    it('should be FALSE if the action is continued', () => {
        expect(isFinished(continueWith('continue')(action))).toBe(false);
    });

    it('should be TRUE if the action is succeed', () => {
        expect(isFinished(succeedWith('success')(action))).toBe(true);
    });

    it('should be TRUE if the action is failed', () => {
        expect(isFinished(failWith(new Error('error'))(action))).toBe(true);
    });
});

describe('continueWith', () => {
    const action = createAsyncAction('type', 'payload');

    const payload = 'to be continue';

    const desired = {
        ...action,
        type: 'type',
        payload,
        meta: {
            ...action.meta,
            phase: PHASE_RUNNING,
            progress: 50,
            utime: expect.stringMatching(REGEX_ISO8601),
        },
    };

    it('should throw error if the action is an async action', () => {
        expect(() => continueWith(payload, 50)(createAction('type', 'payload'))).toThrow();
    });

    it('should fill meta with continue signal and new payload', () => {
        expect(continueWith(payload, 50)(action)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(continueWith(payload, 50)(action).meta.utime as string))
            .toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('succeedWith', () => {
    const action = createAsyncAction('type', 'payload');

    const payload = 'success';

    const desired = {
        ...action,
        type: 'type',
        payload: 'success',
        meta: {
            ...action.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: expect.stringMatching(REGEX_ISO8601),
        },
    };

    it('should throw error if the action is an async action', () => {
        expect(() => succeedWith(payload)(createAction('type', 'payload'))).toThrow();
    });

    it('should fill meta with finished signal and new payload', () => {
        expect(succeedWith(payload)(action)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(succeedWith(payload)(action).meta.utime as string))
            .toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('failWith', () => {
    const action = createAsyncAction('type', 'payload');

    const error = new Error('success');

    const desired = {
        ...action,
        type: 'type',
        payload: error,
        error: true,
        meta: {
            ...action.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: expect.stringMatching(REGEX_ISO8601),
        },
    };

    it('should throw error if the action is an async action', () => {
        expect(() => failWith(error)(createAction('type', 'payload'))).toThrow();
    });

    it('should fill meta with failed signal and error object as payload', () => {
        expect(failWith(error)(action)).toMatchObject(desired);
    });

    it('should generates a utime before now at most in 1 second', () => {
        expect(Date.parse(failWith(error)(action).meta.utime as string))
            .toBeGreaterThanOrEqual(Date.now() - 1000);
    });
});

describe('makeChildOf', () => {
    const parent = createAction('parent');
    const child = createAction('child');

    it('should throw error if any of the two actions is not valid.', () => {
        const invalidParent = assocPath(['foo'], 'bar', parent);
        const invalidChild = assocPath(['foo'], 'bar', child);

        expect(() => makeChildOf(parent)(invalidChild)).toThrow();
        expect(() => makeChildOf(invalidParent)(child)).toThrow();
    });

    it('should set pid of the action with the id of parent', () => {
        expect(pidOfAction(makeChildOf(parent)(child))).toBe(idOfAction(parent));
    });
});


describe('isChildOf', () => {
    const parent = createAction('parent');
    const child = makeChildOf(parent)(createAction('child'));

    const random = createAction('random');

    it('should throw error if any of the two actions is not valid.', () => {
        const invalidParent = assocPath(['foo'], 'bar', parent);
        const invalidChild = assocPath(['foo'], 'bar', child);

        expect(() => isChildOf(parent)(invalidChild)).toThrow();
        expect(() => isChildOf(invalidParent)(child)).toThrow();
    });

    it('should be TRUE if the pid of the child is the same as the id of parent', () => {
        expect(isChildOf(parent)(child)).toBe(true);
    });

    it('should be FALSE if the pid of the child is different from the id of parent', () => {
        expect(isChildOf(parent)(random)).toBe(false);
    });
});
