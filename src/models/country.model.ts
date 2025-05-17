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
