import { module, test } from 'qunit'
import simulant from 'simulant'
import Ractive from 'ractive'
import * as Events from 'ractive-event-keys'

module('ractive-event-keys')

const events = {
  enter: 13,
  tab: 9,
  escape: 27,
  space: 32,
  leftarrow: 37,
  rightarrow: 39,
  downarrow: 40,
  uparrow: 38
}

Object.keys(events).forEach(key => {
  test(key, t => {
    const instance = Ractive({
      el: '#qunit-fixture',
      events: { [key]: Events[key] },
      template: `<input on-${key}="handler">`,
      on: {
        handler () {
          t.ok(true)
        }
      }
    })

    simulant.fire(instance.find('input'), 'keydown', { which: events[key] })
  })
})
