import type {PlainObect} from './index';

declare module 'is-plain-object' {
    export function isPlainObject(o: unknown): o is PlainObect;
}
