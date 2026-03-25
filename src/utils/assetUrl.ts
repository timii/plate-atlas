export function pickMirroredAssetUrl(localPath?: string | null): string {
  // keep image loading anchored to mirrored local assets
  if (!localPath) {
    return ''
  }

  const normalizedPath = localPath.replace(/^\/+/, '')
  return `${import.meta.env.BASE_URL}${normalizedPath}`
}
