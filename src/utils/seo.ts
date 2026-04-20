import countriesJson from '@/data/current-license-plates.json'
import type { ICountry, ICountryData } from '@/models/country.model'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

type StructuredDataEntry = Record<string, unknown>

type SeoEntry = {
  canonicalPath: string
  description: string
  structuredData: StructuredDataEntry[]
  title: string
}

const seoBaseUrl = 'https://timii.github.io/plate-atlas'
const defaultDescription =
  'Explore international vehicle registration codes and license plate formats by country, code, and continent.'
const countryData = countriesJson as ICountryData

function siteUrl(path: string): string {
  return `${seoBaseUrl}${path}`
}

function findCountry(codeParam: string | string[] | undefined): ICountry | null {
  const code = Array.isArray(codeParam) ? codeParam[0] : codeParam
  if (!code) {
    return null
  }

  // reuse shipped country data so route seo can resolve country metadata without extra requests
  return (
    countryData.countries.find((country) => {
      return country.code.toLowerCase() === code.toLowerCase()
    }) ?? null
  )
}

function findCountryName(codeParam: string | string[] | undefined): string {
  const code = Array.isArray(codeParam) ? codeParam[0] : codeParam
  if (!code) {
    return 'Country'
  }

  return findCountry(codeParam)?.country ?? code.toUpperCase()
}

function websiteSchema(): StructuredDataEntry {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Plate Atlas',
    url: siteUrl('/overview'),
    description: defaultDescription,
  }
}

function breadcrumbSchema(items: Array<{ name: string; path: string }>): StructuredDataEntry {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: siteUrl(item.path),
    })),
  }
}

function overviewStructuredData(): StructuredDataEntry[] {
  return [
    websiteSchema(),
    breadcrumbSchema([{ name: 'Countries', path: '/overview' }]),
    {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Countries | Plate Atlas',
      url: siteUrl('/overview'),
      description: defaultDescription,
      numberOfItems: countryData.countries.length,
    },
  ]
}

function detailStructuredData(
  countryName: string,
  detailPath: string,
  matchedCountry: ICountry | null,
): StructuredDataEntry[] {
  return [
    websiteSchema(),
    breadcrumbSchema([
      { name: 'Countries', path: '/overview' },
      { name: countryName, path: detailPath },
    ]),
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${countryName} License Plate Format`,
      url: siteUrl(detailPath),
      description: `Explore license plate format details, regional identifiers, and example plates for ${countryName}.`,
      isPartOf: siteUrl('/overview'),
      about: matchedCountry
        ? {
            '@type': 'Place',
            name: matchedCountry.country,
          }
        : undefined,
      keywords: matchedCountry
        ? [
            matchedCountry.country,
            matchedCountry.code,
            'license plate format',
            'vehicle registration code',
          ].join(', ')
        : 'license plate format, vehicle registration code',
    },
  ]
}

function seoEntryForRoute(route: RouteLocationNormalizedLoaded): SeoEntry {
  if (route.name === 'detail') {
    const matchedCountry = findCountry(route.params.code)
    const countryName = matchedCountry?.country ?? findCountryName(route.params.code)
    const detailPath = `/overview/${String(route.params.code ?? '').toLowerCase()}`

    return {
      canonicalPath: detailPath,
      title: `${countryName} License Plate Format | Plate Atlas`,
      description: `Explore license plate format details, regional identifiers, and example plates for ${countryName}.`,
      structuredData: detailStructuredData(countryName, detailPath, matchedCountry),
    }
  }

  // treat overview as default entry for the app and fallback route metadata
  return {
    canonicalPath: '/overview',
    title: 'Plate Atlas | World License Plate Codes and Formats',
    description: defaultDescription,
    structuredData: overviewStructuredData(),
  }
}

function ensureMetaElement(
  attributeName: 'name' | 'property',
  attributeValue: string,
): HTMLMetaElement {
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

function ensureStructuredDataElement(): HTMLScriptElement {
  const existingElement = document.head.querySelector<HTMLScriptElement>(
    'script[data-atlas-seo="structured-data"]',
  )
  if (existingElement) {
    return existingElement
  }

  const scriptElement = document.createElement('script')
  scriptElement.type = 'application/ld+json'
  scriptElement.dataset.atlasSeo = 'structured-data'
  document.head.append(scriptElement)
  return scriptElement
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

  // keep route-specific structured data in one replaceable script node
  ensureStructuredDataElement().textContent = JSON.stringify(seoEntry.structuredData)
}
