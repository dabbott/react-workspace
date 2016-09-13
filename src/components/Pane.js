import React, { Component, } from 'react'
import DragToChangeValue, { AXIS, } from './DragToChangeValue'

export const RESIZABLE_EDGE = {
  LEFT: 'left',
  RIGHT: 'right',
  TOP: 'top',
  BOTTOM: 'bottom',
  NONE: 'none',
}

export default class extends Component {

  static propTypes = {

  }

  static defaultProps = {
    size: 200,
    draggableSize: 3,
    draggableColor: 'transparent',
    min: 100,
    max: 400,
    resizableEdge: RESIZABLE_EDGE.NONE,
    style: null,
    onResize: () => {},
  }

  getHandleStyle(axis, draggableSize, draggableColor, resizableEdge) {
    const style = {
      zIndex: 10000,
      position: 'absolute',
      width: axis === AXIS.X ? draggableSize : '100%',
      height: axis === AXIS.Y ? draggableSize : '100%',
      cursor: axis === AXIS.X ? 'col-resize' : 'row-resize',
      backgroundColor: draggableColor,
    }

    switch (resizableEdge) {
      case RESIZABLE_EDGE.LEFT:
        return {...style, left: -draggableSize / 2, top: 0}
      case RESIZABLE_EDGE.RIGHT:
        return {...style, right: -draggableSize / 2, top: 0}
      case RESIZABLE_EDGE.TOP:
        return {...style, left: 0, top: -draggableSize / 2}
      case RESIZABLE_EDGE.BOTTOM:
        return {...style, left: 0, bottom: -draggableSize / 2}
    }
  }

  render() {
    const {style, resizableEdge, draggableSize, children, min, max, size, onResize, draggableColor} = this.props
    const axis = resizableEdge === RESIZABLE_EDGE.TOP || resizableEdge === RESIZABLE_EDGE.BOTTOM ? AXIS.Y : AXIS.X
    const reverse = resizableEdge === RESIZABLE_EDGE.LEFT || resizableEdge === RESIZABLE_EDGE.TOP ? false : true
    const visible = resizableEdge !== RESIZABLE_EDGE.NONE
    const draggableStyle = this.getHandleStyle(axis, draggableSize, draggableColor, resizableEdge)

    return (
      <div style={style}>
        {visible && (
          <DragToChangeValue
            style={draggableStyle}
            min={min}
            max={max}
            value={size}
            axis={axis}
            reverse={reverse}
            onChange={onResize}
          />
        )}
        {children}
      </div>
    )
  }
}
