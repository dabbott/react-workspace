require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Workspace from './src/Workspace'
import Enhancer from './src/Enhancer'

const style = {
  flex: 1,
  display: 'flex',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
}

const LeftPane = Enhancer(class extends Component {
  render() {
    return (
      <div
        style={{backgroundColor: 'rgba(0,255,255,0.4)'}}
      >
        leftPane
      </div>
    )
  }
})

const RightPane = Enhancer(class extends Component {
  render() {
    return (
      <div
        style={{backgroundColor: 'rgba(0,255,255,0.6)'}}
      >
        rightPane
      </div>
    )
  }
})

const Toolbar = Enhancer(class extends Component {
  render() {
    return (
      <div
        style={{backgroundColor: 'rgba(255,0,255,0.3)'}}
      >
        toolbar
      </div>
    )
  }
})

const CenterPane = Enhancer(class extends Component {
  render() {
    return (
      <div
        style={{backgroundColor: 'rgba(255,0,255,0.6)'}}
      >
        centerPane
      </div>
    )
  }
})

const Content = Enhancer(class extends Component {
  render() {
    return (
      <div
        style={{backgroundColor: 'rgba(0,255,255,0.2)'}}
      >
        {this.props.children}
      </div>
    )
  }
})

const Main = Enhancer(class extends Component {
  render() {
    return (
      <div
        style={{backgroundColor: 'rgba(0,255,255,0.2)'}}
      >
        {this.props.children}
      </div>
    )
  }
})

class Root extends Component {
  constructor() {
    super()

    this.state = {
      styles: {
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
        },
        centerPane: {
          flex: 1,
        },
        rightPane: {
          flex: 0,
          width: 250,
        },
      }
    }
  }

  render() {
    const {styles} = this.state

    return (
      <div style={style}>
        <Workspace
          id={'workspace1'}
        >
          <Main
            resizable={true}
            id={'main'}
            style={styles.main}
          >
            <Toolbar
              id={'toolbar'}
              style={styles.toolbar}
            />
            <Content
              id={'content'}
              style={styles.content}
            >

            </Content>
          </Main>
        </Workspace>
      </div>
    )
  }
}

ReactDOM.render(<Root />, document.getElementById('react-root'))
