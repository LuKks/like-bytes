const BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
const BASE58_ZERO = BASE58_ALPHABET[0]

const BASE58_MAP = new Int16Array(128)
BASE58_MAP.fill(-1)

for (let i = 0; i < BASE58_ALPHABET.length; i++) {
  BASE58_MAP[BASE58_ALPHABET.charCodeAt(i)] = i
}

module.exports = class Base58 {
  static encode (string) {
    if (string.length === 0) {
      return new Uint8Array(0)
    }

    let zeros = 0

    while (zeros < string.length && string[zeros] === BASE58_ZERO) {
      zeros++
    }

    const bytes = []

    for (let i = zeros; i < string.length; i++) {
      const code = string.charCodeAt(i)
      const value = code < 128 ? BASE58_MAP[code] : -1

      if (value === -1) {
        throw new Error('Invalid base58 string')
      }

      let carry = value

      for (let j = 0; j < bytes.length; j++) {
        carry += bytes[j] * 58
        bytes[j] = carry & 0xff
        carry >>= 8
      }

      while (carry > 0) {
        bytes.push(carry & 0xff)
        carry >>= 8
      }
    }

    const out = new Uint8Array(zeros + bytes.length)

    for (let i = 0; i < bytes.length; i++) {
      out[out.byteLength - 1 - i] = bytes[i]
    }

    return out
  }

  static decode (bytes) {
    if (bytes.byteLength === 0) {
      return ''
    }

    let zeros = 0

    while (zeros < bytes.byteLength && bytes[zeros] === 0) {
      zeros++
    }

    const digits = []

    for (let i = zeros; i < bytes.byteLength; i++) {
      let carry = bytes[i]

      for (let j = 0; j < digits.length; j++) {
        carry += digits[j] << 8
        digits[j] = carry % 58
        carry = Math.floor(carry / 58)
      }

      while (carry > 0) {
        digits.push(carry % 58)
        carry = Math.floor(carry / 58)
      }
    }

    let out = BASE58_ZERO.repeat(zeros)

    for (let i = digits.length - 1; i >= 0; i--) {
      out += BASE58_ALPHABET[digits[i]]
    }

    return out
  }
}
