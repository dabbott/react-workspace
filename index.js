require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Workspace from './src/Workspace'
import Enhancer from './src/Enhancer'
import Radium from './src/Radium'

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
    height: 200,
    backgroundColor: 'rgba(0,255,255,0.4)'
  },
  centerPane: {
    flex: 1,
    backgroundColor: 'rgba(255,0,255,0.6)'
  },
  rightPane: {
    flex: 0,
    height: 250,
    backgroundColor: 'rgba(0,255,255,0.6)'
  },
}

/*
<div style={{backgroundColor: 'rgba(0,255,255,0.4)'}}>leftPane</div>
<div style={{backgroundColor: 'rgba(0,255,255,0.6)'}}>rightPane</div>
<div style={{backgroundColor: 'rgba(255,0,255,0.3)'}}>toolbar</div>
<div style={{backgroundColor: 'rgba(255,0,255,0.6)'}}>centerPane</div>
<div style={{backgroundColor: 'rgba(0,255,255,0.2)'}}></div>
<div style={{backgroundColor: 'rgba(0,255,255,0.2)'}}></div>
*/

class Test extends Component {
  render() {
    return (
      <div style={{height: 10, flex: 1}}>YOLO</div>
    )
  }
}

class Root extends Component {
  render() {
    return (
      <div style={styles.main} key={'yolo'} data-resizable>
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
    )
  }
}

// const EnhancedRoot = Enhancer(Root, 'test')
const EnhancedRoot = Radium(Root, 'test')

ReactDOM.render(
  <EnhancedRoot />,
  // <Root />,
  document.getElementById('react-root')
)
