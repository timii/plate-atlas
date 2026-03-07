// mirror overview flags and detail images into public/images so builds and deploys do not depend on remote urls
// update local path fields in the generated json files and skip assets that already exist on disk

import { execFile } from 'node:child_process'
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
const reportFilename = 'image-sync-report.json'
const progressSummaryInterval = 25
const requestTimeoutMs = 20000
const requestSpacingMs = 400
const workerCount = 1
const knownExtensions = ['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp', '.avif', '.bin']

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(scriptDir, '..')
const overviewDataPath = path.join(rootDir, 'src', 'data', 'current-license-plates.json')
const detailDataDir = path.join(rootDir, 'src', 'data', 'countries', 'en')
const overviewImageDir = path.join(rootDir, 'public', 'images', 'overview')
const detailImageDir = path.join(rootDir, 'public', 'images', 'detail')
const reportDir = path.join(rootDir, 'reports')
const reportPath = path.join(reportDir, reportFilename)
const tempDir = path.join(rootDir, '.tmp-image-sync')

let nextRequestSlotAt = 0

const report = {
  generatedAt: new Date().toISOString(),
  overviewCountries: 0,
  detailFiles: 0,
  detailImages: 0,
  downloadedAssets: 0,
  reusedAssets: 0,
  failures: [],
}

async function main() {
  await ensureOutputDirectories()

  const overviewData = JSON.parse(await readFile(overviewDataPath, 'utf8'))
  const detailFiles = (await readdir(detailDataDir))
    .filter((entry) => entry.endsWith('.json'))
    .sort()
  const detailContents = new Map()

  report.overviewCountries = overviewData.countries.length
  report.detailFiles = detailFiles.length

  for (const fileName of detailFiles) {
    const filePath = path.join(detailDataDir, fileName)
    const parsed = JSON.parse(await readFile(filePath, 'utf8'))
    detailContents.set(fileName, parsed)
  }

  const tasks = []

  for (const country of overviewData.countries) {
    tasks.push({
      label: `overview ${country.code}`,
      run: async () => {
        return syncOverviewCountry(country)
      },
    })
  }

  for (const [fileName, fileContents] of detailContents.entries()) {
    if (!Array.isArray(fileContents)) {
      continue
    }

    const countryCode = fileName.replace(/\.json$/i, '').toLowerCase()

    fileContents.forEach((category, categoryIndex) => {
      if (!category || typeof category !== 'object' || !Array.isArray(category.images)) {
        return
      }

      category.images.forEach((image, imageIndex) => {
        report.detailImages += 1
        const itemLabel = `${countryCode.toUpperCase()} ${String(categoryIndex + 1).padStart(2, '0')}-${String(imageIndex + 1).padStart(2, '0')}`
        tasks.push({
          label: `detail ${itemLabel}`,
          run: async () => {
            return syncDetailImage({
              categoryIndex,
              countryCode,
              image,
              imageIndex,
            })
          },
        })
      })
    })
  }

  console.log(`starting image sync for ${tasks.length} assets`)
  await runTasks(tasks, workerCount)

  await writeJson(overviewDataPath, overviewData)

  for (const [fileName, fileContents] of detailContents.entries()) {
    await writeJson(path.join(detailDataDir, fileName), fileContents)
  }

  await mkdir(reportDir, { recursive: true })
  await writeJson(reportPath, report)

  const summary = [
    `downloaded assets: ${report.downloadedAssets}`,
    `reused assets: ${report.reusedAssets}`,
    `overview countries: ${report.overviewCountries}`,
    `detail image entries: ${report.detailImages}`,
    `failures: ${report.failures.length}`,
    `report: ${path.relative(rootDir, reportPath).replace(/\\/g, '/')}`,
  ]

  console.log(summary.join('\n'))

  if (report.failures.length > 0) {
    process.exitCode = 1
  }
}

