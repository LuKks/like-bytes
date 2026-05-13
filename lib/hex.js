const HEX = '0123456789abcdef'
const HEX_TABLE = new Array(256)

for (let i = 0; i < 256; i++) {
  HEX_TABLE[i] = HEX[i >>> 4] + HEX[i & 15]
}

module.exports = class Hex {
  static byteLength (string) {
    if (string.length % 2 !== 0) {
      throw new Error('Invalid hex string')
    }

    return string.length / 2
  }

  static encode (string) {
    const out = new Uint8Array(Hex.byteLength(string))

    for (let i = 0; i < out.byteLength; i++) {
      const high = Hex.value(string.charCodeAt(i * 2))
      const low = Hex.value(string.charCodeAt(i * 2 + 1))

      if (high === -1 || low === -1) {
        throw new Error('Invalid hex string')
      }

      out[i] = (high << 4) | low
    }

    return out
  }

  static decode (bytes) {
    const out = new Array(bytes.byteLength)

    for (let i = 0; i < bytes.byteLength; i++) {
      out[i] = HEX_TABLE[bytes[i]]
    }

    return out.join('')
  }

  static value (code) {
    if (code >= 48 && code <= 57) return code - 48
    if (code >= 65 && code <= 70) return code - 55
    if (code >= 97 && code <= 102) return code - 87

    return -1
  }
}
