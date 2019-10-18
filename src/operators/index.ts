// Import aliased operators:
import { arrayCombine, arrayCombineApply } from './array-combine';
import { arrayCombineDynamic } from './array-combine-dynamic';
import { arrayMerge, arrayMergeApply } from './array-merge';
import { arrayMergeDynamic } from './array-merge-dynamic';
import { distinct, distinctStrictEquality } from './distinct';

// Export aliased operators:
export { arrayCombine, arrayCombineApply };
export { arrayCombineDynamic };
export { arrayMerge, arrayMergeApply };
export { arrayMergeDynamic };
export { distinct, distinctStrictEquality };

// Export aliases:
export const combine = arrayCombine;
export const combineApply = arrayCombineApply;
export const combineDynamic = arrayCombineDynamic;
export const merge = arrayMerge;
export const mergeApply = arrayMergeApply;
export const mergeDynamic = arrayMergeDynamic;
export const skip = distinct;
export const skipStrictEquality = distinctStrictEquality;

export { conditional } from './conditional';
export { debounce } from './debounce';
export { flatten } from './flatten';
export { history } from './history';
export { map } from './map';
export { objectCombineProperties } from './object-combine-properties';
export { objectPipeProperties } from './object-pipe-properties';
export { objectSplitProperties } from './object-split-properties';
export { pick } from './pick';
export { pluck } from './pluck';
export { reduce } from './reduce';
export { throttle } from './throttle';
