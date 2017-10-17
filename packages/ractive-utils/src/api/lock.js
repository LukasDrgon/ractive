const locks = {}

export const lock = key => {
  locks[key] = (locks[key] || 0) + 1
}

export const unlock = key => {
  if (locks[key] > 0) locks[key]--
  if (locks[key] === 0) delete locks[key]
}

export const isLocked = key => Boolean(locks[key])
