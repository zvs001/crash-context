import isPromise from 'is-promise'
import _ from 'lodash'
import asyncErrorListener from './src/lib/asyncErrorListener'
import packageConfig from './src/lib/fileWithConfig'

const fileConfig = packageConfig.crashContext || {}

interface ContextPointOptions {
  showModuleName?: boolean
  moduleName?: string
}
class ContextPoint {
  isModuleNameEnabled: boolean

  moduleName = fileConfig.name || ''

  constructor(options?: ContextPointOptions) {
    // const config = packageJson?.crashContext || {}
    const { showModuleName, moduleName } = options || {}

    this.isModuleNameEnabled = showModuleName || fileConfig.showModuleName
    if (moduleName) this.moduleName = moduleName

    this.createCrashContext = this.createCrashContext.bind(this)
    this.createCrashContextForAll = this.createCrashContextForAll.bind(this)
  }


  getLogData(fn: Function, params: any[]): string[] {
    const modulePrefix = this.isModuleNameEnabled && this.moduleName ? `(${this.moduleName})` : ''


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


  createCrashContext<T extends Function>(fn: T): T {
    // @ts-ignore
    return (...params) => {
      try {
        const res = fn(...params)
        if (isPromise(res)) return asyncErrorListener(res, this.getLogData(fn, params))
        return res
      } catch (e) {
        let logParams = this.getLogData(fn, params)
        console.error(...logParams)
        throw e
      }
    }
  }

  createCrashContextForAll<T extends Record<string, any>>(obj: T): T {
    Object.keys(obj).forEach(key => {
      const item = obj[key]
      if (_.isFunction(item)) {
        // @ts-ignore
        obj[key] = this.createCrashContext(item)
      }
    })

    return obj
  }
}

export default ContextPoint
