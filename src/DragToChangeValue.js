import React, { Component, } from 'react'
import clamp from 'lodash.clamp'

export const AXIS = {
  X: 'x',
  Y: 'y',
}

export default class extends Component {

  static propTypes = {
    onChange: React.PropTypes.func.isRequired,
    value: React.PropTypes.number.isRequired,
    max: React.PropTypes.number,
    min: React.PropTypes.number,
    axis: React.PropTypes.string,
    reverse: React.PropTypes.bool,
  }

  static defaultProps = {
    className: '',
    style: null,
    min: -Infinity,
    max: Infinity,
    axis: AXIS.Y,
    reverse: false,
  }

  constructor(props) {
    super(props)

    this.state = {
      initialValue: props.value,
    }

    this.onDragEnd = this.onDragEnd.bind(this)
    this.onDragMove = this.onDragMove.bind(this)
    this.onDragStart = this.onDragStart.bind(this)
    this.detachGlobalListeners = this.detachGlobalListeners.bind(this)
    this.attachGlobalListeners = this.attachGlobalListeners.bind(this)
    this.getValue = this.getValue.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const dragState = this.state.dragState
    if (dragState !== 'STARTED' && dragState !== 'MOVING') {
      this.setState({
        initialValue: nextProps.value
      })
    }
  }

  getValue(dragHeadPosition, dragAnchorPosition) {
    const axis = this.props.axis
    const dir = this.props.reverse ? -1 : 1
    const delta = dir * (dragAnchorPosition[axis] - dragHeadPosition[axis])
    return clamp(this.state.initialValue + delta, this.props.min, this.props.max)
  }

  attachGlobalListeners() {
    document.body.style.cursor = this.props.axis === AXIS.X ?
      "col-resize" : "row-resize"
    document.addEventListener('mousemove', this.onDragMove)
    document.addEventListener('mouseup', this.onDragEnd)
  }

  detachGlobalListeners() {
    document.body.style.cursor = "auto"
    document.removeEventListener('mousemove', this.onDragMove)
    document.removeEventListener('mouseup', this.onDragEnd)
  }

  onDragStart(e) {
    this.attachGlobalListeners()
    this.setState({
      dragState: 'STARTED',
      dragAnchorPosition: {
        x: e.clientX,
        y: e.clientY
      }
    })
    e.preventDefault()
    e.stopPropagation()
  }

  onDragMove(e) {
    switch (this.state.dragState) {
      case 'STARTED':
      case 'MOVING':
        const dragHeadPosition = {
          x: e.clientX,
          y: e.clientY
        }
        const axis = this.props.axis
        if (this.state.dragHeadPosition && this.state.dragHeadPosition[axis] !== dragHeadPosition[axis]) {
          const value = this.getValue(dragHeadPosition, this.state.dragAnchorPosition)
          this.props.onChange(value)
        }
        this.setState({
          dragState: 'MOVING',
          dragHeadPosition: dragHeadPosition
        })
    }
  }

  onDragEnd(e) {
    this.detachGlobalListeners()
    const state = {
      dragState: 'ENDED',
      dragHeadPosition: null
    }
    if (this.state.dragHeadPosition) {
      state.initialValue = this.getValue(this.state.dragHeadPosition, this.state.dragAnchorPosition)
    }
    this.setState(state)
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    const {style, onChange, children} = this.props

    return (
      <div
        style={style}
        onChange={onChange}
        onMouseDown={this.onDragStart}
      >
        {children}
      </div>
    )
  }
}
