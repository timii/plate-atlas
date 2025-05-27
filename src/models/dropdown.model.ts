export interface IDropdownItem {
  id: number // unique id of each item to use as a key
  label: string // string shown as the name of each item
  value: string // value emitted when selecting an item
  selected: boolean // is current item selected
}

export enum SortBy {
  ALPHABETIC_ASC = 'alphabetic_asc',
  ALPHABETIC_DESC = 'alphabetic_desc',
}
