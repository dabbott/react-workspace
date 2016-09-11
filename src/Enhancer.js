import React, { Component } from 'react'

export default (WrappedComponent) => class extends Component {

  static isWorkspaceComponent = true

  static propTypes = {
    id: React.PropTypes.string.isRequired,
    style: React.PropTypes.object.isRequired,
    resizable: React.PropTypes.bool,
  }

  render() {
    const {style, children} = this.props

    return (
      <WrappedComponent
        {...this.props}
        style={style}
      >
        {children}
      </WrappedComponent>
    )
  }
}
