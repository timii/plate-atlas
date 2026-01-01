export interface ICountry {
  code: string // country code (such as "A" for Austria)
  country: string // country name
  // TODO: replace with array of continents for countries such as Turkey that are a part of both Europe and Asia
  continent: string // continent name the country is in
  fromYear: string // year the country code was introduced
  previousCodes: string // list of previously used country codes
  notes: string // extra notes about the country
  flagThumb: string // small version of the country flag
  flag: string // "normal" sized version of the flag
}

export interface ICountryData {
  lastUpdate: string // date and time of last time data was updated
  countries: ICountry[] // list of countries
}

// used for countries that have no regions/areas in their license plates, instead examples images are used for the country
export interface ICountryDetailExampleImages {
  category: string // category name of the example images (something like "current" or "used from YEAR to YEAR")
  images: { title?: string; url: string }[] // list of example license plates (as urls of images + optional title) that fit into the category
}

// used for countries that have regions/areas in their license plates
export interface ICountryDetailCode {
  code: string // area/region code (such as "A" for Augsburg in Germany)
  name: string // name of the area/region
}

export type ICountryDetails = ICountryDetailCode[] | ICountryDetailExampleImages[]

export function isOfTypeExampleImages(
  data: ICountryDetails,
): data is ICountryDetailExampleImages[] {
  return data && data.length > 0 && data.every((item) => 'category' in item && 'images' in item)
}

export function isOfTypeCodes(data: ICountryDetails): data is ICountryDetailCode[] {
  return data && data.length > 0 && data.every((item) => 'code' in item && 'name' in item)
}
