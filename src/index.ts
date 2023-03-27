import {isPlainObject} from 'is-plain-object';
import stringify from 'fast-json-stable-stringify';
import {v4 as uuidv4, v5 as uuidv5} from 'uuid';

const SIGN = 'redux-hyper-action';

const UUID_NULL = '00000000-0000-0000-0000-000000000000';

const UUID_NAMESPACE = uuidv5(SIGN, UUID_NULL);

type PlainPrimitive = undefined | null | string | number | boolean;

type PlainObject = {[k in string]?: PlainValue};

type PlainArray = PlainValue[];

type PlainValue = PlainPrimitive | PlainObject | PlainArray;

type Option = {
    async?: boolean;
    uniq?: boolean;
};

type AsyncOption = Option & {
    async: true;
};

type Payload = Error | PlainValue;

type SyncMeta = {
    sign: typeof SIGN;
    id: string;
    pid?: string;
    ctime: string;
    utime?: string;
    async: false;
    uniq: boolean;
};

type AsyncMeta = {
    sign: typeof SIGN;
    id: string;
    pid?: string;
    phase: typeof PHASE_STARTED | typeof PHASE_RUNNING | typeof PHASE_FINISH;
    progress: number;
    ctime: string;
    utime?: string;
    async: true;
    uniq: boolean;
};

type Meta<O> = O extends AsyncOption ? AsyncMeta : SyncMeta;

type Action<O, P> = {
    type: string;
    error: boolean;
    payload?: P extends Error ? Error : PlainValue;
    meta: Meta<O>;
};

const PHASE_STARTED = 'started';
const PHASE_RUNNING = 'running';
const PHASE_FINISH = 'finish';

const ActionProperties = ['type', 'payload', 'error', 'meta'];
const ActionRequiredProperties = ['type', 'error', 'meta'];

const MetaProperties = ['sign', 'id', 'pid', 'phase', 'progress', 'ctime', 'utime', 'async', 'uniq'];
const MetaRequiredProperties = ['sign', 'id', 'ctime', 'async', 'uniq'];

const invalidAction = (action: unknown) => `Invalid Action. ${JSON.stringify(action)}! <redux-saga-mate>`;
const invalidAsyncAction = (action: unknown) => `Invalid Async Action. ${JSON.stringify(action)}! <redux-saga-mate>`;

export const isValidAction = (action: any): boolean => {
    if (!isPlainObject(action)) {
        return false;
    }

    if (!ActionRequiredProperties.every(k => k in action)) {
        return false;
    }

    if (!Object.keys(action).every(k => ActionProperties.includes(k))) {
        return false;
    }

    if (typeof action.type !== 'string') {
        return false;
    }

    if (!isPlainObject(action.meta)) {
        return false;
    }

    if (!MetaRequiredProperties.every(k => k in action.meta)) {
        return false;
    }

    if (!Object.keys(action.meta).every(k => MetaProperties.includes(k))) {
        return false;
    }

    return action.meta.sign === SIGN;
};

export const createActionId = (type: string, payload: Payload = undefined, uniq = false): string => (
    uniq ? uuidv4() : uuidv5(stringify([type, payload]), UUID_NAMESPACE)
);

export const createAction = <O extends Option, P extends Payload>(
    type: string,
    payload?: P,
    option?: O,
): Action<O, P> => {
    const async = !!option?.async;
    const uniq = !!option?.uniq;

    const meta = async ? {
        sign: SIGN,
        id: createActionId(type, payload, uniq),
        pid: undefined,
        phase: PHASE_STARTED,
        progress: 0,
        ctime: (new Date()).toISOString(),
        utime: undefined,
        async,
        uniq,
    } : {
        sign: SIGN,
        id: createActionId(type, payload),
        pid: undefined,
        ctime: (new Date()).toISOString(),
        async,
        uniq,
    };

    return {
        type,
        payload,
        error: payload instanceof Error,
        meta,
    } as Action<O, P>;
};

export const createAsyncAction = <P extends Payload>(type: string, payload?: P): Action<AsyncOption, P> => (
    createAction(type, payload, {async: true, uniq: false})
);

export const createAsyncUniqueAction = <P extends Payload>(type: string, payload?: P): Action<AsyncOption, P> => (
    createAction(type, payload, {async: true, uniq: true})
);

export const idOfAction = (action: Action<Option, Payload>) => {
    if (!isValidAction(action)) {
        throw new Error(invalidAction(action));
    }

    return action.meta.id;
};

export const pidOfAction = (action: Action<Option, Payload>) => {
    if (!isValidAction(action)) {
        throw new Error(invalidAction(action));
    }

    return action.meta.pid;
};

export const isAsync = (action: Action<Option, Payload>) => {
    if (!isValidAction(action)) {
        throw new Error(invalidAction(action));
    }

    return action.meta.async;
};

export const isUnique = (action: Action<Option, Payload>) => {
    if (!isValidAction(action)) {
        throw new Error(invalidAction(action));
    }

    return action.meta.uniq;
};

export const isStarted = (action: Action<AsyncOption, Payload>) => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return action.meta.phase === PHASE_STARTED;
};

export const isRunning = (action: Action<AsyncOption, Payload>) => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return action.meta.phase === PHASE_RUNNING;
};

export const isFinished = (action: Action<AsyncOption, Payload>) => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return action.meta.phase === PHASE_FINISH;
};

export const continueWith = (
    payload: PlainValue,
    progress = 0,
) => (
    action: Action<AsyncOption, Payload>,
): Action<AsyncOption, PlainValue> => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return {
        ...action,
        payload,
        meta: {
            ...action.meta,
            phase: PHASE_RUNNING,
            progress,
            utime: (new Date()).toISOString(),
        },
    };
};

export const succeedWith = (
    payload: PlainValue,
) => (
    action: Action<AsyncOption, Payload>,
): Action<AsyncOption, PlainValue> => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return {
        ...action,
        payload,
        meta: {
            ...action.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: (new Date()).toISOString(),
        },
    };
};

export const failWith = (
    error: Error,
) => (
    action: Action<AsyncOption, Payload>,
): Action<AsyncOption, Error> => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return {
        ...action,
        payload: error,
        error: true,
        meta: {
            ...action.meta,
            phase: PHASE_FINISH,
            progress: 100,
            utime: (new Date()).toISOString(),
        },
    };
};

export const makeChildOf = (
    parent: Action<Option, Payload>,
) => (
    child: Action<Option, Payload>,
): Action<Option, Payload> => {
    if (!isValidAction(parent) || !isValidAction(child)) {
        throw new Error(invalidAction({parent, child}));
    }

    return {
        ...child,
        meta: {
            ...child.meta,
            pid: idOfAction(parent),
            utime: (new Date()).toISOString(),
        },
    };
};

export const isChildOf = (
    parent: Action<Option, Payload>,
) => (
    child: Action<Option, Payload>,
): boolean => {
    if (!isValidAction(parent) || !isValidAction(child)) {
        throw new Error(invalidAction({parent, child}));
    }

    return (parent.meta.id === child.meta.pid);
};
