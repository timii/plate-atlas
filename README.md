<p align="center">
  <img src="./src/assets/logo.svg" alt="Plate Atlas logo" width="96" />
</p>

<h1 align="center">Plate Atlas</h1>

<p align="center">Explore the World, One License Plate at a Time.</p>

<p align="center">
  Plate Atlas is a free, open-source reference for international vehicle registration codes and license plate examples.
  The goal is to help you browse countries, inspect plate details and compare regional formats.
</p>

<p align="center">
  <a href="">Try it out</a>
  &middot;
  <a href="https://github.com/timii/plate-atlas/issues">Report an Issue</a>
  &middot;
  <a href="./LICENSE">MIT License</a>
</p>

## About

Plate Atlas is a Vue-based atlas for world license plate data. The overview page lets you scan the full dataset, search by country, code, or continent, and narrow the list with sorting, grouping, and favorites. Country detail pages then show either regional identifier data or curated example images, depending on how that country formats its plates.

The current dataset in this repository includes 185 countries with detail files, and the shipped overview data was last updated on February 11, 2026.

## Features

- **Fast country overview**: Browse all supported countries from one searchable list.
- **Useful filtering controls**: Search by country name, code, or continent, then sort and group the results.
- **Favorites saved locally**: Star countries and keep that list in browser storage.
- **Country detail pages**: View regional code mappings or example plate images for each country.
- **Preloaded detail data**: Hover, focus, and touch interactions warm the next detail request for faster navigation.
- **Local image mirrors**: Overview flags and detail images can be mirrored into `public/images` so builds do not depend on third-party image hosts at runtime.
- **Project metadata in-app**: The app includes built-in links for sources, licensing, and contribution paths.

## Technologies Used

- [Vue 3](https://vuejs.org/) for the UI
- [TypeScript](https://www.typescriptlang.org/) for type-safe application code
- [Vite](https://vite.dev/) for development and production builds
- [Tailwind CSS](https://tailwindcss.com/) for styling utilities
- [Pinia](https://pinia.vuejs.org/) for app state
- [Vue Router](https://router.vuejs.org/) for navigation

## Contributing

Corrections and improvements are welcome. If you notice inaccurate plate data, missing examples, or UI issues, open an issue or submit a pull request:

- [Open an issue](https://github.com/timii/plate-atlas/issues)
- [Open a pull request](https://github.com/timii/plate-atlas/pulls)

When working on the dataset, rerun `npm run sync-images` if you add or update remote image references so the local mirrors stay in sync.

## Data Sources and References

- [Wikimedia Commons](https://commons.wikimedia.org/)
- [Wikipedia](https://www.wikipedia.org/)
- [Plate Shack](https://www.plateshack.com/)
- [Olav's Plates](https://www.olavsplates.com/)
- [License Plate Mania](https://www.licenseplatemania.com/)
- [World License Plates](https://www.worldlicenseplates.com/)

## License

This project is licensed under the [MIT License](./LICENSE).
