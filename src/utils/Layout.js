import React, { Component, PropTypes } from 'react'
import clone from 'lodash.clonedeep'

import * as KeyPath from './KeyPath'
import Pane from '../components/Pane'

export const extractLayoutTree = (children = [], keyPath = '') => {
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
        style: clone(props.style),
        children: extractLayoutTree(props.children, childKeyPath),
        resizeMode: props['data-resize-mode'],
      }
    })
}

export const buildLayoutMap = (children, layoutMap = {}) => {
  if (!children) return

  if (!Array.isArray(children)) {
    children = [children]
  }

  children.forEach((child) => {
    if (!child.keyPath) return

    layoutMap[child.keyPath] = child
    buildLayoutMap(child.children, layoutMap)
  })

  return layoutMap
}

const getFlexOverride = (child, overrides) => {
  const override = overrides[child.keyPath]
  return override && override.flex
}

// Handle adding new children to %-based layouts.
// We need to give large flex dimensions to new children, since new children
// likely start with {flex: 1}. So set flex to the average of previously-measured
// siblings.
const normalizePercentDimensions = (layoutTree, overrides) => {
  const {children, resizeMode} = layoutTree

  if (resizeMode === '%') {
    const old = children.filter(child => getFlexOverride(child, overrides))

    // There are old children, and more have been added
    if (old.length > 0 && children.length > old.length) {

      // Calculate the sum of children with overrides
      const sum = old
        .map(child => getFlexOverride(child, overrides))
        .reduce((acc, value) => acc + value, 0)

      const average = Math.round(sum / old.length)

      // Set flex to the average for children without a flex override
      children.forEach(child => {
        if (!getFlexOverride(child, overrides)) {
          child.style = {...child.style, flex: average}
        }
      })
    }
  }
}

const applyLayoutOverrides = (layoutTree, overrides) => {
  Object.keys(overrides).forEach((keyPath) => {
    const node = KeyPath.getElementByKeyPath(layoutTree, keyPath)

    if (node) {
      node.style = {...node.style, ...overrides[keyPath]}
    }
  })
}

export const overrideLayout = (layoutTree, overrides) => {
  applyLayoutOverrides(layoutTree, overrides)
  normalizePercentDimensions(layoutTree, overrides)
}

export const calculateElementUpdate = (layoutTree, keyPath, resizableEdge, value) => {
  const node = KeyPath.getElementByKeyPath(layoutTree, keyPath)
  const next = KeyPath.getNextElementByKeyPath(layoutTree, keyPath)

  const dimension = resizableEdge === 'right' ? 'width' : 'height'
  const delta = value - node.layout[dimension]

  // Find the element with a fixed width or height and edit that element.
  if (typeof node.style[dimension] === 'number') {
    return {
      keyPath: node.keyPath,
      style: {[dimension]: node.style[dimension] + delta},
    }
  } else if (typeof next.style[dimension] === 'number') {
    return {
      keyPath: next.keyPath,
      style: {[dimension]: next.style[dimension] - delta},
    }
  // If none exists, edit the first element, setting flex to 0.
  } else {
    return {
      keyPath: node.keyPath,
      style: {[dimension]: value, flex: 0},
    }
  }
}

// Elements resized in percent mode are given flex values equal to their dimensions.
// This allows adding/removing elements and resizing the parent, while the children
// maintain the same relative sizes.
export const calculatePercentUpdates = (layoutTree, parentKeyPath, keyPath, resizableEdge, value) => {
  const parentNode = KeyPath.getElementByKeyPath(layoutTree, parentKeyPath)
  const node = KeyPath.getElementByKeyPath(layoutTree, keyPath)
  const next = KeyPath.getNextElementByKeyPath(layoutTree, keyPath)

  const dimension = resizableEdge === 'right' ? 'width' : 'height'
  const delta = value - node.layout[dimension]

  // Create an update for each child
  return parentNode.children.map(child => {
    const {keyPath, layout} = child

    // Use the existing value
    let value = layout[dimension]

    // Update the two elements being resized by adding or removing the delta
    if (keyPath === node.keyPath) {
      value = layout[dimension] + delta
    } else if (keyPath === next.keyPath) {
      value = layout[dimension] - delta
    }

    // Create a change that sets the flex to the dimension value, which immitates
    // percent-based layout
    return {
      keyPath,
      style: {flex: value}
    }
  })
}

