Traverson Transforms
====================

Transforms are the central building blocks in the Traverson architecture. There are two types of transforms, synchronous and asynchronous.

Each transform only exports a single function (directly as `module.exports`). Asynchronous transforms have a property `isAsync === true`, for synchronous transforms `isAsync` is either `false` or `undefined`.

Synchronous transforms accepts only one parameter, the current traversal process `t`. The protocol to interact with a synchronous transform:
* If the transform returns `true`, it has successfully transformed `t`, processing can continue.
* If the transform returns `false`, it could not successfully transform `t`, the transform has already called `t.callback` with the appropriate error. The caller is required to stop processing immediately and do not call `t.callback` itself.

Asynchronous transforms accepts two parameters, the current traversal process `t` and a callback. The callback should take a single parameter `t`. The protocol to interact with an asynchronous transform:
* If the transform calls the given callback with `t` (might be a new instance), it has successfully transformed `t`, processing can continue.
* If the transform could not successfully transform `t`, the asynchronous transform has already called `t.callback` with the appropriate error. The callback given to the transform will never be called.

The module `lib/transforms/apply_transforms` is an engine to apply an array of transforms (synchronous and asynchronous), one after another. If all transforms can be applied successful, the callback given to  `applyTransforms` will be called. If one of the transforms fails, the processing stops. In this case, the callback given to  `applyTransforms` will never be called, instead the failing transform will call `t.callback` with the appropriate error.
