import { module, test } from 'qunit'
import simulant from 'simulant'
import Ractive from 'ractive'
import { tap } from 'ractive-event-tap'

module('ractive-event-tap')

test('Mousedown followed by click results in a tap event', t => {
  t.expect(1)

  const instance = Ractive({
    el: '#qunit-fixture',
    events: { tap },
    template: '<span id="test" on-tap="tap">tap me</span>',
    on: {
      tap () {
        t.ok(true)
      }
    }
  })

  const node = instance.find('span')

  simulant.fire(node, 'mousedown')
  simulant.fire(node, 'click')
})

test('Pressing spacebar on a focused button results in a tap event', t => {
  t.expect(1)

  const instance = new Ractive({
    el: '#qunit-fixture',
    events: { tap },
    template: '<button id="test" on-tap="tap">tap me</button>',
    on: {
      tap () {
        t.ok(true)
      }
    }
  })

  const node = instance.find('button')

  simulant.fire(node, 'keydown', { which: 32 })
  node.focus()
  simulant.fire(node, 'keydown', { which: 32 })
})
