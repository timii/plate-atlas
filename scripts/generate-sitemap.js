import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const dataPath = path.join(rootDir, 'src', 'data', 'current-license-plates.json')
const publicDir = path.join(rootDir, 'public')
const sitemapPath = path.join(publicDir, 'sitemap.xml')
const siteBaseUrl = 'https://timii.github.io/plate-atlas'

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;')
}

function formatUrlEntry(location, lastModifiedDate) {
  return [
    '  <url>',
    `    <loc>${escapeXml(location)}</loc>`,
    `    <lastmod>${lastModifiedDate}</lastmod>`,
    '  </url>',
  ].join('\n')
}

async function main() {
  const currentLicensePlates = JSON.parse(await readFile(dataPath, 'utf8'))
  const lastModifiedDate = new Date(currentLicensePlates.lastUpdate).toISOString().slice(0, 10)
  const routes = [
    `${siteBaseUrl}/overview`,
    ...currentLicensePlates.countries.map((country) => {
      return `${siteBaseUrl}/overview/${country.code.toLowerCase()}`
    }),
  ]

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...routes.map((route) => formatUrlEntry(route, lastModifiedDate)),
    '</urlset>',
    '',
  ].join('\n')

  await mkdir(publicDir, { recursive: true })
  await writeFile(sitemapPath, sitemap)
}

await main()
