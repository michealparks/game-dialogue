/**
 * Replaces $ prefixed variables in the dialog.json file
 * @param {*} obj Object to replace variables within
 * @param {*} vars List of variables and their values
 */
 export const setDialogValues = (obj: object, vars: object) => {
  const entries = Object.entries(vars)

  return JSON.parse(JSON.stringify(obj), (_key, value) => {
    if (!Array.isArray(value)) return value

    let result = [...value]

    for (const [varkey, varval] of entries) {
      const i = result.indexOf(varkey)
      if (i !== -1) {
        result.splice(i, 1)
        result = [...result, ...varval]
      }
    }

    return result
  })
}
