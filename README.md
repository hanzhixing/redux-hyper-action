# Redux Hyper Action

[![MIT License](https://img.shields.io/npm/l/redux-hyper-action.svg)](https://github.com/hanzhixing/redux-hyper-action/blob/main/LICENSE)
[![npm version](https://img.shields.io/npm/v/redux-hyper-action.svg)](https://www.npmjs.com/package/redux-hyper-action)
[![npm download](https://img.shields.io/npm/dt/redux-hyper-action.svg)](https://www.npmjs.com/package/redux-hyper-action)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/redux-hyper-action.svg)](https://www.npmjs.com/package/redux-hyper-action)

## Introduction
A human-friendly advanced standard for Redux action objects.

## Installation

```bash
$ npm install --save redux-hyper-action
```

## Motivation
Prudently extends the `meta` property of [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action).

## Additional Convention
**`Action Instance` = `Action Type` + `Action Payload`**

**`Action Id` = generateActionId(`Action Instance)`**

## Actions
Totally compatible with [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action).

### meta.sign
Always has a `string` value `redux-hyper-action`.

It's important to distinguish `Redux Hyper Action`s from others.

### meta.id
A UUID string. See `Convention` above.

### meta.pid
Optional. A UUID string, but parent's.

### meta.phase

**`started` | `running` | `finish`**

### meta.progress
Integer between 0-100.

### meta.ctime
Create time in ISO string.

### meta.utime
Optional. Update time in ISO string.

### meta.async
Boolean.

### meta.uniq
Boolean.

## Utility functions
```javascript
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
} from 'redux-hyper-action';
```

### isValidAction

> (action: any) => boolean

### createActionId

> (type: string, payload?: Payload, uniq?: boolean) => string

### createAction

> (type: string, payload?: Payload, option?: Option) => Action

### createAsyncAction

> (type: string, payload?: Payload) => Action

### createAsyncUniqueAction

> (type: string, payload?: Payload) => Action

### idOfAction

> (action: Action) => string

### pidOfAction

> (action: Action) => string

### isAsync

> (action: Action) => false

### isUnique

> (action: Action) => boolean

### isStarted

> (action: Action) => boolean

### isRunning

> (action: Action) => boolean

### isFinished

> (action: Action) => boolean

### continueWith

> (payload: Payload, progress?: number) => (action: Action) => Action

### succeedWith

> (payload: Payload) => (action: Action) => Action

### failWith

> (error: Error) => (action: Action) => Action

### makeChildOf

> (parent: Action) => (child: Action) => Action

### isChildOf

> (parent: Action) => (child: Action) => boolean
