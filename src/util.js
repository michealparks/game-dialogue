/**
  * Promisify setTimeout. Sleeps for n seconds.
  * @param {number} seconds
  * @returns {Promise}
  */
export const sleep = (seconds) => {
  if (seconds === 0) return Promise.resolve()

  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000)
  })
}

/**
 * Replaces $ prefixed variables in the dialog.json file
 * @param {*} obj Object to replace variables within
 * @param {*} vars List of variables and their values
 */
export const setVariables = (obj, vars) => {
  const entries = Object.entries(vars)

  return JSON.parse(JSON.stringify(obj), (key, value) => {
    if (!Array.isArray(value)) return value

    for (const [varkey, varval] of entries) {
      const i = value.indexOf(varkey)
      if (i !== -1) {
        value.splice(i, 1)
        value = [...value, ...varval]
      }
    }

    return value
  })
}

/**
 * Returns a human readable date.
 * @param {string} datetime
 */
export const formatDatetime = (datetime) => {
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(datetime)
  } catch (err) {
    return ''
  }
}
