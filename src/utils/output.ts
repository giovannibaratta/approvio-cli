import {Table} from "console-table-printer"

export interface OutputOptions {
  include?: string[]
  exclude?: string[]
}

/**
 * Flattens an object into a record where each key is a dot-separated path to the value.
 * @param obj The object to flatten.
 * @param prefix The prefix to add to each key.
 * @param options Optional options to control which properties to include or exclude.
 * @returns A flattened object.
 */
function flattenObject(obj: object, prefix = "", options?: OutputOptions): Record<string, unknown> {
  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      const fullKey = prefix + key

      // Property must be filtered out
      if (options?.exclude && options.exclude.includes(fullKey)) return acc
      if (options?.include && !options.include.includes(fullKey)) return acc

      if (value && typeof value === "object" && !Array.isArray(value) && value !== null) {
        Object.assign(acc, flattenObject(value, `${fullKey}.`, options))
        return acc
      }

      if (Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) Object.assign(acc, flattenObject(value[i], `${fullKey}[${i}].`, options))
        return acc
      }

      acc[fullKey] = value
      return acc
    },
    {} as Record<string, unknown>
  )
}

/**
 * Prints an object in a vertical table format where each row is a property of the object.
 * @param obj The object to print.
 * @param options Optional options to control which properties to include or exclude.
 */
export function printVerticalTable(obj: unknown, options?: OutputOptions): void {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) throw new Error("Invalid object. Cannot print.")

  const flattened = flattenObject(obj, "", options)
  const printer = new Table({
    title: "Object Details"
  })

  // Add column for property name and value
  printer.addColumn("Property")
  printer.addColumn("Value")

  Object.entries(flattened).forEach(([key, value]) => {
    let formattedValue: string

    if (value === null) formattedValue = "null"
    else if (value === undefined) formattedValue = "undefined"
    else if (typeof value === "boolean") formattedValue = value ? "true" : "false"
    else if (typeof value === "string") formattedValue = `"${value}"`
    else formattedValue = String(value)

    printer.addRow({
      Property: key,
      Value: formattedValue
    })
  })

  printer.printTable()
}
