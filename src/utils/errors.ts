export class ConfigFileParsingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}

export class ConfigFileMissingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}

export class ProfileMissingError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}

export class NoActiveProfileSetError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
  }
}
