require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Workspace from './src/Workspace'

const style = {
  flex: 1,
  display: 'flex',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
}

const layout = {
  style: {
    flex: 1,
    flexDirection: 'column',
    width: window.innerWidth,
    height: window.innerHeight,
  },
  // resizable: true,
  children: [
    {
      id: 'toolbar',
      style: {
        flex: 0,
        height: 40,
      },
    },
    {
      id: 'workspace',
      style: {
        flex: 1,
        flexDirection: 'row',
      },
      resizable: true,
      children: [
        {
          id: 'leftPane',
          style: {
            flex: 0,
            width: 200,
          },
        },
        {
          id: 'centerPane',
          style: {
            flex: 1,
          },
        },
        {
          id: 'rightPane',
          style: {
            flex: 0,
            width: 250,
          },
        },
      ]
    },
  ]
}

const components = {
  workspace: <div style={{backgroundColor: 'rgba(0,255,255,0.2)'}}>workspace</div>,
  leftPane: <div style={{backgroundColor: 'rgba(0,255,255,0.4)'}}>leftPane</div>,
  rightPane: <div style={{backgroundColor: 'rgba(0,255,255,0.6)'}}>rightPane</div>,
  toolbar: <div style={{backgroundColor: 'rgba(255,0,255,0.3)'}}>toolbar</div>,
  centerPane: <div style={{backgroundColor: 'rgba(255,0,255,0.6)'}}>centerPane</div>,
}

class Root extends Component {
  constructor(props) {
    super(props)

    this.setWindowDimensions()

    window.addEventListener('resize', () => {
      this.setWindowDimensions()
      this.forceUpdate()
    })
  }

  setWindowDimensions() {
    layout.style = {
      ...layout.style,
      width: window.innerWidth,
      height: window.innerHeight,
    }
  }

  render() {
    return (
      <div style={style}>
        <Workspace
          components={components}
          layout={layout}
        />
      </div>
    )
  }
}

ReactDOM.render(<Root />, document.getElementById('react-root'))
