interface CoordinatorClient {
  readonly id: string
  isExclusive(): boolean
  getGroup(): string
  pauseFromCoordinator(): void
}

type AudioCoreGlobal = typeof globalThis & {
  __trsoliuAudioCoreInstances__?: Set<CoordinatorClient>
}

function getRegistry(): Set<CoordinatorClient> {
  const root = globalThis as AudioCoreGlobal
  root.__trsoliuAudioCoreInstances__ ??= new Set<CoordinatorClient>()
  return root.__trsoliuAudioCoreInstances__
}

export function registerCoordinatorClient(client: CoordinatorClient): () => void {
  const registry = getRegistry()
  registry.add(client)
  return () => registry.delete(client)
}

export function announcePlayback(client: CoordinatorClient): void {
  if (!client.isExclusive()) return

  for (const peer of getRegistry()) {
    if (
      peer.id !== client.id &&
      peer.isExclusive() &&
      peer.getGroup() === client.getGroup()
    ) {
      peer.pauseFromCoordinator()
    }
  }
}
