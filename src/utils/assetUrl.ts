function resolveStaticAssetUrl(path?: string | null): string | null {
  if (!path) {
    return null
  }

  if (/^(?:https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) {
    return path
  }

  const normalizedPath = path.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${normalizedPath}`
}

export function pickPreferredStaticAssetUrl(localPath?: string | null, remoteUrl?: string | null): string {
  return resolveStaticAssetUrl(localPath) ?? remoteUrl ?? ''
}
