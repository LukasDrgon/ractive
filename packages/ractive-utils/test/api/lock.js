import { module, test } from 'qunit'
import { lock, unlock, isLocked, uuid } from 'ractive-utils'

module('lock')

test('Basic locking', t => {
  const key = uuid()

  t.strictEqual(isLocked(key), false)
  lock(key)
  t.strictEqual(isLocked(key), true)
  unlock(key)
  t.strictEqual(isLocked(key), false)
})

test('Repeated locking and unlocking', t => {
  const key = uuid()

  t.strictEqual(isLocked(key), false)
  lock(key)
  t.strictEqual(isLocked(key), true)
  lock(key)
  t.strictEqual(isLocked(key), true)
  unlock(key)
  t.strictEqual(isLocked(key), true)
  unlock(key)
  t.strictEqual(isLocked(key), false)
})

test('Excessive unlock should stay unlocked', t => {
  const key = uuid()

  t.strictEqual(isLocked(key), false)
  lock(key)
  t.strictEqual(isLocked(key), true)
  unlock(key)
  t.strictEqual(isLocked(key), false)
  unlock(key)
  t.strictEqual(isLocked(key), false)
})

test('Excessive unlock should lock on the next lock', t => {
  const key = uuid()

  t.strictEqual(isLocked(key), false)
  lock(key)
  t.strictEqual(isLocked(key), true)
  unlock(key)
  t.strictEqual(isLocked(key), false)
  unlock(key)
  t.strictEqual(isLocked(key), false)
  lock(key)
  t.strictEqual(isLocked(key), true)
})
