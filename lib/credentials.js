/**
 * Credentials service is registered after a plugin can activate, so never
 * capture it once at activation: resolve it on every request.
 */
export function createLazyCredentials(ctx) {
  return {
    async resolve(ref) {
      try {
        const service = ctx.get?.('credentials') || null
        if (!service?.resolve) return null
        return await service.resolve(ref)
      } catch {
        return null
      }
    },
  }
}
