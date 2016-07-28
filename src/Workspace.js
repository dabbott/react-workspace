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

  getResizeOptions(node, lastChild) {
    const {style, layout} = node
    const direction = style.flexDirection ? style.flexDirection : 'column'
    const size = direction === 'column' ? layout.height : layout.width
    const edge = lastChild ? 'none' : direction === 'column' ? 'bottom' : 'right'

    return {direction, size, edge}
  }

  renderItem(node, lastChild = true) {
    const {id, layout, children, resizable} = node
    const {components} = this.props
    const component = components[id] || <div />
    const {direction, size, edge} = this.getResizeOptions(node, lastChild)

    return (
      <Pane
        size={size}
        resizableEdge={edge}
        style={{
          ...layout,
          position: 'absolute',
          overflow: 'hidden',
        }}
        onResize={(value) => console.log('value', value)}
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
              return this.renderItem(childNode, i === children.length - 1)
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

    return (
      <div style={styles.main}>
        {this.renderItem(layout)}
      </div>
    )
  }
}
