import React, { Component } from 'react'
import cssLayout from 'css-layout'
import clone from 'lodash.clonedeep'
import update from 'react-addons-update'

import Pane from './Pane'
import * as Utils from './Utils'

const styles = {
  main: {
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

export default class extends React.Component {

  constructor(props) {
    super()

    this.state = this.mapPropsToState(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.mapPropsToState(nextProps))
  }

  mapPropsToState(props) {
    const layout = this.extractLayout(props)
    cssLayout(layout)

    console.log(React.Children.toArray(props.children))
    console.log('children', props.children)
    console.log('element map', this.extractElementMap(props.children))

    return {layout}
  }

  extractElementMap(children, map = {}) {
    React.Children.forEach(children, (child) => {
      const {props} = child

      map[props.id] = child
      this.extractElementMap(props.children, map)
    })

    return map
  }

  extractLayoutChildren(children = []) {
    return React.Children.map(children, (child) => {
      const {props} = child

      return {
        id: props.id,
        style: props.style,
        children: this.extractLayoutChildren(props.children),
      }
    })
  }

  extractLayout(props) {
    const {id, children, style} = props

    return {
      id,
      style,
      children: this.extractLayoutChildren(children)
    }
  }

  getResizeOptions(parentNode) {
    const {style, layout} = parentNode
    const direction = style.flexDirection ? style.flexDirection : 'column'
    const edge = direction === 'column' ? 'bottom' : 'right'

    return edge
  }

  onResize(resizableEdge, elementPath, value) {
    const node = Utils.getElementForPath(this.state.layout, elementPath)
    const next = Utils.getNextElementForPath(this.state.layout, elementPath)

    const key = resizableEdge === 'right' ? 'width' : 'height'
    let edit = null

    // Find the element with a fixed width or height and edit that element
    const delta = value - node.layout[key]

    if (node.style[key]) {
      edit = {id: node.id, value: node.style[key] + delta}
    } else {
      edit = {id: next.id, value: next.style[key] - delta}
    }

    const updater = Utils.getUpdaterForId(this.props.layout, edit.id, {
      style: {$merge: {[key]: edit.value}}
    })

    const updated = update(this.props.layout, updater)

    this.props.onLayoutChange(updated)
  }

  renderItem(node, elementPath = '0', resizableEdge = 'none', lastChild = true) {
    const {id, layout, children, resizable} = node
    const {components} = this.props
    const component = components[id] || <div />
    const edge = this.getResizeOptions(node)

    return (
      <Pane
        size={resizableEdge === 'bottom' ? node.layout.height : node.layout.width}
        resizableEdge={lastChild ? 'none' : resizableEdge}
        style={{...layout, position: 'absolute'}}
        onResize={this.onResize.bind(this, resizableEdge, elementPath)}
      >
        {React.cloneElement(component, {
          style: {
            ...component.props.style,
            width: layout.width,
            height: layout.height,
            position: 'absolute',
            overflow: 'hidden',
          },
          children: children.length > 0 ?
            children.map((childNode, i) => {
              return this.renderItem(
                childNode,
                `${elementPath}.${i}`,
                resizable ? edge : 'none',
                i === children.length - 1
              )
            }) :
            component.props.children,
          width: layout.width,
          height: layout.height,
        })}
      </Pane>
    )
  }

  render() {
    const {layout} = this.state
    const {children, style} = this.props

    return (
      <div style={styles.main}>
        {/* {this.renderItem(layout)} */}
      </div>
    )
  }
}