// keep generated assets in folders that Vite copies into dist when building
async function ensureOutputDirectories() {
  await mkdir(overviewImageDir, { recursive: true })
  await mkdir(detailImageDir, { recursive: true })
  await mkdir(tempDir, { recursive: true })
}

async function syncOverviewCountry(country) {
  const code = sanitizeSegment(country.code)
  const asset = await downloadAsset({
    destinationBase: path.join(overviewImageDir, code),
    failureContext: {
      kind: 'overview-thumb',
      code: country.code,
      sourceFile: relativeFromRoot(overviewDataPath),
      sourceUrl: country.flagThumb,
    },
    url: country.flagThumb,
  })

  if (asset.status !== 'failed') {
    const relativePath = relativeFromPublic(asset.filePath)
    country.flagThumbLocal = relativePath
    country.flagLocal = relativePath
    return {
      code: country.code,
      outputPath: relativePath,
      status: asset.status,
    }
  }

  delete country.flagThumbLocal
  delete country.flagLocal
  return {
    code: country.code,
    reason: asset.reason,
    status: 'failed',
  }
}

async function syncDetailImage({ categoryIndex, countryCode, image, imageIndex }) {
  const baseName = `${sanitizeSegment(countryCode)}-${String(categoryIndex + 1).padStart(2, '0')}-${String(imageIndex + 1).padStart(2, '0')}`
  const countryImageDir = path.join(detailImageDir, sanitizeSegment(countryCode))
  await mkdir(countryImageDir, { recursive: true })

  const asset = await downloadAsset({
    destinationBase: path.join(countryImageDir, baseName),
    failureContext: {
      kind: 'detail-image',
      code: countryCode.toUpperCase(),
      sourceFile: relativeFromRoot(path.join(detailDataDir, `${countryCode}.json`)),
      sourceUrl: image.url,
    },
    url: image.url,
  })

  if (asset.status !== 'failed') {
    const relativePath = relativeFromPublic(asset.filePath)
    image.thumbLocal = relativePath
    image.fullSizeLocal = relativePath
    return {
      code: countryCode.toUpperCase(),
      outputPath: relativePath,
      status: asset.status,
      title: image.title || '(untitled)',
    }
  }

  delete image.thumbLocal
  delete image.fullSizeLocal
  return {
    code: countryCode.toUpperCase(),
    reason: asset.reason,
    status: 'failed',
    title: image.title || '(untitled)',
  }
}

// reuse existing files so repeated sync passes only fetch what is still missing
async function downloadAsset({ destinationBase, failureContext, url }) {
  const existingAssetPath = await findExistingAssetPath(destinationBase)
  if (existingAssetPath) {
    report.reusedAssets += 1
    return {
      filePath: existingAssetPath,
      status: 'reused',
    }
  }

  const result = await fetchRemoteFile(url)
  if (!result.ok) {
    report.failures.push({
      ...failureContext,
      attemptedUrls: [{ reason: result.reason, url }],
    })
    return {
      reason: result.reason,
      status: 'failed',
    }
  }

  const extension = determineExtension(result.finalUrl, result.contentType)
  const filePath = `${destinationBase}${extension}`
  await writeFile(filePath, result.buffer)
  report.downloadedAssets += 1
  return {
    filePath,
    status: 'downloaded',
  }
}

async function findExistingAssetPath(destinationBase) {
  for (const extension of knownExtensions) {
    const filePath = `${destinationBase}${extension}`
    try {
      await readFile(filePath)
      return filePath
    } catch {
      // continue searching other known extensions
    }
  }

  return null
}

