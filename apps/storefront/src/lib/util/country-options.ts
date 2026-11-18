import type { HttpTypes } from "@medusajs/types"

export function getCountryOptions(
  countries: HttpTypes.StoreRegionCountry[] = []
) {
  return countries.flatMap(({ iso_2, display_name }) =>
    iso_2
      ? [
          {
            value: iso_2,
            label:
              iso_2 === "kr" ? "대한민국" : display_name ?? iso_2.toUpperCase(),
          },
        ]
      : []
  )
}
