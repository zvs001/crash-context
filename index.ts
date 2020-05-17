import ContextPoint from './ContextPoint'
import fileConfig from './src/lib/fileWithConfig'

const defaultContext = new ContextPoint({
  moduleName: fileConfig.name || '',
})

export const { createCrashContext, createCrashContextForAll } = defaultContext

export { ContextPoint }

export default defaultContext
