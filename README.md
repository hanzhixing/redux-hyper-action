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

## Convention
**`Action Instance` = `Action Type` + `Action Payload` + `(Optional)Action Time`**

**`Action Id` = generateActionId(`Action Instance)`**

## Actions
Totally compatible with [Flux Standard Action](https://github.com/redux-utilities/flux-standard-action).

> type: string
> error: boolean
> payload: PlainValue (**SHOULD NOT** be `Error`)
> meta: (See `Meta` below)

``` typescript
type PlainPrimitive = undefined | null | string | number | boolean;
type PlainObject = {[k in string]?: PlainValue};
type PlainArray = PlainValue[];
type PlainValue = PlainPrimitive | PlainObject | PlainArray;
```

## Meta

### sign
Always has a `string` value `redux-hyper-action`.

It's used to distinguish `Redux Hyper Action`s from others.

### id
A UUID string.

See `Convention` above.

### pid
Optional.

A UUID string, but parent's.

### phase
Async actions only.

`started` | `finished`

### progress
Async actions only.

Integer between 0-100.

### ctime
Create time in ISO string.

### utime
Optional.

Update time in ISO string.

### async
Boolean.

### uniq
Boolean.

## Utility functions
Usage example:

``` javascript
import {isValidAction} from 'redux-hyper-action';

isValidAction({type: 'foo', payload: 'bar'})); // false
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

### hasError

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

## Exception compare to `Flux Standard Action`
There is one exception for error handling (but not a conflict).

The `payload` field can't be an `Error` anyway, while keeping `error` field `boolean` type.

Reason:

- [Write Actions Using the Flux Standard Action Convention](https://redux.js.org/style-guide/#write-actions-using-the-flux-standard-action-convention)
- [Do Not Put Non-Serializable Values in State or Actions](https://redux.js.org/style-guide/#do-not-put-non-serializable-values-in-state-or-actions)

There is only one way to create an action indicating `Error` using `redux-hyper-action`.

``` javascript
import {createAsyncAction, failWith} from 'redux-hyper-action';

const action = createAsyncAction('type', 'payload');

const actionHasError = failWith('any contents');
```

What about sync actions created by `createAction`?

Sync actions do not have their own transitional state, so they can not be updated.
If you want, just fill the payload field with any data describing the "error", and create branch new action with `createAction`.

## Why not *_REQUEST, *_SUCCESS, *_FAILURE?
In the past, redux actions in this form were used to describe transient async process, which triggered by user interactions.

But think about this,

> How many interactions were happened when the user clicked on a button?

In fact, from the user's point of view, the transient async progress is behind the scenes process.

In other words, tracking these states is implemetation detail of the system under the UI layer.

But most of the time, we are using multiple actions to describe single user event, although not all.

For the consistency of mental models with actual user interacitons, `redux-hyper-action` chooses single action object to describing that transient async process.

It will be easier and more natural to understand action manipulations in the UI layer in this way.

## License
[MIT licensed](./LICENSE).
