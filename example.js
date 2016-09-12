require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Enhancer from './src/WorkspaceEnhancer'

const styles = {
  main: {
    flex: 1,
    flexDirection: 'column',
    width: window.innerWidth,
    height: window.innerHeight,
  },
  toolbar: {
    flex: 0,
    height: 40,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  leftPane: {
    flex: 0,
    width: 200,
    minWidth: 100,
    maxWidth: 400,
    backgroundColor: 'rgba(0,255,255,0.4)'
  },
  centerPane: {
    flex: 1,
    backgroundColor: 'rgba(255,0,255,0.6)'
  },
  rightPane: {
    flex: 0,
    width: 250,
    minWidth: 100,
    maxWidth: 400,
    backgroundColor: 'rgba(0,255,255,0.6)'
  },
}

class Test extends Component {
  render() {
    return (
      <div style={{height: 100, width: 100, backgroundColor: 'lightblue'}}>YOLO</div>
    )
  }
}

class Root extends Component {
  render() {
    return (
      <div style={styles.main} key={'yolo'} data-resizable>
        <div style={styles.toolbar}>
          <div style={{flex: 1, backgroundColor: 'rgba(255,0,255,0.3)'}}>toolbar</div>
        </div>
        <div style={styles.content} data-resizable>
          <div style={styles.leftPane}>
            leftPane
          </div>
          <div style={styles.centerPane}>
            <Test />
          </div>
          <div style={styles.rightPane}>
            rightPane
          </div>
        </div>
      </div>
    )
  }
}

const EnhancedRoot = Enhancer(Root, 'test')

ReactDOM.render(
  <EnhancedRoot />,
  document.getElementById('react-root')
)
