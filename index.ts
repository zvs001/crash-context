import finder from 'find-package-json'
import isPromise from 'is-promise'
import _ from 'lodash'

let f = finder(__dirname)

const packageJson = f.next().value

const config = packageJson?.errorContext || {}
const { showModuleName } = config

const modulePrefix = showModuleName ? `(${packageJson.name})` : ''

function getLogData(fn: Function, params: any[]): string[] {
  let logParams: string[] = [
    '[Crash Context]',
    modulePrefix,
    `${fn.name}.`,
    'Params:',
    ...params,
  ]

  logParams = logParams.filter(item => item)

  return logParams
}

async function asyncErrorListener(promise: PromiseLike<any>, logParams: string[]) {
  try {
    await promise
  } catch (e) {
    console.error(...logParams)
  }
}

export function createCrashContext<T extends Function>(fn: T): T {
  // @ts-ignore
  return (...params) => {
    try {
      const res = fn(...params)
      if (isPromise(res)) return asyncErrorListener(res, getLogData(fn, params))
      return res
    } catch (e) {
      let logParams = getLogData(fn, params)
      console.error(...logParams)
      throw e
    }
  }
}

export function createCrashContextForAll<T extends Record<string, any>>(obj: T): T {
  Object.keys(obj).forEach(key => {
    const item = obj[key]
    if (_.isFunction(item)) {
      obj[key] = createCrashContext(item)
    }
  })

  return obj
}

export default {
  createCrashContext,
  createCrashContextForAll,
}
