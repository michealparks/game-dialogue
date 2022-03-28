// function that takes in a date and n number of days
// returns a new date that is n number of days in the future from the given date

const daysInMonth = [
  31,
  28,
  31,
]

export const daysInFuture = (date: Date, numberOfDays: number) => {
  const day = date.getDay()
  let month = date.getMonth()
  let year = date.getFullYear()
  let dateInFuture = day + numberOfDays

  while (dateInFuture > daysInMonth[month]!) {
    dateInFuture -= daysInMonth[month]!
    month += 1

    if (month > daysInMonth.length) {
      year += 1
      month = 0
    }
  }

  return new Date(year, month, dateInFuture)
}
