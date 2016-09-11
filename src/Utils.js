export const parseElementPath = (elementPath) => {
  return elementPath.slice(1).split('.').map((x) => parseInt(x))
}

export const getElementById = (node, id) => {
  if (node.id === id) {
    return node
  }

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const result = getElementById(node.children[i], id)

      if (result) {
        return result
      }
    }
  }

  return null
}

export const getUpdaterForId = (node, id, command, updater = {}) => {
  if (node.id === id) {
    return command
  }

  if (node.children) {
    updater.children = {}

    for (let i = 0; i < node.children.length; i++) {
      const result = getUpdaterForId(node.children[i], id, command)

      if (result) {
        updater.children[i] = result
        return updater
      }
    }
  }

  return null
}

export const getElementForPath = (layout, elementPath) => {
  const parsed = parseElementPath(elementPath)

  // Remove the first element, since layout has a single node at top
  parsed.shift()

  let node = layout
  while (parsed.length) {
    node = node.children[parsed[0]]
    parsed.shift()
  }

  return node
}

export const getNextElementForPath = (layout, elementPath) => {
  const parsed = parseElementPath(elementPath)

  // Remove the first element, since layout has a single node at top
  parsed.shift()

  let node = layout
  while (parsed.length) {
    const last = parsed.length === 1
    node = node.children[last ? parsed[0] + 1 : parsed[0]]
    parsed.shift()
  }

  return node
}
