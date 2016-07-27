require('./styles/reset.css')
require('./styles/index.css')

import React, { Component } from 'react'
import ReactDOM from 'react-dom'

import Workspace, {components, layout} from './src/Workspace'

const style = {
  flex: 1,
  display: 'flex',
  alignItems: 'stretch',
  minWidth: 0,
  minHeight: 0,
  overflow: 'hidden',
}

const root = (
  <div style={style}>
    <Workspace
      components={components}
      layout={layout}
    />
  </div>
)

ReactDOM.render(root, document.getElementById('react-root'))
