// The MIT License (MIT)
//
// Copyright (c) 2015 Formidable Labs
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

import React, { Component, PropTypes } from 'react'
import cssLayout from 'css-layout'
import clone from 'lodash.clonedeep'

import Pane from './Pane'
import * as Utils from './Utils'

const styles = {
  reset: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    flexShrink: 0,
    alignContent: 'flex-start',

    position: 'relative',
    boxSizing: 'border-box',
    border: '0 solid black',
    margin: 0,
    padding: 0,
    minWidth: 0,
  }
}

const KEYS_TO_IGNORE_WHEN_COPYING_PROPERTIES = [
  'arguments',
  'callee',
  'caller',
  'length',
  'name',
  'prototype',
  'type',
]

function copyProperties(source, target) {
  Object.getOwnPropertyNames(source).forEach(key => {
    if (
      KEYS_TO_IGNORE_WHEN_COPYING_PROPERTIES.indexOf(key) < 0 &&
      !target.hasOwnProperty(key)
    ) {
      const descriptor = Object.getOwnPropertyDescriptor(source, key)
      Object.defineProperty(target, key, descriptor)
    }
  })
}

function isStateless(component) {
  return !component.render && !(component.prototype && component.prototype.render)
}

export default function enhanceWithRadium(component) {

  let ComposedComponent = component

  // Handle stateless components
  if (isStateless(ComposedComponent)) {
    ComposedComponent = class extends Component {
      render() {
        return component(this.props, this.context)
      }
    }
    ComposedComponent.displayName = component.displayName || component.name
  }

  class WorkspaceEnhancer extends ComposedComponent {

    static _isWorkspaceEnhanced = true

    constructor() {
      super(...arguments)

      this.state = this.state || {}
      this._workspaceIsMounted = true
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount()
      }

      this._workspaceIsMounted = false
    }

    getResizableEdge(flexDirection) {
      const direction = flexDirection ? flexDirection : 'column'
      return direction === 'column' ? 'bottom' : 'right'
    }

    onResizeLayout(keyPath, resizableEdge, value) {

      // TODO When does this occur?
      if (!keyPath) return

      const update = Utils.calculateElementUpdate(this.enhancedLayout, keyPath, resizableEdge, value)
      const {keyPath: updatePath, style} = update

      this.overrides[updatePath] = {...this.overrides[updatePath], ...style}

      this.forceUpdate()
    }

    applyLayoutMap(
      children = [],
      layoutMap = {},
      keyPath = '',
      indexPath = '',
      resizableEdge = 'none'
    ) {
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
          const childIndexPath = `${indexPath}.${i}`
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
            children: props.children && this.applyLayoutMap(
              props.children,
              layoutMap,
              childKeyPath,
              childIndexPath,
              props.resizable || props['data-resizable'] ?
                this.getResizableEdge(style.flexDirection) :
                'none'
            ),
            width: layout.width,
            height: layout.height,
          })

          // console.log('clone', props)

          // console.log(lastChild, childKeyPath, i, children.length)

          const dimension = resizableEdge === 'bottom' ? 'height' : 'width'
          const minDimension = resizableEdge === 'bottom' ? 'minHeight' : 'minWidth'
          const maxDimension = resizableEdge === 'bottom' ? 'maxHeight' : 'maxWidth'

          let min = style[minDimension] || 0
          let max = style[maxDimension] || Infinity

          // console.log(style, layout)

          // console.log(keyPath, min, style[dimension], max)

          if (!style[dimension] && !lastChild) {
            const nextChild = children[i + 1]
            const total = layout[dimension] + nextChild.props.style[dimension]

            if (nextChild.props.style[maxDimension]) {
              min = Math.max(total - nextChild.props.style[maxDimension], 0)
            }

            if (nextChild.props.style[minDimension]) {
              max = Math.max(total - nextChild.props.style[minDimension], 0)
            }

            // console.log(min, layout[dimension], max)
          }

          return (
            <Pane
              key={key}
              min={min}
              max={max}
              size={layout[dimension]}
              resizableEdge={lastChild ? 'none' : resizableEdge}
              style={{...layout, position: 'absolute'}}
              onResize={(value) => {
                // console.log(value)
                // console.log('resizing', childKeyPath, childIndexPath, child)
                this.onResizeLayout(childKeyPath, resizableEdge, value)
              }}
            >
              {cloned}
            </Pane>
          )
        })
        .filter(x => x)
    }



    render() {
      const renderedElement = super.render()

      // console.log('rendered', React.Children.toArray(renderedElement))

      const rawLayout = Utils.extractLayout(renderedElement)[0]
      this.overrides = this.overrides || {}

      const layout = this.enhancedLayout = clone(rawLayout)
      Utils.overrideLayout(layout, this.overrides)
      cssLayout(layout)
      const layoutMap = Utils.extractLayoutMap(layout)
      // console.log('layout', layout, layoutMap)

      return (
        <div style={styles.reset}>
          {/* {renderedElement} */}
          {this.applyLayoutMap(renderedElement, layoutMap)}
        </div>
      )
    }
  }

  // Class inheritance uses Object.create and because of __proto__ issues
  // with IE <10 any static properties of the superclass aren't inherited and
  // so need to be manually populated.
  // See http://babeljs.io/docs/advanced/caveats/#classes-10-and-below-
  copyProperties(component, WorkspaceEnhancer)

  if (process.env.NODE_ENV !== 'production') {
    // This also fixes React Hot Loader by exposing the original components top
    // level prototype methods on the Radium enhanced prototype as discussed in
    // https://github.com/FormidableLabs/radium/issues/219.
    copyProperties(ComposedComponent.prototype, WorkspaceEnhancer.prototype)
  }

  WorkspaceEnhancer.displayName =
    component.displayName ||
    component.name ||
    'Component'

  return WorkspaceEnhancer
}
