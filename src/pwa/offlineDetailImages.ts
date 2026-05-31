import {
  type ICountry,
  type ICountryDetailExampleImages,
  isOfTypeExampleImages,
} from '@/models/country.model'
import { pickMirroredAssetUrl } from '@/utils/assetUrl'
import { hasCountryDetailsFile, loadCountryDetails } from '@/utils/countryDetailsLoader'

export const detailImageCacheName = 'plate-atlas-detail-images'

export interface ICountryOfflineImageStatus {
  code: string
  country: string
  imageUrls: string[]
  missingUrls: string[]
}

export interface IOfflineImageSummary {
  countries: ICountryOfflineImageStatus[]
  countriesWithImages: number
  missingCountries: ICountryOfflineImageStatus[]
  totalImages: number
  missingImages: number
  cacheAvailable: boolean
}

function absoluteUrl(url: string): string {
  return new URL(url, window.location.href).toString()
}

function uniqueUrls(urls: string[]): string[] {
  return [...new Set(urls.filter(Boolean).map(absoluteUrl))]
}

export function downloadableDetailImageCountries(countries: ICountry[]): ICountry[] {
  return countries
    .filter((country) => hasCountryDetailsFile(country.code))
    .sort((a, b) => a.country.localeCompare(b.country))
}

function urlsFromExampleImages(exampleImages: ICountryDetailExampleImages[]): string[] {
  return uniqueUrls(
    exampleImages.flatMap((category) => {
      return category.images.flatMap((image) => {
        return [pickMirroredAssetUrl(image.thumbLocal), pickMirroredAssetUrl(image.fullSizeLocal)]
      })
    }),
  )
}

export async function collectCountryDetailImageUrls(country: ICountry): Promise<string[]> {
  const details = await loadCountryDetails(country.code)

  if (!isOfTypeExampleImages(details)) {
    return []
  }

  return urlsFromExampleImages(details)
}

export async function cacheCountryDetailImages(
  exampleImages: ICountryDetailExampleImages[],
): Promise<number> {
  return cacheDetailImageUrls(urlsFromExampleImages(exampleImages))
}

export async function getCachedDetailImageObjectUrl(url: string): Promise<string> {
  if (!url || !('caches' in window)) {
    return ''
  }

  const cache = await caches.open(detailImageCacheName)
  const cachedResponse = await cache.match(absoluteUrl(url))

  if (!cachedResponse) {
    return ''
  }

  const blob = await cachedResponse.blob()
  return URL.createObjectURL(blob)
}

async function missingUrlsFromCache(cache: Cache, urls: string[]): Promise<string[]> {
  const missingUrls: string[] = []

  for (const url of urls) {
    const cachedResponse = await cache.match(url)

    if (!cachedResponse) {
      missingUrls.push(url)
    }
  }

  return missingUrls
}

export async function getOfflineImageSummary(countries: ICountry[]): Promise<IOfflineImageSummary> {
  if (!('caches' in window)) {
    return {
      countries: [],
      countriesWithImages: 0,
      missingCountries: [],
      totalImages: 0,
      missingImages: 0,
      cacheAvailable: false,
    }
  }

  const cache = await caches.open(detailImageCacheName)
  const statuses: ICountryOfflineImageStatus[] = []

  for (const country of countries) {
    const imageUrls = await collectCountryDetailImageUrls(country)

    if (imageUrls.length === 0) {
      continue
    }

    statuses.push({
      code: country.code,
      country: country.country,
      imageUrls,
      missingUrls: await missingUrlsFromCache(cache, imageUrls),
    })
  }

  const missingCountries = statuses.filter((status) => status.missingUrls.length > 0)

  return {
    countries: statuses,
    countriesWithImages: statuses.length,
    missingCountries,
    totalImages: statuses.reduce((total, status) => total + status.imageUrls.length, 0),
    missingImages: statuses.reduce((total, status) => total + status.missingUrls.length, 0),
    cacheAvailable: true,
  }
}

export async function cacheDetailImageUrls(
  urls: string[],
  onProgress?: (downloadedCount: number) => void,
): Promise<number> {
  if (!('caches' in window)) {
    return 0
  }

  const cache = await caches.open(detailImageCacheName)
  let downloadedCount = 0

  for (const url of uniqueUrls(urls)) {
    const existingResponse = await cache.match(url)

    if (existingResponse) {
      continue
    }

    // download is explicit because detail images can be large on mobile
    const response = await fetch(url)

    if (!response.ok) {
      throw new Error(`failed to download ${url}`)
    }

    await cache.put(url, response)
    downloadedCount += 1
    onProgress?.(downloadedCount)
  }

  return downloadedCount
}
