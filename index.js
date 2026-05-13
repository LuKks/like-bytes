const Text = require('./lib/text.js')
const Hex = require('./lib/hex.js')
const Base58 = require('./lib/base58.js')

module.exports = class Bytes {
  static isBytes (value) {
    return value instanceof Uint8Array
  }

  static alloc (size, fill) {
    const out = new Uint8Array(size)

    if (fill !== undefined) {
      Bytes.fill(out, fill)
    }

    return out
  }

  static view (value) {
    if (value instanceof Uint8Array) {
      return value
    }

    if (ArrayBuffer.isView(value)) {
      return new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    }

    if (value instanceof ArrayBuffer) {
      return new Uint8Array(value)
    }

    if (typeof value === 'string') {
      // TODO: Encoding
      return Text.encode(value)
    }

    if (Array.isArray(value)) {
      return new Uint8Array(value)
    }

    throw new TypeError('Expected string, array, ArrayBuffer, or typed array')
  }

  static from (value, encoding) {
    if (typeof value === 'string') {
      if (!encoding || encoding === 'utf8' || encoding === 'utf-8') {
        return Text.encode(value)
      }

      if (encoding === 'hex') {
        return Hex.encode(value)
      }

      if (encoding === 'base58') {
        return Base58.encode(value)
      }

      throw new Error('Unknown encoding: ' + encoding)
    }

    if (Array.isArray(value)) {
      return new Uint8Array(value)
    }

    const view = Bytes.view(value)
    const out = new Uint8Array(view.byteLength)

    out.set(view)

    return out
  }

  static toString (value, encoding) {
    const view = Bytes.view(value)

    if (!encoding || encoding === 'utf8' || encoding === 'utf-8') {
      return Text.decode(view)
    }

    if (encoding === 'hex') {
      return Hex.decode(view)
    }

    if (encoding === 'base58') {
      return Base58.decode(view)
    }

    throw new Error('Unknown encoding ' + encoding)
  }

  static concat (list) {
    if (!Array.isArray(list)) {
      throw new TypeError('Expected an array')
    }

    let size = 0

    for (const item of list) {
      size += Bytes.view(item).byteLength
    }

    const out = new Uint8Array(size)
    let offset = 0

    for (const item of list) {
      const view = Bytes.view(item)

      out.set(view, offset)
      offset += view.byteLength
    }

    return out
  }

  static copy (source, target, start = 0) {
    source = Bytes.view(source)
    target = Bytes.view(target)

    if (start >= target.byteLength) {
      return 0
    }

    const size = Math.min(source.byteLength, target.byteLength - start)

    target.set(source.subarray(0, size), start)

    return size
  }

  static fill (target, value) {
    target = Bytes.view(target)

    if (typeof value === 'number') {
      target.fill(value & 0xff)
      return target
    }

    const pattern = Bytes.view(value)

    if (pattern.byteLength === 0) {
      return target
    }

    for (let i = 0; i < target.byteLength; i++) {
      target[i] = pattern[i % pattern.byteLength]
    }

    return target
  }

  static equals (a, b) {
    a = Bytes.view(a)
    b = Bytes.view(b)

    if (a === b) return true
    if (a.byteLength !== b.byteLength) return false

    for (let i = 0; i < a.byteLength; i++) {
      if (a[i] !== b[i]) return false
    }

    return true
  }

  static compare (a, b) {
    a = Bytes.view(a)
    b = Bytes.view(b)

    if (a === b) return 0

    const size = Math.min(a.byteLength, b.byteLength)

    for (let i = 0; i < size; i++) {
      if (a[i] < b[i]) return -1
      if (a[i] > b[i]) return 1
    }

    if (a.byteLength < b.byteLength) return -1
    if (a.byteLength > b.byteLength) return 1

    return 0
  }
}
