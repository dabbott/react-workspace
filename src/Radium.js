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

import Pane from './Pane'

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

    // cloneWithDefaultStyle(children) {
    //   return React.Children.map(children, (child) => {
    //     if (
    //       typeof child === 'string' ||
    //       typeof child === 'number' ||
    //       ! child
    //     ) {
    //       return child
    //     }
    //
    //     const {props} = child
    //     const nested = props && props.children
    //
    //     return React.cloneElement(child, {
    //       style: {...styles.reset, ...(props && props.style)},
    //       ...(nested && {children: this.cloneWithDefaultStyle(nested)})
    //     })
    //   })
    // }

    // cloneWithDefaultStyle(children) {
    //   return React.Children.map(children, (child) => {
        // if (
        //   typeof child === 'string' ||
        //   typeof child === 'number' ||
        //   ! child
        // ) {
        //   return child
        // }
    //
    //     const {props} = child
    //     const nested = props && props.children
    //
    //     return React.cloneElement(child, {
    //       style: {...styles.reset, ...(props && props.style)},
    //       ...(nested && {children: this.cloneWithDefaultStyle(nested)})
    //     })
    //   })
    // }

    extractLayout(children = [], keyPath = '') {
      return React.Children.toArray(children)
        .map((child) => {
          if (
            typeof child === 'string' ||
            typeof child === 'number' ||
            ! child
          ) {
            return null
          }

          const {props, key} = child
          const childKeyPath = `${keyPath}${key}`

          return {
            keyPath: childKeyPath,
            style: props.style,
            children: this.extractLayout(props.children, childKeyPath),
          }
        })
        .filter(x => x)
    }

    extractLayoutMap(children, layoutMap = {}) {
      if (!children) return

      if (!Array.isArray(children)) {
        children = [children]
      }

      children.forEach((child) => {
        layoutMap[child.keyPath] = child.layout
        this.extractLayoutMap(child.children, layoutMap)
      })

      return layoutMap
    }

    applyLayoutMap(children = [], layoutMap = {}, keyPath = '') {
      return React.Children.toArray(children)
        .map((child) => {
          if (
            typeof child === 'string' ||
            typeof child === 'number' ||
            ! child
          ) {
            return child
          }

          const {key, props} = child
          const childKeyPath = `${keyPath}${key}`
          const layout = layoutMap[childKeyPath]

          const cloned = React.cloneElement(child, {
            style: {
              ...(props && props.style),
              width: layout.width,
              height: layout.height,
              position: 'absolute',
              overflow: 'hidden',
            },
            children: props.children && this.applyLayoutMap(props.children, layoutMap, childKeyPath),
            width: layout.width,
            height: layout.height,
          })

          return (
            <Pane
              key={key}
              size={200}
              resizableEdge={'none'}
              style={{...layout, position: 'absolute'}}
              onResize={() => {}}
            >
              {cloned}
            </Pane>
          )
        })
        .filter(x => x)
    }

    render() {
      const renderedElement = super.render()

      console.log('rendered', React.Children.toArray(renderedElement))

      const layout = this.extractLayout(renderedElement)[0]
      cssLayout(layout)
      const layoutMap = this.extractLayoutMap(layout)
      console.log('layout', layout, layoutMap)

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
