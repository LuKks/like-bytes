const test = require('get-npm-global')('brittle')
const Bytes = require('./index.js')

test('isBytes', function (t) {
  t.plan(3)

  t.ok(Bytes.isBytes(new Uint8Array(1)))
  t.ok(!Bytes.isBytes(new ArrayBuffer(1)))
  t.ok(!Bytes.isBytes([1, 2, 3]))
})

test('alloc', function (t) {
  t.plan(3)

  t.alike(Bytes.alloc(3), new Uint8Array([0, 0, 0]))
  t.alike(Bytes.alloc(3, 7), new Uint8Array([7, 7, 7]))
  t.alike(Bytes.alloc(3, 'ab'), Bytes.from('aba'))
})

test('view', function (t) {
  t.plan(5)

  const bytes = new Uint8Array([1, 2, 3])
  const view = new Uint16Array([0x1234])
  const arrayBuffer = new Uint8Array([4, 5, 6]).buffer

  t.is(Bytes.view(bytes), bytes)
  t.alike(Bytes.view(view), new Uint8Array(view.buffer))
  t.alike(Bytes.view(arrayBuffer), new Uint8Array([4, 5, 6]))
  t.alike(Bytes.view([7, 8, 9]), new Uint8Array([7, 8, 9]))
  t.alike(Bytes.view('abc'), new Uint8Array([97, 98, 99]))
})

test('from copies', function (t) {
  t.plan(2)

  const source = new Uint8Array([1, 2, 3])
  const copy = Bytes.from(source)

  source[0] = 9

  t.alike(copy, new Uint8Array([1, 2, 3]))
  t.ok(copy !== source)
})

test('toString utf8', function (t) {
  t.plan(2)

  t.is(Bytes.toString(Bytes.from('hello')), 'hello')
  t.is(Bytes.toString(new Uint8Array([240, 159, 145, 139])), '👋')
})

test('hex', function (t) {
  t.plan(4)

  const bytes = Bytes.from('deadbeef', 'hex')

  t.alike(bytes, new Uint8Array([0xde, 0xad, 0xbe, 0xef]))
  t.is(Bytes.toString(bytes, 'hex'), 'deadbeef')

  throws(t, function () {
    Bytes.from('abc', 'hex')
  })

  throws(t, function () {
    Bytes.from('zz', 'hex')
  })
})

test('hex empty and uppercase', function (t) {
  t.plan(4)

  t.alike(Bytes.from('', 'hex'), new Uint8Array(0))
  t.is(Bytes.toString(new Uint8Array(0), 'hex'), '')
  t.alike(Bytes.from('DEADBEEF', 'hex'), new Uint8Array([0xde, 0xad, 0xbe, 0xef]))
  t.is(Bytes.toString(Bytes.from('DEADBEEF', 'hex'), 'hex'), 'deadbeef')
})

test('base58', function (t) {
  t.plan(4)

  const bytes = new Uint8Array([0, 0, 0, 40, 127, 180, 205])
  const string = Bytes.toString(bytes, 'base58')

  t.is(string, '111233QC4')
  t.alike(Bytes.from(string, 'base58'), bytes)
  t.alike(Bytes.from('', 'base58'), new Uint8Array(0))

  throws(t, function () {
    Bytes.from('0', 'base58')
  })
})

test('base58 zero edge cases', function (t) {
  t.plan(4)

  t.is(Bytes.toString(new Uint8Array([0]), 'base58'), '1')
  t.is(Bytes.toString(new Uint8Array([0, 0]), 'base58'), '11')
  t.alike(Bytes.from('1', 'base58'), new Uint8Array([0]))
  t.alike(Bytes.from('11', 'base58'), new Uint8Array([0, 0]))
})

test('base58 more edge cases', function (t) {
  t.plan(6)

  t.is(Bytes.toString(new Uint8Array([1]), 'base58'), '2')
  t.alike(Bytes.from('2', 'base58'), new Uint8Array([1]))

  t.is(Bytes.toString(new Uint8Array([0, 0, 1]), 'base58'), '112')
  t.alike(Bytes.from('112', 'base58'), new Uint8Array([0, 0, 1]))

  t.is(Bytes.toString(new Uint8Array([255]), 'base58'), '5Q')
  t.alike(Bytes.from('5Q', 'base58'), new Uint8Array([255]))
})

