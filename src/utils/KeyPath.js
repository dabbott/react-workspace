
export const getElementByKeyPath = (node, keyPath) => {
  if (node.keyPath === keyPath) {
    return node
  }

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const result = getElementByKeyPath(node.children[i], keyPath)

      if (result) {
        return result
      }
    }
  }

  return null
}

export const getNextElementByKeyPath = (node, keyPath, nextNode = null) => {
  if (node.keyPath === keyPath) {
    return nextNode
  }

  if (node.children) {
    for (let i = 0; i < node.children.length; i++) {
      const result = getNextElementByKeyPath(node.children[i], keyPath, node.children[i + 1])

      if (result) {
        return result
      }
    }
  }

  return null
}
