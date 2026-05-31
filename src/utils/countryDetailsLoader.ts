import type { ICountryDetails } from '@/models/country.model'
import { normalizeCountryCode } from '@/utils/favoriteStorage'

// keep file discovery and request reuse in one place so overview preloading and detail loading
// always follow the same path
const countryDetailFiles = import.meta.glob<{ default: ICountryDetails }>(
  '/src/data/countries/en/*.json',
)
const availableCountryCodes = new Set(
  Object.keys(countryDetailFiles).map((path) => {
    const filename = path.split('/').pop()?.replace('.json', '') || ''
    return filename.toLowerCase()
  }),
)
const countryDetailRequests = new Map<string, Promise<ICountryDetails>>()

function countryDetailPath(code: string): string {
  return `/src/data/countries/en/${normalizeCountryCode(code)}.json`
}

export function hasCountryDetailsFile(code: string): boolean {
  return availableCountryCodes.has(normalizeCountryCode(code))
}

export function getAvailableCountryDetailCodes(): string[] {
  return [...availableCountryCodes]
}

export async function loadCountryDetails(code: string): Promise<ICountryDetails> {
  const normalizedCode = normalizeCountryCode(code)
  const existingRequest = countryDetailRequests.get(normalizedCode)
  if (existingRequest) {
    return existingRequest
  }

  const loader = countryDetailFiles[countryDetailPath(normalizedCode)]
  if (!loader) {
    throw new Error(`No detail file found for ${normalizedCode}`)
  }

  // the first caller starts the import and every later caller awaits the same promise
  // this means overview hover/touch can warm the request and detail navigation can pick it up without starting a second request
  const request = loader()
    .then((module) => module.default)
    .catch((error) => {
      // failed imports should not stay cached
      countryDetailRequests.delete(normalizedCode)
      throw error
    })

  countryDetailRequests.set(normalizedCode, request)
  return request
}

export function preloadCountryDetails(code: string): void {
  if (!hasCountryDetailsFile(code)) {
    return
  }

  // overview intent starts the same request detail navigation relies on, but doesn't await it - if the request is still pending when navigation happens, the detail page benefits from the warmed cache and fast resolution, if the request already failed or completed, the detail page also benefits from the cached result or error
  loadCountryDetails(code).catch((error) => {
    console.error('failed to preload detail json', error)
  })
}
