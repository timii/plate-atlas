const favoriteStorageKey = 'plate-atlas:favorites:v1'

function normalizeCountryCode(code: string): string {
  return code.trim().toLowerCase()
}

function normalizeFavoriteCodes(codes: string[]): string[] {
  const seenCodes = new Set<string>()

  return codes.reduce<string[]>((normalizedCodes, code) => {
    const normalizedCode = normalizeCountryCode(code)
    if (!normalizedCode || seenCodes.has(normalizedCode)) {
      return normalizedCodes
    }

    seenCodes.add(normalizedCode)
    normalizedCodes.push(normalizedCode)
    return normalizedCodes
  }, [])
}

// keep browser storage checks in one place so store logic stays focused on state updates
function canUseStorage(): boolean {
  return typeof window !== 'undefined'
}

// accept only string codes and normalize them before they reach the store
export function loadFavoriteCodes(): string[] {
  if (!canUseStorage()) {
    return []
  }

  try {
    const rawFavoriteCodes = window.localStorage.getItem(favoriteStorageKey)
    if (!rawFavoriteCodes) {
      return []
    }

    const parsedFavoriteCodes = JSON.parse(rawFavoriteCodes) as
      | Array<string | number | boolean | null | object>
      | null

    if (!Array.isArray(parsedFavoriteCodes)) {
      return []
    }

    return normalizeFavoriteCodes(
      parsedFavoriteCodes.filter((favoriteCode): favoriteCode is string => {
        return typeof favoriteCode === 'string'
      }),
    )
  } catch {
    return []
  }
}

// remove stale or duplicated codes before persisting them back to storage
export function saveFavoriteCodes(favoriteCodes: string[]) {
  if (!canUseStorage()) {
    return
  }

  const normalizedFavoriteCodes = normalizeFavoriteCodes(favoriteCodes)

  try {
    if (!normalizedFavoriteCodes.length) {
      window.localStorage.removeItem(favoriteStorageKey)
      return
    }

    window.localStorage.setItem(favoriteStorageKey, JSON.stringify(normalizedFavoriteCodes))
  } catch {}
}

// reuse the same normalization rules for route params and dataset codes
export function normalizeFavoriteCode(code: string): string {
  return normalizeCountryCode(code)
}

// keep only favorites that still exist in the current shipped dataset
export function pruneFavoriteCodes(favoriteCodes: string[], availableCodes: string[]): string[] {
  const availableCodeSet = new Set(normalizeFavoriteCodes(availableCodes))

  return normalizeFavoriteCodes(favoriteCodes).filter((favoriteCode) => {
    return availableCodeSet.has(favoriteCode)
  })
}
