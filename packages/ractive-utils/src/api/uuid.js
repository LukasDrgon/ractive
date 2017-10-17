// We don't really care about conformance. All we need is a unique identifier.
const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1)
const uuid = () => `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`

export default uuid
