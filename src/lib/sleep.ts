/**
  * Promisify setTimeout. Sleeps for n seconds.
  */
 export const sleep = (seconds: number): Promise<void> => {
  if (seconds === 0) return Promise.resolve()

  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}
