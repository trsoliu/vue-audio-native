const SAMPLE_RATE = 8_000
const DURATION_SECONDS = 1

function writeText(view: DataView, offset: number, value: string): void {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index))
  }
}

export function createToneUrl(): string {
  const samples = SAMPLE_RATE * DURATION_SECONDS
  const buffer = new ArrayBuffer(44 + samples * 2)
  const view = new DataView(buffer)
  writeText(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples * 2, true)
  writeText(view, 8, 'WAVEfmt ')
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, 1, true)
  view.setUint32(24, SAMPLE_RATE, true)
  view.setUint32(28, SAMPLE_RATE * 2, true)
  view.setUint16(32, 2, true)
  view.setUint16(34, 16, true)
  writeText(view, 36, 'data')
  view.setUint32(40, samples * 2, true)

  for (let index = 0; index < samples; index += 1) {
    const envelope = Math.max(0, 1 - index / samples)
    const value = Math.sin((index / SAMPLE_RATE) * Math.PI * 2 * 440) * envelope
    view.setInt16(44 + index * 2, Math.round(value * 0x3fff), true)
  }

  return URL.createObjectURL(new Blob([buffer], { type: 'audio/wav' }))
}
