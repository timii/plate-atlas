export const DEFAULT_CONTINENT_TONE = '#97a0b5'

// map continent names to shared accent tones for overview and detail views
export const CONTINENT_TONE_MAP: Record<string, string> = {
  Africa: '#d58e56',
  Americas: '#48ac9e',
  Asia: '#d46f9f',
  Europe: '#6f87d9',
  Oceania: '#c6ab44',
}

export function getContinentTone(continent?: string): string {
  if (!continent) {
    return DEFAULT_CONTINENT_TONE
  }

  return CONTINENT_TONE_MAP[continent] ?? DEFAULT_CONTINENT_TONE
}

export function getToneStyle(continent?: string): Record<'--tone', string> {
  return {
    '--tone': getContinentTone(continent),
  }
}
