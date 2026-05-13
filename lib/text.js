const encoder = new TextEncoder()
const decoder = new TextDecoder()

module.exports = class Text {
  static encode (value) {
    return encoder.encode(value)
  }

  static decode (value) {
    return decoder.decode(value)
  }
}
