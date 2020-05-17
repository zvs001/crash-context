

### install

`yarn add crash-context`


### Usage

Wrap your function:

```typescript
import { createCrashContext } from 'crash-context'

function getUser(user_id) {
   throw new Error('Blah')
}
 
export default createCrashContext(getUser)
```

You will get additional context info about your crash. Example:
```
[Crash Context] getUser. Params: some_id_999999

Error: No Match.
    ...
``` 


You can wrap multiple functions:
```
import { createCrashContextForAll } from 'crash-context'

export default createCrashContextForAll({
  getUser,
  doOneFn,
  doTwoFn,
  doThreeFn,
})
```

### Context Point
Lib creates default context, that will be linked to project root. 
If you are using library, monorepo 
or you just want to split your code,
use this example:
 
```typescript
import { ContextPoint } from 'crash-context'
import packageJson from '../../package.json'

const ctx = new ContextPoint({
  showModuleName: true,
  moduleName: packageJson.name,
})

export const { createCrashContext, createCrashContextForAll } = ctx

export default ctx
```


### Configuration
You can add config to file. Lib will find nearest package.json file.
If you are using module design, you should create `ContextPoint`
```json
{
  "crashContext": {
    "showModuleName": true
  }
}
```
