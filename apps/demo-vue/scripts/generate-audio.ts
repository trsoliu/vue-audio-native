import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const sampleRate = 44_100
const durationSeconds = 10
const sampleCount = sampleRate * durationSeconds
const bytesPerSample = 2
const dataSize = sampleCount * bytesPerSample
const wave = Buffer.alloc(44 + dataSize)

wave.write('RIFF', 0)
wave.writeUInt32LE(36 + dataSize, 4)
wave.write('WAVE', 8)
wave.write('fmt ', 12)
wave.writeUInt32LE(16, 16)
wave.writeUInt16LE(1, 20)
wave.writeUInt16LE(1, 22)
wave.writeUInt32LE(sampleRate, 24)
wave.writeUInt32LE(sampleRate * bytesPerSample, 28)
wave.writeUInt16LE(bytesPerSample, 32)
wave.writeUInt16LE(16, 34)
wave.write('data', 36)
wave.writeUInt32LE(dataSize, 40)

const notes = [55, 65.41, 73.42, 82.41, 73.42, 65.41, 61.74, 65.41]

for (let index = 0; index < sampleCount; index += 1) {
  const time = index / sampleRate
  const beat = time * 2
  const note = notes[Math.floor(beat) % notes.length] ?? notes[0] ?? 55
  const pulse = Math.exp(-((beat % 1) * 8))
  const kick = Math.sin(2 * Math.PI * (46 + 34 * pulse) * time) * pulse * 0.34
  const bass = Math.sin(2 * Math.PI * note * time) * 0.24
  const pad =
    Math.sin(2 * Math.PI * note * 2 * time) * 0.1 +
    Math.sin(2 * Math.PI * note * 3 * time) * 0.05
  const shimmer =
    Math.sin(2 * Math.PI * (440 + 55 * Math.sin(time * 0.5)) * time) *
    Math.max(0, Math.sin(Math.PI * (beat % 2))) *
    0.04
  const fade = Math.min(1, time * 2, (durationSeconds - time) * 2)
  const sample = Math.max(-1, Math.min(1, (kick + bass + pad + shimmer) * fade))
  wave.writeInt16LE(Math.round(sample * 32_767), 44 + index * bytesPerSample)
}

const outputDirectory = resolve(import.meta.dirname, '../public/audio')
await mkdir(outputDirectory, { recursive: true })
await writeFile(resolve(outputDirectory, 'neon-room.wav'), wave)

console.log(`Generated ${durationSeconds}s WAV fixture (${wave.byteLength} bytes).`)
