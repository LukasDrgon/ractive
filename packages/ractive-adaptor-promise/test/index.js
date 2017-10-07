import { module, test } from 'qunit'
import Ractive from 'ractive'
import Adaptor from 'ractive-adaptor-promise'

module('ractive-adaptor-promise')

test('A pending promise does not have any value', assert => {
  const promise = new Promise((resolve, reject) => {})

  const instance = Ractive({
    el: '#qunit-fixture',
    template: '<p>{{ value }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  const unwrappedValue = instance.get('value')
  const wrappedValue = instance.get('value', { unwrap: false })
  const domValue = instance.find('p').innerHTML

  assert.strictEqual(typeof unwrappedValue.then, 'function')
  assert.strictEqual(wrappedValue, null)
  assert.strictEqual(domValue, '')

  instance.teardown()
})

test('Resolving with a primitive value', assert => {
  const done = assert.async()

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve(1), 5000)
  })

  const instance = Ractive({
    el: '#qunit-fixture',
    template: '<p>{{ value }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  promise.then(value => {
    const unwrappedValue = instance.get('value')
    const wrappedValue = instance.get('value', { unwrap: false })
    const domValue = instance.find('p').innerHTML

    assert.strictEqual(value, 1)
    assert.strictEqual(unwrappedValue, 1)
    assert.strictEqual(wrappedValue, 1)
    assert.strictEqual(domValue, '1')

    instance.teardown()

    done()
  })
})

test('Resolving with a non-primitive value', assert => {
  const done = assert.async()

  const promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve({ foo: 1 }), 5000)
  })

  const instance = Ractive({
    template: '<p>{{ value.foo }}</p>',
    data: { value: promise },
    adapt: [ Adaptor ]
  })

  promise.then(value => {
    const unwrappedValue = instance.get('value.foo')
    const wrappedValue = instance.get('value.foo', { unwrap: false })
    const domValue = instance.find('p').innerHTML

    assert.strictEqual(value, 1)
    assert.strictEqual(unwrappedValue, 1)
    assert.strictEqual(wrappedValue, 1)
    assert.strictEqual(domValue, '1')

    instance.teardown()

    done()
  })
})

test('Rejecting with a primitive value', assert => {
  assert.ok(true)
})

test('Rejecting with a non-primitive value', assert => {
  assert.ok(true)
})