export const getResizableEdge = (flexDirection) => {
  const direction = flexDirection ? flexDirection : 'column'
  return direction === 'column' ? 'bottom' : 'right'
}

export const applyLayoutMap = (
  children = [],
  layoutTree,
  updateFunc,
  layoutMap = {},
  draggableOptions,
  keyPath = '',
  resizableEdge = 'none',
  resizeMode
) => {
  children = React.Children.toArray(children)

  return children
    .map((child, i) => {
      if (
        typeof child === 'string' ||
        typeof child === 'number' ||
        ! child
      ) {
        return child
      }

      const {key, props = {}} = child
      const {style = {}} = props
      const childKeyPath = `${keyPath}${key}`
      const layout = layoutMap[childKeyPath].layout
      const lastChild = i === children.length - 1

      const childResizableEdge = props.resizable || props['data-resizable'] ?
        getResizableEdge(style.flexDirection) : 'none'

      const childResizeMode = props['data-resize-mode']

      const cloned = React.cloneElement(child, {
        style: {
          ...style,
          width: layout.width,
          height: layout.height,
          position: 'absolute',
          overflow: 'hidden',
        },
        children: props.children && applyLayoutMap(
          props.children,
          layoutTree,
          updateFunc,
          layoutMap,
          draggableOptions,
          childKeyPath,
          childResizableEdge,
          childResizeMode
        ),
        width: layout.width,
        height: layout.height,
      })

      const dimension = resizableEdge === 'bottom' ? 'height' : 'width'
      const minDimension = resizableEdge === 'bottom' ? 'minHeight' : 'minWidth'
      const maxDimension = resizableEdge === 'bottom' ? 'maxHeight' : 'maxWidth'

      let min = style[minDimension] || 0
      let max = style[maxDimension] || Infinity

      if (!style[dimension] && !lastChild && resizableEdge !== 'none') {
        const nextChild = children[i + 1]
        const {layout: nextLayout} = KeyPath.getNextElementByKeyPath(layoutTree, childKeyPath)

        if (nextChild) {
          const total = layout[dimension] + nextLayout[dimension]

          if (nextChild.props.style[maxDimension]) {
            min = Math.max(total - nextChild.props.style[maxDimension], 0)
          }

          if (nextChild.props.style[minDimension]) {
            max = Math.max(total - nextChild.props.style[minDimension], 0)
          }
        }
      }

      return (
        <Pane
          key={key}
          min={min}
          max={max}
          draggableSize={draggableOptions.size}
          draggableColor={draggableOptions.color}
          size={layout[dimension]}
          resizableEdge={lastChild ? 'none' : resizableEdge}
          style={{
            ...layout,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
          }}
          onResize={(value) => {

            // TODO When does this occur?
            if (!childKeyPath) return

            let updates

            if (resizeMode === '%') {
              updates = calculatePercentUpdates(layoutTree, keyPath, childKeyPath, resizableEdge, value)
            } else {
              updates = [ calculateElementUpdate(layoutTree, childKeyPath, resizableEdge, value) ]
            }

            updateFunc(updates)
          }}
        >
          {cloned}
        </Pane>
      )
    })
    .filter(x => x)
}

export const renderWithLayoutTree = (children, layoutTree, updateFunc, draggableOptions) => {
  const layoutMap = buildLayoutMap(layoutTree)

  return applyLayoutMap(children, layoutTree, updateFunc, layoutMap, draggableOptions)
}
