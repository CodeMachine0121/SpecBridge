export function assertStatusCode(actual, expected) {
  if (actual === expected) return { pass: true }
  return { pass: false, message: `Status Code: expected ${expected}, got ${actual}` }
}

export function assertBodyExact(actual, expected) {
  try {
    for (const [key, val] of Object.entries(expected)) {
      const actualVal = actual[key]
      if (JSON.stringify(actualVal) !== JSON.stringify(val)) {
        return {
          pass: false,
          message: `Response Body mismatch: expected field "${key}" to equal ${JSON.stringify(val)}, got ${JSON.stringify(actualVal)}`
        }
      }
    }
    return { pass: true }
  } catch (err) {
    return { pass: false, message: `Response Body assertion error: ${err.message}` }
  }
}

export function assertBodyField(actual, field, value) {
  const actualVal = String(actual[field] ?? '')
  if (actualVal === value) return { pass: true }
  return {
    pass: false,
    message: `Response Body mismatch: expected field "${field}" to equal "${value}", got "${actualVal}"`
  }
}
