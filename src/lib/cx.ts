type Mapping = Record<string, boolean>
type Argument = string | Mapping

export const cx = (...args: Argument[]): string => {
  const result: string[] = []

  for (const arg of args) {
    if (!arg) continue

    const processed = processArg(arg)

    if (!processed) continue

    result.push(processed)
  }

  return result.join(' ')
}

const processArg = (arg: Argument): string | undefined => {
  if (typeof arg === 'string') {
    return arg 
  }

  if (typeof arg === 'object' && arg !== null) {
    return processObj(arg)
  }

  return undefined
}

const processObj = (arg: object) => {
  const result: string[] = []

  for (const [key, value] of Object.entries(arg)) {
    if (value) result.push(key)
  }

  return result.join(' ')
}

export default cx
