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

import { Layout, LocalStorage } from './utils'

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

function getStorageKey(workspaceId) {
  return `REACT_WORKSPACE:${workspaceId}`
}

const defaultOptions = {
  draggable: {
    size: 3,
    color: 'transparent',
  }
}

export default (workspaceId = 'DEFAULT', options = defaultOptions) => function enhanceComponent(component) {

  options.draggable = {...defaultOptions.draggable, ...options.draggable}

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

    constructor(props) {
      super(...arguments)

      this.state = this.state || {}

      // Settings workspaceId as a prop will override the one passed via enhancer
      if (props.workspaceId) {
        workspaceId = props.workspaceId
      }

      const saved = LocalStorage.loadObject(getStorageKey(workspaceId))
      this._overrides = saved.layout || {}

      this._workspaceIsMounted = true
    }

    componentWillUnmount() {
      if (super.componentWillUnmount) {
        super.componentWillUnmount()
      }

      this._workspaceIsMounted = false
    }

    render() {
      const renderedElement = super.render()
      const layoutTree = Layout.extractLayoutTree(renderedElement)[0]

      // Apply user-specified dimensions to styles
      Layout.overrideLayout(layoutTree, this._overrides)

      // Compute the entire layout
      cssLayout(layoutTree)

      return (
        <div style={styles.reset}>
          {Layout.renderWithLayoutTree(
            renderedElement,
            layoutTree,
            (updates) => {
              updates.forEach(({keyPath, style}) => {
                this._overrides[keyPath] = {
                  ...this._overrides[keyPath],
                  ...style,
                }
              })

              this.forceUpdate()
              LocalStorage.saveObject(getStorageKey(workspaceId), {
                version: 1,
                layout: this._overrides,
              })
            },
            options.draggable || {},
          )}
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
