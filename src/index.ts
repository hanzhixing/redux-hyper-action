import {isPlainObjectShallow, PlainValue} from 'plainp';
import stringify from 'fast-json-stable-stringify';
import {v4 as uuidv4, v5 as uuidv5} from 'uuid';

const SIGN = 'redux-hyper-action';

const UUID_NULL = '00000000-0000-0000-0000-000000000000';

const UUID_NAMESPACE = uuidv5(SIGN, UUID_NULL);

export type LooseOption = {
    async?: boolean;
    uniq?: boolean;
};

export type AsyncOption = LooseOption & {
    async: true;
};

export type Option = AsyncOption | LooseOption;

export type Payload = PlainValue;

export type Phase = 'started' | 'finished';

export type SyncMeta = {
    sign: typeof SIGN;
    id: string;
    pid?: string;
    ctime: string;
    utime?: string;
    async: false;
    uniq: boolean;
};

export type AsyncMeta = {
    sign: typeof SIGN;
    id: string;
    pid?: string;
    phase: Phase;
    progress: number;
    ctime: string;
    utime?: string;
    async: true;
    uniq: boolean;
};

export type Meta = SyncMeta | AsyncMeta;

export type Action<T extends string, P extends Payload = undefined, M extends Meta = SyncMeta> = {
     type: T;
     error: boolean;
     payload: P;
     meta: M;
};

export type AsyncAction<
    T extends string = string,
    P extends Payload = undefined,
> = Action<T, P, AsyncMeta>;

export type HyperAction<T extends string, P extends Payload> = Action<T, P, Meta>;

const ActionProperties = ['type', 'payload', 'error', 'meta'];
const ActionRequiredProperties = ['type', 'error', 'meta'];

const MetaProperties = ['sign', 'id', 'pid', 'phase', 'progress', 'ctime', 'utime', 'async', 'uniq'];
const MetaRequiredProperties = ['sign', 'id', 'ctime', 'async', 'uniq'];

const invalidAction = (action: unknown) => (
    `Invalid Redux Hyper Action. ${JSON.stringify(action)}! <redux-saga-mate>`
);
const invalidAsyncAction = (action: unknown) => (
    `Invalid Async Redux Hyper Action. ${JSON.stringify(action)}! <redux-saga-mate>`
);

export const isValidAction = <
    T extends string = string,
    P extends Payload = undefined,
>(action: unknown): action is Action<T, P, Meta> => {
    if (!isPlainObjectShallow(action)) {
        return false;
    }

    if (!ActionRequiredProperties.every(k => k in action)) {
        return false;
    }

    if (!Object.keys(action).every(k => ActionProperties.includes(k))) {
        return false;
    }

    const {type, error, meta} = action;

    if (typeof type !== 'string') {
        return false;
    }

    if (typeof error !== 'boolean') {
        return false;
    }

    if (!isPlainObjectShallow(meta)) {
        return false;
    }

    if (!MetaRequiredProperties.every(k => k in meta)) {
        return false;
    }

    if (!Object.keys(meta).every(k => MetaProperties.includes(k))) {
        return false;
    }

    return meta.sign === SIGN;
};

export const createActionId = (type: string, payload: Payload = undefined, uniq = false) => (
    uniq ? uuidv4() : uuidv5(stringify([type, payload]), UUID_NAMESPACE)
);

export function createAction<T extends string>(
    type: T,
): Action<T, undefined, SyncMeta>;
export function createAction<T extends string, P extends Payload>(
    type: T,
    payload: P,
): Action<T, P, SyncMeta>;
export function createAction<T extends string, P extends Payload, O extends Option>(
    type: T,
    payload: P,
    option: O
): Action<T, P, O extends AsyncOption ? AsyncMeta : SyncMeta>;
export function createAction<T extends string, P extends Payload, O extends Option>(
    type: T,
    payload?: P,
    option?: O,
) {
    const async = !!option?.async;
    const uniq = !!option?.uniq;

    const meta = async ? {
        sign: SIGN,
        id: createActionId(type, payload, uniq),
        pid: undefined,
        phase: 'started',
        progress: 0,
        ctime: (new Date()).toISOString(),
        utime: undefined,
        async,
        uniq,
    } as AsyncMeta : {
        sign: SIGN,
        id: createActionId(type, payload),
        pid: undefined,
        ctime: (new Date()).toISOString(),
        async,
        uniq,
    } as SyncMeta;

    return {
        type,
        payload,
        error: false,
        meta,
    } as Action <T, P, O extends AsyncOption ? AsyncMeta : SyncMeta>;
}

