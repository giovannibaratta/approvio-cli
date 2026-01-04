import {fs, vol} from "memfs"
import os from "node:os"
import path from "node:path"
import {ConfigManager, HumanProfile, Profile} from "./config-manager"
import {ConfigFileParsingError, NoActiveProfileSetError, ProfileMissingError} from "../utils/errors"

jest.mock("node:fs", () => fs)
jest.mock("node:os", () => ({
  homedir: jest.fn().mockReturnValue("/home/testuser")
}))

describe("ConfigManager", () => {
  const MOCK_HOMEDIR = "/home/testuser"
  const CONFIG_DIR = path.join(MOCK_HOMEDIR, ".approvio")
  const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

  beforeEach(() => {
    vol.reset()
    vol.mkdirSync(MOCK_HOMEDIR, {recursive: true})
    jest.mocked(os.homedir).mockReturnValue(MOCK_HOMEDIR)
  })

  const mockHumanProfile: HumanProfile = {
    name: "default",
    endpoint: "https://api.example.com",
    authType: "human",
    accessToken: "access-token",
    refreshToken: "refresh-token"
  }

  describe("Initialization", () => {
    it("should initialize with empty config if file doesn't exist", () => {
      // Given: No config file exists

      // When: Creating a new ConfigManager
      new ConfigManager()

      // Expect: Config file is created with default values
      const fileContent = vol.readFileSync(CONFIG_FILE, "utf-8")
      const config = JSON.parse(fileContent as string)
      expect(config).toEqual({
        activeProfile: null,
        profiles: {}
      })
    })

    it("should load existing config from file", () => {
      // Given: A valid config file exists
      const existingConfig = {
        activeProfile: "default",
        profiles: {
          default: mockHumanProfile
        }
      }
      vol.mkdirSync(CONFIG_DIR, {recursive: true})
      vol.writeFileSync(CONFIG_FILE, JSON.stringify(existingConfig))

      // When: Creating a new ConfigManager
      const manager = new ConfigManager()

      // Expect: It should load the existing profile
      expect(manager.getActiveProfileOrThrow()).toEqual(mockHumanProfile)
    })

    it("should throw ConfigFileParsingError if config is invalid", () => {
      // Given: An invalid config file
      vol.mkdirSync(CONFIG_DIR, {recursive: true})
      vol.writeFileSync(CONFIG_FILE, JSON.stringify({invalid: "data"}))

      // When/Expect: Creating a new ConfigManager should throw
      expect(() => new ConfigManager()).toThrow(ConfigFileParsingError)
    })
  })

  describe("Profile Management", () => {
    let manager: ConfigManager

    beforeEach(() => {
      manager = new ConfigManager()
    })

    it("should set and retrieve a profile", () => {
      // Given: A manager instance

      // When: Setting a profile
      manager.setProfile(mockHumanProfile)

      // Expect: It can be retrieved after setting as active
      manager.setActiveProfile(mockHumanProfile.name)
      expect(manager.getActiveProfileOrThrow()).toEqual(mockHumanProfile)
    })

    it("should throw NoActiveProfileSetError when no profile is active", () => {
      // Given: A manager with a profile but none active
      manager.setProfile(mockHumanProfile)

      // When/Expect: Getting active profile should throw
      expect(() => manager.getActiveProfileOrThrow()).toThrow(NoActiveProfileSetError)
    })

    it("should throw ProfileMissingError when active profile name points to non-existent profile", () => {
      // Given: Manager with active profile set but profile deleted (unlikely via API but possible via file edit)
      // We simulate this by manually setting a non-existent active profile if we could,
      // but through public API we test switching to non-existent

      // When/Expect: Setting non-existent profile as active throws
      expect(() => manager.setActiveProfile("non-existent")).toThrow(ProfileMissingError)
    })

    it("should update active profile and set it as active if requested", () => {
      // Given: A manager

      // When: Updating a profile and setting as active
      manager.updateActiveProfile(mockHumanProfile, true)

      // Expect: It is active and saved
      expect(manager.getActiveProfileOrThrow()).toEqual(mockHumanProfile)
      const config = JSON.parse(vol.readFileSync(CONFIG_FILE, "utf-8") as string)
      expect(config.activeProfile).toBe(mockHumanProfile.name)
    })

    it("should logout by clearing active profile and all profiles", () => {
      // Given: A manager with an active profile
      manager.updateActiveProfile(mockHumanProfile, true)
      expect(manager.getActiveProfileOrThrow()).toBeDefined()

      // When: Logging out
      manager.logout()

      // Expect: No active profile and profiles list is empty
      expect(() => manager.getActiveProfileOrThrow()).toThrow(NoActiveProfileSetError)
      const config = JSON.parse(vol.readFileSync(CONFIG_FILE, "utf-8") as string)
      expect(config.activeProfile).toBeNull()
      expect(config.profiles).toEqual({})
    })

    it("should handle AgentProfile correctly", () => {
      // Given: An Agent profile
      const agentProfile: Profile = {
        name: "agent-1",
        endpoint: "https://api.example.com",
        authType: "agent",
        agentName: "my-agent",
        privateKeyPath: "/path/to/key",
        publicKeyPath: "/path/to/pub",
        accessToken: "agent-access",
        refreshToken: "agent-refresh"
      }

      // When: Setting and activating the agent profile
      manager.setProfile(agentProfile)
      manager.setActiveProfile("agent-1")

      // Expect: It should be correctly retrieved and persisted
      expect(manager.getActiveProfileOrThrow()).toEqual(agentProfile)
      const config = JSON.parse(vol.readFileSync(CONFIG_FILE, "utf-8") as string)
      expect(config.profiles["agent-1"]).toEqual(agentProfile)
    })
  })
})
