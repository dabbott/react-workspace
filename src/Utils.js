import React, { Component, PropTypes } from 'react'

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

export const extractLayout = (children = [], keyPath = '') => {
  return React.Children.toArray(children)
    .map((child) => {
      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        ! child
      ) {
        return {style: {}, children: [], garbage: true}
      }

      const {props, key} = child
      const childKeyPath = `${keyPath}${key}`

      return {
        keyPath: childKeyPath,
        style: props.style,
        children: extractLayout(props.children, childKeyPath),
      }
    })
}

export const extractLayoutMap = (children, layoutMap = {}) => {
  if (!children) return

  if (!Array.isArray(children)) {
    children = [children]
  }

  children.forEach((child) => {
    if (!child.keyPath) return

    layoutMap[child.keyPath] = child
    extractLayoutMap(child.children, layoutMap)
  })

  return layoutMap
}

export const overrideLayout = (layout, overrides) => {
  Object.keys(overrides).forEach((keyPath) => {
    const node = getElementByKeyPath(layout, keyPath)

    if (node) {
      // console.log('overriding', keyPath)
      node.style = {...node.style, ...overrides[keyPath]}
    }
  })
}

export const getResizableEdge = (flexDirection) => {
  const direction = flexDirection ? flexDirection : 'column'
  return direction === 'column' ? 'bottom' : 'right'
}

export function calculateElementUpdate(layout, keyPath, resizableEdge, value) {

  const node = getElementByKeyPath(layout, keyPath)
  const next = getNextElementByKeyPath(layout, keyPath)

  const dimension = resizableEdge === 'right' ? 'width' : 'height'
  const delta = value - node.layout[dimension]

  // Find the element with a fixed width or height and edit that element
  if (node.style[dimension]) {
    return {
      keyPath: node.keyPath,
      style: {[dimension]: node.style[dimension] + delta},
    }
  } else if (next.style[dimension]) {
    return {
      keyPath: next.keyPath,
      style: {[dimension]: next.style[dimension] - delta},
    }
  } else {
    throw new Error(`React Workspace: One of the elements being resized
      must have fixed dimensions.`)
  }
}
