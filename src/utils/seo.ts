import countriesJson from '@/data/current-license-plates.json'
import type { ICountryData } from '@/models/country.model'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type SeoEntry = {
  canonicalPath: string
  description: string
  title: string
}

const seoBaseUrl = 'https://timii.github.io/plate-atlas'
const defaultDescription =
  'Explore international vehicle registration codes and license plate formats by country, code, and continent.'
const countryData = countriesJson as ICountryData

function siteUrl(path: string): string {
  return `${seoBaseUrl}${path}`
}

function findCountryName(codeParam: string | string[] | undefined): string {
  const code = Array.isArray(codeParam) ? codeParam[0] : codeParam
  if (!code) {
    return 'Country'
  }

  // reuse shipped country data so route seo can resolve names without extra requests
  const matchedCountry = countryData.countries.find((country) => {
    return country.code.toLowerCase() === code.toLowerCase()
  })

  return matchedCountry?.country ?? code.toUpperCase()
}

function seoEntryForRoute(route: RouteLocationNormalizedLoaded): SeoEntry {
  if (route.name === 'detail') {
    const countryName = findCountryName(route.params.code)
    const detailPath = `/overview/${String(route.params.code ?? '').toLowerCase()}`

    return {
      canonicalPath: detailPath,
      title: `${countryName} License Plate Format | Plate Atlas`,
      description: `Explore license plate format details, regional identifiers, and example plates for ${countryName}.`,
    }
  }

  // treat overview as default entry for the app and fallback route metadata
  return {
    canonicalPath: '/overview',
    title: 'Plate Atlas | World License Plate Codes and Formats',
    description: defaultDescription,
  }
}

function ensureMetaElement(attributeName: 'name' | 'property', attributeValue: string): HTMLMetaElement {
  const selector = `meta[${attributeName}="${attributeValue}"]`
  const existingElement = document.head.querySelector<HTMLMetaElement>(selector)
  if (existingElement) {
    return existingElement
  }

  const metaElement = document.createElement('meta')
  metaElement.setAttribute(attributeName, attributeValue)
  document.head.append(metaElement)
  return metaElement
}

function ensureCanonicalElement(): HTMLLinkElement {
  const existingElement = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (existingElement) {
    return existingElement
  }

  const linkElement = document.createElement('link')
  linkElement.rel = 'canonical'
  document.head.append(linkElement)
  return linkElement
}

export function syncRouteSeo(route: RouteLocationNormalizedLoaded) {
  const seoEntry = seoEntryForRoute(route)
  const canonicalUrl = siteUrl(seoEntry.canonicalPath)

  // update both search and social tags from same route-derived payload
  document.title = seoEntry.title
  ensureMetaElement('name', 'description').content = seoEntry.description
  ensureMetaElement('property', 'og:title').content = seoEntry.title
  ensureMetaElement('property', 'og:description').content = seoEntry.description
  ensureMetaElement('property', 'og:url').content = canonicalUrl
  ensureMetaElement('name', 'twitter:title').content = seoEntry.title
  ensureMetaElement('name', 'twitter:description').content = seoEntry.description
  ensureCanonicalElement().href = canonicalUrl
}
