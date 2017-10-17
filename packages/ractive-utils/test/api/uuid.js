import { module, test } from 'qunit'
import { uuid } from 'ractive-utils'

module('uuid')

test('uuid must generate xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', t => {
  const pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  const id = uuid()
  console.log(id)
  t.ok(pattern.test(id))
})
