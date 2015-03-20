# Refactorings

- lib/action.js duplicates a lot of stuff from lib/walker.js for the last
  request - this makes changes error prone and creates a lot of edge cases

- cd ./lib; rin zalgo

- Instead of the very special "callbackHasBeenCalledBecauseOfAbort" thing, use
  a general callbackHasBeenCalled variable guarding against calling the callback
  twice. For example: Calling abort() on the traversal handle after the traversal
  has finished would probably call the callback a second time right now.

- rename getUri to getUrl but keep alias around (update traverson-angular as well)
  - test/

- unify attributes of errors thrown (maybe always attach the step. or the traversal state)

- never ever pass anything else into any callback if we also pass an error

- rename traversalState.body to payload to avoid confusion with step.body
