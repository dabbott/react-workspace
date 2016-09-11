import React, { Component } from 'react'
import cssLayout from 'css-layout'
import clone from 'lodash.clonedeep'
import update from 'react-addons-update'

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

export default (WrappedComponent, workspaceId) => {

  return class extends Component {

    static isWorkspaceComponent = true

    constructor(props) {
      super()

      this.state = this.mapPropsToState(props)
    }

    componentWillReceiveProps(nextProps) {
      this.setState(this.mapPropsToState(nextProps))
    }

    mapPropsToState(props) {
      const layout = this.extractLayout(props.children)
      cssLayout(layout)

      console.log('layout', layout, props)
      // console.log(React.Children.toArray(props.children))
      // console.log('children', props.children)
      // console.log('element map', this.extractElementMap(props.children))

      return {layout}
    }

    extractElementMap(children, map = {}) {
      React.Children.forEach(children, (child) => {
        const {props} = child

        map[props.key] = child
        this.extractElementMap(props.children, map)
      })

      return map
    }

    extractLayoutMap(children, map = {}) {
      React.Children.forEach(children, (child) => {
        const {props} = child

        map[props.key] = child
        this.extractLayoutMap(props.children, map)
      })

      return map
    }

    extractLayout(children = []) {
      return React.Children.map(children, (child) => {
        const {props} = child

        return {
          key: props.key,
          style: props.style,
          children: this.extractLayout(props.children),
        }
      })
    }

    render() {
      const {children} = this.props

      return (
        <div style={styles.reset}>
          <WrappedComponent>
            {children}
          </WrappedComponent>
        </div>
      )
    }
  }

}
