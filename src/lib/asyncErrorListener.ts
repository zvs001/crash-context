
export default async function asyncErrorListener(promise: PromiseLike<any>, logParams: string[]) {
  try {
    return await promise
  } catch (e) {
    console.error(...logParams)
    throw e
  }
}
