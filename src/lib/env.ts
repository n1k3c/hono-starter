function required(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(`${name} environment variable is required`)
  }
  return value
}

export const env = {
  get DATABASE_URL() {
    return required('DATABASE_URL')
  },
  get BETTER_AUTH_SECRET() {
    return required('BETTER_AUTH_SECRET')
  },
  get BETTER_AUTH_URL() {
    return required('BETTER_AUTH_URL')
  },
  get CORS_ORIGIN() {
    return required('CORS_ORIGIN')
  },
  get PORT() {
    return Number(process.env.PORT) || 3000
  },
}
