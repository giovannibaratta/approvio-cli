import fs from "node:fs"
import path from "node:path"
import os from "node:os"
import Ajv, {JTDSchemaType, ValidateFunction} from "ajv/dist/jtd"
import {
  ConfigFileMissingError,
  ConfigFileParsingError,
  NoActiveProfileSetError,
  ProfileMissingError
} from "../utils/errors"

interface BaseProfile {
  name: string
  endpoint: string
}

export interface HumanProfile extends BaseProfile {
  authType: "human"
  accessToken: string
  refreshToken: string
}

export interface AgentProfile extends BaseProfile {
  authType: "agent"
  agentName: string
  privateKeyPath: string
  publicKeyPath: string
  accessToken: string
  refreshToken: string
}

export type Profile = HumanProfile | AgentProfile

const CONFIG_DIR = path.join(os.homedir(), ".approvio")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

const baseProfileSchema = {
  name: {type: "string"},
  endpoint: {type: "string"}
} as const

const profileSchema = {
  discriminator: "authType",
  mapping: {
    human: {
      properties: {
        ...baseProfileSchema,
        accessToken: {type: "string"},
        refreshToken: {type: "string"}
      }
    },
    agent: {
      properties: {
        ...baseProfileSchema,
        agentName: {type: "string"},
        privateKeyPath: {type: "string"},
        publicKeyPath: {type: "string"},
        accessToken: {type: "string"},
        refreshToken: {type: "string"}
      }
    }
  }
} as const

// 3. Main Config Schema
const configSchema: JTDSchemaType<ApprovioConfig> = {
  properties: {
    activeProfile: {type: "string", nullable: true},
    profiles: {
      values: profileSchema
    }
  },
  additionalProperties: false
}

const ajv = new Ajv({
  allErrors: true
})

const configValidator: ValidateFunction<ApprovioConfig> = ajv.compile(configSchema)
const configSerializer = ajv.compileSerializer(configSchema)

/**
 * Manages the configuration for the Approvio CLI tool.
 *
 * This class handles loading, validating, and persisting user and agent authentication profiles
 * from a JSON configuration file located at ~/.approvio/config.json. It supports both human
 * authentication (using access/refresh tokens) and agent authentication (using RSA key pairs
 * and tokens). The manager maintains an active profile for current operations and provides
 * methods to create, update, and switch between profiles.
 */
export class ConfigManager {
  private config: ApprovioConfig

  constructor() {
    this.config = this.loadOrInitialize()
  }

  private loadOrInitialize(): ApprovioConfig {
    if (!fs.existsSync(CONFIG_FILE)) return this.initialize()
    return this.load()
  }

  private initialize(): ApprovioConfig {
    this.config = {
      activeProfile: null,
      profiles: {}
    }
    this.save()
    return this.config
  }

  private load(): ApprovioConfig {
    if (!fs.existsSync(CONFIG_FILE)) throw new ConfigFileMissingError("Use 'approvio auth login' to log in")

    try {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8")
      const unvalidatedData = JSON.parse(data)
      if (!configValidator(unvalidatedData)) throw new ConfigFileParsingError("Invalid config")
      return unvalidatedData
    } catch (error) {
      const msg = "Failed to load config"
      console.warn(msg, error)
      throw new ConfigFileParsingError(msg, {cause: error})
    }
  }

  save(): void {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, {recursive: true})

    fs.writeFileSync(CONFIG_FILE, configSerializer(this.config), "utf-8")
  }

  getActiveProfileOrThrow(): Profile {
    if (!this.config.activeProfile) throw new NoActiveProfileSetError("No active profile set")
    const profile = this.config.profiles[this.config.activeProfile]
    if (!profile) throw new ProfileMissingError(`Active profile ${this.config.activeProfile} not found`)
    return profile
  }

  setProfile(profile: Profile): void {
    this.config.profiles[profile.name] = profile
    this.save()
  }

  setActiveProfile(name: string): void {
    const profile = this.config.profiles[name]
    if (!profile) throw new ProfileMissingError(`Profile ${name} not found`)

    this.config.activeProfile = name
    this.save()
  }

  updateActiveProfile(profile: Profile, setAsActive = false): void {
    this.config.profiles[profile.name] = profile
    if (setAsActive) this.config.activeProfile = profile.name
    this.save()
  }

  logout(): void {
    // TODO(long-term) Multiple profiles are not supported at the moment. When we logout, we delete
    // all the profiles (should be only one). When multi-profile support is added, we should only
    // delete the active profile, and make the first profile in the list as active.
    this.config.activeProfile = null
    this.config.profiles = {}
    this.save()
  }
}

export const configManager = new ConfigManager()

interface ApprovioConfig {
  activeProfile: string | null
  // Key: profile name
  profiles: Record<string, Profile>
}
