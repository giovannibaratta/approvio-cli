import fs from "node:fs"
import yaml from "js-yaml"
import path from "node:path"

export function readTemplateFile<T>(filePath: string): T {
  const content = fs.readFileSync(filePath, "utf8")
  const extension = path.extname(filePath).toLowerCase()

  if (extension === ".yaml" || extension === ".yml") return yaml.load(content) as T

  return JSON.parse(content) as T
}
