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

export const overrideLayout = (layoutTree, overrides) => {
  Object.keys(overrides).forEach((keyPath) => {
    const node = KeyPath.getElementByKeyPath(layoutTree, keyPath)

    if (node) {
      node.style = {...node.style, ...overrides[keyPath]}
    }
  })
}

export const calculateElementUpdate = (layoutTree, keyPath, resizableEdge, value) => {
  const node = KeyPath.getElementByKeyPath(layoutTree, keyPath)
  const next = KeyPath.getNextElementByKeyPath(layoutTree, keyPath)

  const dimension = resizableEdge === 'right' ? 'width' : 'height'
  const delta = value - node.layout[dimension]

  // Find the element with a fixed width or height and edit that element
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
  } else {
    throw new Error(`React Workspace: One of the elements being resized
      must have fixed dimensions.`)
  }
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
  resizableEdge = 'none'
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
          props.resizable || props['data-resizable'] ?
            getResizableEdge(style.flexDirection) :
            'none'
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
          style={{...layout, position: 'absolute'}}
          onResize={(value) => {

            // TODO When does this occur?
            if (!childKeyPath) return

            const update = calculateElementUpdate(
              layoutTree,
              childKeyPath,
              resizableEdge,
              value
            )

            updateFunc(update)
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
