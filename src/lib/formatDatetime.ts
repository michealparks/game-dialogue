const intl = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'numeric',
  day: 'numeric',
  hour: 'numeric',
  minute: 'numeric',
})

export const formatDatetime = (datetime: number | Date): string => {
  try {
    return intl.format(datetime)
  } catch {
    return ''
  }
}
