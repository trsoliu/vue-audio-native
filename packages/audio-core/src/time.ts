export function formatMediaTime(seconds: number | null): string {
  if (seconds === null || !Number.isFinite(seconds) || seconds < 0) {
    return '--:--'
  }

  const wholeSeconds = Math.floor(seconds)
  const hours = Math.floor(wholeSeconds / 3_600)
  const minutes = Math.floor((wholeSeconds % 3_600) / 60)
  const remainder = wholeSeconds % 60
  const minuteText = String(minutes).padStart(2, '0')
  const secondText = String(remainder).padStart(2, '0')

  if (hours === 0) {
    return `${minuteText}:${secondText}`
  }

  return `${String(hours).padStart(2, '0')}:${minuteText}:${secondText}`
}
