export class FakeTimeRanges implements TimeRanges {
  private readonly ranges: Array<{ start: number; end: number }>

  constructor(ranges: Array<{ start: number; end: number }> = []) {
    this.ranges = ranges
  }

  get length(): number {
    return this.ranges.length
  }

  end(index: number): number {
    const range = this.ranges[index]
    if (!range) throw new DOMException('Index out of range', 'IndexSizeError')
    return range.end
  }

  start(index: number): number {
    const range = this.ranges[index]
    if (!range) throw new DOMException('Index out of range', 'IndexSizeError')
    return range.start
  }
}

export class FakeAudioElement extends EventTarget {
  autoplay = false
  buffered: TimeRanges = new FakeTimeRanges()
  currentSrc = ''
  currentTime = 0
  duration = Number.NaN
  ended = false
  error: MediaError | null = null
  loadCalls = 0
  muted = false
  paused = true
  playbackRate = 1
  preload = 'metadata'
  readyState = 0
  src = ''
  volume = 1
  playError: Error | null = null
  supportedTypes = new Map<string, CanPlayTypeResult>()

  canPlayType(type: string): CanPlayTypeResult {
    return this.supportedTypes.get(type) ?? 'maybe'
  }

  fastSeek(time: number): void {
    this.currentTime = time
  }

  load(): void {
    this.loadCalls += 1
    this.currentSrc = this.src
    this.dispatchEvent(new Event('loadstart'))
  }

  pause(): void {
    if (this.paused) return
    this.paused = true
    this.dispatchEvent(new Event('pause'))
  }

  async play(): Promise<void> {
    if (this.playError) throw this.playError
    this.paused = false
    this.dispatchEvent(new Event('play'))
    this.dispatchEvent(new Event('playing'))
  }

  removeAttribute(name: string): void {
    if (name === 'src') {
      this.src = ''
      this.currentSrc = ''
    }
  }

  emit(type: string): void {
    this.dispatchEvent(new Event(type))
  }

  asAudioElement(): HTMLAudioElement {
    return this as unknown as HTMLAudioElement
  }
}