test('base58 invalid characters', function (t) {
  t.plan(4)

  throws(t, function () {
    Bytes.from('0', 'base58')
  })

  throws(t, function () {
    Bytes.from('O', 'base58')
  })

  throws(t, function () {
    Bytes.from('I', 'base58')
  })

  throws(t, function () {
    Bytes.from('l', 'base58')
  })
})

test('unknown encoding', function (t) {
  t.plan(2)

  throws(t, function () {
    Bytes.from('abc', 'base64')
  })

  throws(t, function () {
    Bytes.toString(Bytes.from('abc'), 'base64')
  })
})

test('concat', function (t) {
  t.plan(3)

  t.alike(Bytes.concat([]), new Uint8Array(0))
  t.alike(Bytes.concat(['a', 'b', 'c']), Bytes.from('abc'))
  t.alike(Bytes.concat([Bytes.from('ab'), [99]]), Bytes.from('abc'))
})

test('copy', function (t) {
  t.plan(4)

  const target = Bytes.alloc(5)

  t.is(Bytes.copy(Bytes.from('abc'), target), 3)
  t.alike(target, Bytes.from('abc\u0000\u0000'))

  t.is(Bytes.copy(Bytes.from('xy'), target, 3), 2)
  t.alike(target, Bytes.from('abcxy'))
})

test('copy truncates when target is small', function (t) {
  t.plan(2)

  const target = Bytes.alloc(2)

  t.is(Bytes.copy(Bytes.from('abcd'), target), 2)
  t.alike(target, Bytes.from('ab'))
})

test('fill', function (t) {
  t.plan(4)

  t.alike(Bytes.fill(Bytes.alloc(3), 255), new Uint8Array([255, 255, 255]))
  t.alike(Bytes.fill(Bytes.alloc(5), 'ab'), Bytes.from('ababa'))
  t.alike(Bytes.fill(Bytes.alloc(3), [1, 2]), new Uint8Array([1, 2, 1]))
  t.alike(Bytes.fill(Bytes.alloc(3), new Uint8Array(0)), Bytes.alloc(3))
})

test('equals', function (t) {
  t.plan(4)

  t.ok(Bytes.equals(Bytes.from('abc'), Bytes.from('abc')))
  t.ok(!Bytes.equals(Bytes.from('abc'), Bytes.from('abd')))
  t.ok(!Bytes.equals(Bytes.from('abc'), Bytes.from('ab')))
  t.ok(Bytes.equals(Bytes.from(''), Bytes.from('')))
})

test('compare', function (t) {
  t.plan(6)

  t.is(Bytes.compare(Bytes.from('abc'), Bytes.from('abc')), 0)
  t.is(Bytes.compare(Bytes.from('abc'), Bytes.from('abd')), -1)
  t.is(Bytes.compare(Bytes.from('abd'), Bytes.from('abc')), 1)
  t.is(Bytes.compare(Bytes.from('ab'), Bytes.from('abc')), -1)
  t.is(Bytes.compare(Bytes.from('abc'), Bytes.from('ab')), 1)
  t.is(Bytes.compare(Bytes.from(''), Bytes.from('')), 0)
})

test('view preserves typed array slice bounds', function (t) {
  t.plan(2)

  const source = new Uint8Array([1, 2, 3, 4])
  const slice = source.subarray(1, 3)
  const view = Bytes.view(new DataView(source.buffer, 1, 2))

  t.alike(Bytes.view(slice), new Uint8Array([2, 3]))
  t.alike(view, new Uint8Array([2, 3]))
})

test('copy edge cases', function (t) {
  t.plan(3)

  const target = Bytes.from('abc')

  t.is(Bytes.copy(Bytes.from('x'), target, target.byteLength), 0)
  t.alike(target, Bytes.from('abc'))

  throws(t, function () {
    Bytes.copy(Bytes.from('x'), target, -1)
  })
})

function throws (t, fn) {
  let ok = false

  try {
    fn()
  } catch {
    ok = true
  }

  t.ok(ok)
}
