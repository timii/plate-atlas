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

// interface used for countries that have no regions/areas in their license plates, instead examples images are used for the country
export interface ICountryDetailNoRegionCode {
  title: string // title/name of the example image (something like "current" or "used from YEAR to YEAR")
  images?: string[] // list of example license plates (as urls of images) that match the title
}

// interface used for countries that have regions/areas in their license plates
export interface ICountryDetailCode {
  code: string // area/region code (such as "A" for Augsburg in Germany)
  name: string // name of the area/region
}
