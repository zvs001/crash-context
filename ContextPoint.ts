import isPromise from 'is-promise'
import _ from 'lodash'
import asyncErrorListener from './src/lib/asyncErrorListener'
import packageConfig from './src/lib/fileWithConfig'

const fileConfig = packageConfig.crashContext || {}

interface ContextPointOptions {
  showModuleName?: boolean
  moduleName?: string
}

export interface CrashContextConfig<T extends FuncType> {
  funcName?: string
  reduceParams(...params: Parameters<T>): any
}

type FuncType = (...params: any) => any

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


  getLogData(fn: FuncType, params: any[], config?: CrashContextConfig<FuncType>): string[] {
    const modulePrefix = this.isModuleNameEnabled && this.moduleName ? `(${this.moduleName})` : ''

    const { funcName, reduceParams } = config || {}

    let resultParams = params
    if (reduceParams) resultParams = reduceParams(...resultParams)
    if (!_.isArray(resultParams)) resultParams = [resultParams]

    let functionName = funcName || fn.name
    if (functionName) functionName += '.'

    let logParams: string[] = [
      '[Crash Context]',
      modulePrefix,
      functionName,
      'Params:',
      ...resultParams,
    ]

    logParams = logParams.filter(item => item)

    return logParams
  }


  createCrashContext<T extends FuncType>(fn: T, config?: CrashContextConfig<T>): T {
    // @ts-ignore
    return (...params) => {
      try {
        const res = fn(...params)
        if (isPromise(res)) return asyncErrorListener(res, this.getLogData(fn, params, config))
        return res
      } catch (e) {
        let logParams = this.getLogData(fn, params, config)
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
