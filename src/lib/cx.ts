type Mapping = Record<string, boolean>
type Argument = string | Mapping

const cx = (...args: Argument[]): string => {
  const classes = []

  for (const arg of args) {
    if (!arg) continue

    const argType = typeof arg

    if (argType === 'string') {
      classes.push(arg)
    } else if (argType === 'object') {
      for (const [key, value] of Object.entries(arg)) {
        if (value) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}

export default cx
