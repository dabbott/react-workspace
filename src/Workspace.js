import React, { Component } from 'react'

export const components = {
  a: <div style={{backgroundColor: 'rgba(0,255,255,0.2)'}}>a</div>,
  b: <div style={{backgroundColor: 'rgba(0,255,255,0.4)'}}>b</div>,
  c: <div style={{backgroundColor: 'rgba(0,255,255,0.6)'}}>c</div>,
  d: <div style={{backgroundColor: 'rgba(255,0,255,0.3)'}}>d</div>,
  e: <div style={{backgroundColor: 'rgba(255,0,255,0.6)'}}>e</div>,
}

export const layout = [
  {
    id: 'a',
    flex: '0 0 200px',
    flexDirection: 'column',
    children: [
      {
        id: 'd',
        flex: '1 1 auto',
      },
      {
        id: 'e',
        flex: '0 0 100px',
      },
    ]
  },
  {
    id: 'b',
    flex: '1 1 auto',
  },
  {
    id: 'c',
    flex: '0 0 300px',
  },
]

export default class extends React.Component {
  renderItem({id, flex, flexDirection, children}) {
    const component = this.props.components[id]
    const style = {
      display: 'flex',
      flexDirection,
      flex,
    }
    return React.cloneElement(component, {
      style: {
        ...component.props.style,
        ...style,
      },
      children: children ?
        children.map(this.renderItem.bind(this)) :
        component.props.children,
    })
  }

  render() {
    const style = {
      flex: 1,
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'stretch',
    }
    return (
      <div style={style}>
        {this.props.layout.map(this.renderItem.bind(this))}
      </div>
    )
  }
}
