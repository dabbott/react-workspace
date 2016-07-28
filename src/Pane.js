import React, { Component, } from 'react'
import DragToChangeValue from './DragToChangeValue'

const RESIZABLE_EDGE = {
  LEFT: 'LEFT',
  RIGHT: 'RIGHT',
  TOP: 'TOP',
  BOTTOM: 'BOTTOM',
  NONE: 'NONE',
}

export default class extends Component {

  static propTypes = {

  }

  static defaultProps = {
    size: 200,
    draggableSize: 3,
    min: 100,
    max: 400,
    resizableEdge: RESIZABLE_EDGE.NONE,
    style: null,
    onResize: () => {},
  }

  static RESIZABLE_EDGE = RESIZABLE_EDGE

  render() {
    const style = {
      width: this.props.size,
      height: '100%',
      position: 'relative',
      flexDirection: 'column',
      alignItems: 'stretch',
    }

    const draggableStyle = {
      zIndex: 1000,
      width: this.props.draggableSize,
      position: 'absolute',
      height: '100%',
      backgroundColor: 'red',
      cursor: 'col-resize',
    }

    let axis = DragToChangeValue.AXIS.X

    if (this.props.resizableEdge === RESIZABLE_EDGE.TOP ||
        this.props.resizableEdge === RESIZABLE_EDGE.BOTTOM) {

      axis = DragToChangeValue.AXIS.Y

      Object.assign(style, {
        width: '100%',
        height: this.props.size,
      })

      Object.assign(draggableStyle, {
        width: '100%',
        height: this.props.draggableSize,
        cursor: 'row-resize',
      })
    }

    switch (this.props.resizableEdge) {
      case RESIZABLE_EDGE.LEFT:
        draggableStyle.left = 0
        draggableStyle.top = 0
      break
      case RESIZABLE_EDGE.RIGHT:
        draggableStyle.right = 0
        draggableStyle.top = 0
      break
      case RESIZABLE_EDGE.TOP:
        draggableStyle.left = 0
        draggableStyle.top = 0
      break
      case RESIZABLE_EDGE.BOTTOM:
        draggableStyle.left = 0
        draggableStyle.bottom = 0
      break
      default:
        draggableStyle.display = 'none'
      break
    }

    const reverse = this.props.resizableEdge === RESIZABLE_EDGE.LEFT ||
        this.props.resizableEdge === RESIZABLE_EDGE.TOP ? false : true

    return (
      <div style={style}
        className={'pane'}>
        <DragToChangeValue
          style={draggableStyle}
          min={this.props.min}
          max={this.props.max}
          value={this.props.size}
          axis={axis}
          reverse={reverse}
          onChange={this.props.onResize}
        />
        <div style={this.props.style}>
          {this.props.children}
        </div>
      </div>
    )
  }
}