async function fetchRemoteFile(url) {
  const tempFilePath = path.join(
    tempDir,
    `${Date.now()}-${Math.random().toString(16).slice(2)}.tmp`,
  )

  try {
    await waitForRequestSlot()
    const { stdout } = await execFileAsync(
      'curl.exe',
      [
        '-sS',
        '-L',
        '--fail',
        '--connect-timeout',
        '10',
        '--max-time',
        String(Math.ceil(requestTimeoutMs / 1000)),
        '-o',
        tempFilePath,
        '-w',
        '%{content_type}\n%{url_effective}\n',
        url,
      ],
      {
        encoding: 'utf8',
        maxBuffer: 1024 * 1024,
        windowsHide: true,
      },
    )

    const lines = stdout.trim().split(/\r?\n/)
    const contentType = lines[0] || ''
    const finalUrl = lines[1] || url
    const buffer = await readFile(tempFilePath)

    if (buffer.length === 0) {
      return {
        ok: false,
        reason: 'Empty response body',
      }
    }

    return {
      buffer,
      contentType,
      finalUrl,
      ok: true,
    }
  } catch (error) {
    const message =
      error && typeof error === 'object' && 'stderr' in error && typeof error.stderr === 'string'
        ? error.stderr.trim() || 'curl failed'
        : error instanceof Error
          ? error.message
          : String(error)

    return {
      ok: false,
      reason: message,
    }
  } finally {
    await rm(tempFilePath, { force: true })
  }
}

// throttle requests so reruns can gradually work through rate limits
async function waitForRequestSlot() {
  const now = Date.now()
  const waitMs = Math.max(0, nextRequestSlotAt - now)
  nextRequestSlotAt = Math.max(now, nextRequestSlotAt) + requestSpacingMs

  if (waitMs > 0) {
    await sleep(waitMs)
  }
}

function determineExtension(finalUrl, contentType) {
  try {
    const parsedUrl = new URL(finalUrl)
    const extension = path.posix.extname(parsedUrl.pathname)
    if (extension) {
      return extension.toLowerCase()
    }
  } catch {
    // ignore malformed final urls and fall back to content type
  }

  const normalizedType = contentType.split(';')[0].trim().toLowerCase()
  switch (normalizedType) {
    case 'image/jpeg':
      return '.jpg'
    case 'image/png':
      return '.png'
    case 'image/svg+xml':
      return '.svg'
    case 'image/gif':
      return '.gif'
    case 'image/webp':
      return '.webp'
    case 'image/avif':
      return '.avif'
    default:
      return '.bin'
  }
}

async function runTasks(tasks, concurrency) {
  const progress = {
    failed: 0,
    processed: 0,
    total: tasks.length,
  }
  const queue = [...tasks]
  const workers = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) {
      const nextTask = queue.shift()
      if (!nextTask) {
        return
      }

      const result = await nextTask.run()
      progress.processed += 1

      if (result.status === 'failed') {
        progress.failed += 1
      }

      // log each processed item so long reruns stay easy to monitor
      logTaskProgress(progress, nextTask.label, result)

      // print a short rollup every few items so the current run is easy to scan
      if (
        progress.processed % progressSummaryInterval === 0 ||
        progress.processed === progress.total
      ) {
        logProgressSummary(progress)
      }
    }
  })

  await Promise.all(workers)
}

function logTaskProgress(progress, label, result) {
  const prefix = `[${String(progress.processed).padStart(String(progress.total).length, ' ')}/${progress.total}]`
  if (result.status === 'downloaded') {
    console.log(`${prefix} downloaded ${label} -> ${result.outputPath}`)
    return
  }

  if (result.status === 'reused') {
    console.log(`${prefix} reused ${label} -> ${result.outputPath}`)
    return
  }

  console.log(`${prefix} failed ${label} -> ${summarizeReason(result.reason)}`)
}

function logProgressSummary(progress) {
  console.log(
    `progress ${progress.processed}/${progress.total} | downloaded ${report.downloadedAssets} | reused ${report.reusedAssets} | failed ${progress.failed}`,
  )
}

function relativeFromPublic(filePath) {
  return path.relative(path.join(rootDir, 'public'), filePath).replace(/\\/g, '/')
}

function relativeFromRoot(filePath) {
  return path.relative(rootDir, filePath).replace(/\\/g, '/')
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function sanitizeSegment(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function summarizeReason(reason) {
  return String(reason).replace(/\s+/g, ' ').trim().slice(0, 120)
}

await main()
