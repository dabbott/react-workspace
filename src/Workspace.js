import React, { Component } from 'react'
import cssLayout from 'css-layout'

import clone from 'lodash.clonedeep'

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

  renderItem(layoutNode) {
    const {id, layout, children} = layoutNode
    const {components} = this.props
    const component = components[id] || <div />

    // console.log('rendering', id, layoutNode)

    return React.cloneElement(component, {
      style: {...layout, ...component.props.style, position: 'absolute'},
      children: children.length > 0 ?
        children.map(this.renderItem.bind(this)) :
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
