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
  reduceParams?(...params: Parameters<T>): any
  handleLog?(params: { functionName: string; params: Parameters<T> }): string
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


  public getLogData<T extends FuncType>(fn: T, params: Parameters<T>, config?: CrashContextConfig<T>): string[] {
    const modulePrefix = this.isModuleNameEnabled && this.moduleName ? `(${this.moduleName})` : ''

    const { funcName, reduceParams, handleLog } = config || {}

    let resultParams: any[] = params
    if (reduceParams) resultParams = reduceParams(...resultParams as Parameters<T>)
    if (!_.isArray(resultParams)) resultParams = [resultParams]

    let functionName = funcName || fn.name
    if (functionName) functionName += '.'

    const handleLogParams = { functionName, params }
    const log = _.isFunction(handleLog) ? handleLog(handleLogParams) : this.getLogParams(handleLogParams)

    let logParams: string[] = [
      '[Crash Context]',
      modulePrefix,
      log,
    ]

    logParams = logParams.filter(item => item)

    return logParams
  }

  private getLogParams({ functionName, params }: { functionName: string; params: any[]}): string {
    let logParams: string[] = [
      functionName || '-',
      'Params:',
      ...params,
    ]

    return logParams.join(' ')
  }


  createCrashContext<T extends FuncType>(fn: T, config?: CrashContextConfig<T>): T {
    // @ts-ignore
    return (...params) => {
      try {
        const res = fn(...params)
        if (isPromise(res)) return asyncErrorListener(res, this.getLogData<T>(fn, params, config))
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
