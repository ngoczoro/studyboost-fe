export function isAccessTokenExpired(accessToken: string): boolean {
  try {
    const payload = accessToken.split(".")[1]
    if (!payload) return true
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")))
    if (typeof decoded.exp !== "number") return true
    return decoded.exp * 1000 < Date.now()
  } catch {
    return true
  }
}
