export function buildEndpoint(baseUrl, path) {
  return baseUrl.replace(/\/$/, '') + '/' + path.replace(/^\//, '')
}