export function createAsyncAction<T extends string>(
    type: T,
): Action<T, undefined, AsyncMeta>;
export function createAsyncAction<T extends string, P extends Payload>(
    type: T,
    payload: P,
): Action<T, P, AsyncMeta>;
export function createAsyncAction<T extends string, P extends Payload>(
    type: T,
    payload?: P,
) {
    return createAction(type, payload, {async: true, uniq: false}) as Action<T, P, AsyncMeta>;
}

export function createAsyncUniqueAction<T extends string>(
    type: T,
): Action<T, undefined, AsyncMeta>;
export function createAsyncUniqueAction<T extends string, P extends Payload>(
    type: T,
    payload: P,
): Action<T, P, AsyncMeta>;
export function createAsyncUniqueAction<T extends string, P extends Payload>(
    type: T,
    payload?: P,
) {
    return createAction(type, payload, {async: true, uniq: true}) as Action<T, P, AsyncMeta>
}

export const idOfAction = <T extends string, P extends Payload>(action: HyperAction<T, P>) => {
    if (!isValidAction(action)) {
        throw new Error(invalidAction(action));
    }

    return action.meta.id;
};

export const pidOfAction = <T extends string, P extends Payload>(action: HyperAction<T, P>) => {
    if (!isValidAction(action)) {
        throw new Error(invalidAction(action));
    }

    return action.meta.pid;
};

export const isAsync = <T extends string, P extends Payload>(
    action: Action<T, P, Meta>,
): action is AsyncAction<T, P> => {
    if (!isValidAction(action)) {
        return false;
    }

    return action.meta.async;
};

export const isUnique = <T extends string, P extends Payload>(action: HyperAction<T, P>) => {
    if (!isValidAction(action)) {
        return false;
    }

    return action.meta.uniq;
};

export const isStarted = <T extends string, P extends Payload>(action: AsyncAction<T, P>) => {
    if (!isAsync(action)) {
        return false;
    }

    return action.meta.phase === 'started';
};

export const isFinished = <T extends string, P extends Payload>(action: AsyncAction<T, P>) => {
    if (!isAsync(action)) {
        return false;
    }

    return action.meta.phase === 'finished';
};

export const hasError = <T extends string, P extends Payload>(action: AsyncAction<T, P>) => {
    if (!isAsync(action)) {
        return false;
    }

    return action.error;
};

export const continueWith = <P extends PlainValue>(
    payload: P,
    progress = 0,
) => <T extends string, X extends Payload>(
    action: AsyncAction<T, X>,
) => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return {
        ...action,
        error: false,
        payload,
        meta: {
            ...action.meta,
            progress,
            utime: (new Date()).toISOString(),
        },
    } as AsyncAction<T, P>;
};

export const succeedWith = <P extends PlainValue>(
    payload: P,
) => <T extends string, X extends Payload>(
    action: AsyncAction<T, X>,
) => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return {
        ...action,
        error: false,
        payload,
        meta: {
            ...action.meta,
            phase: 'finished',
            progress: 100,
            utime: (new Date()).toISOString(),
        },
    } as AsyncAction<T, P>;
};

export const failWith = <E extends Payload>(
    error: E,
) => <T extends string, X extends Payload>(
    action: AsyncAction<T, X>,
) => {
    if (!isAsync(action)) {
        throw new Error(invalidAsyncAction(action));
    }

    return {
        ...action,
        payload: error,
        error: true,
        meta: {
            ...action.meta,
            phase: 'finished',
            progress: 100,
            utime: (new Date()).toISOString(),
        },
    } as AsyncAction<T, E>;
};

export const makeChildOf = <
    PT extends string,
    PP extends Payload,
    CT extends string,
    CP extends Payload,
>(
    parent: HyperAction<PT, PP>,
) => (
    child: HyperAction<CT, CP>,
) => {
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
    } as HyperAction<CT, CP>;
};

export const isChildOf = <
    PT extends string,
    PP extends Payload,
    CT extends string,
    CP extends Payload,
>(
    parent: HyperAction<PT, PP>,
) => (
    child: HyperAction<CT, CP>,
) => {
    if (!isValidAction(parent) || !isValidAction(child)) {
        throw new Error(invalidAction({parent, child}));
    }

    return (parent.meta.id === child.meta.pid);
};
