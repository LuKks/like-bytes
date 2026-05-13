# like-bytes

Simple `Uint8Array` functions.

```
npm i like-bytes
```

## Usage

```js
const Bytes = require('like-bytes')

const a = Bytes.from('hello')
const b = Bytes.from('hello', 'hex')
const c = Bytes.from('hello', 'base58')

console.log(Bytes.toString(a))
// hello

console.log(Bytes.toString(b, 'hex'))
// hello

console.log(Bytes.toString(c, 'base58'))
// hello
```

## API

TODO

```js
Bytes.isBytes(value)
Bytes.alloc(size, fill)
Bytes.view(value)
Bytes.from(value, encoding)
Bytes.toString(value, encoding)
Bytes.concat(list)
Bytes.copy(source, target, start)
Bytes.fill(target, value)
Bytes.equals(a, b)
Bytes.compare(a, b)
```

## License

Copyright (c) 2026 Lucas Barrena. All rights reserved.
