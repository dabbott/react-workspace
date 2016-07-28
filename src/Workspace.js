import React, { Component } from 'react'
import cssLayout from 'css-layout'
import clone from 'lodash.clonedeep'

import Pane from './Pane'

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
    const layout = clone(props.layout)
    cssLayout(layout)

    return {
      layout,
    }
  }

  renderChildren(layoutNode, children) {
    const {resizable} = layoutNode
    const direction = layoutNode.style.flexDirection ?
      layoutNode.style.flexDirection :
      'column'

    return children.map((childNode, i) => {
      const item = this.renderItem(childNode)
      const layout = childNode.layout

      if (resizable) {
        const size = direction === 'column' ? layout.height : layout.width

        let edge = 'none'
        if (i < children.length - 1) {
          edge = direction === 'column' ? 'bottom' : 'right'
        }

        // console.log('len', children.length, 'size', size, i, 'edge', edge)

        return (
          <Pane
            style={{
              ...layout,
              position: 'absolute',
            }}
            size={size}
            resizableEdge={edge}
            onResize={(value) => console.log('value', value)}
          >
            {item}
          </Pane>
        )
      } else {
        return item
      }
    })
  }

  renderItem(layoutNode) {
    const {id, layout, children} = layoutNode
    const {components} = this.props
    const component = components[id] || <div />

    // console.log('rendering', id, layoutNode)

    return React.cloneElement(component, {
      style: {
        ...layout,
        ...component.props.style,
        position: 'absolute',
        overflow: 'hidden',
      },
      children: children.length > 0 ?
        this.renderChildren(layoutNode, children) :
        component.props.children,
      width: layout.width,
      height: layout.height,
    })
  }

  render() {
    const {layout} = this.state

    return (
      <div style={styles.main}>
        {this.renderItem(layout)}
      </div>
    )
  }
}
