
export const normalizeItem = (item) => {
  if (! item) return null

  return JSON.parse(item)
}

export const loadObject = (key, withDefault = {}) => {

  // Returns a string if key exists, or undefined otherwise
  const item = localStorage.getItem(key)

  return normalizeItem(item) || withDefault
}

export const saveObject = (key, object = {}) => {
  localStorage.setItem(key, JSON.stringify(object))
}
