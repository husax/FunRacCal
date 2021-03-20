import React from 'react';
import PropTypes from 'prop-types'
import JXG from 'jsxgraph'
import '../node_modules/jsxgraph/distrib/jsxgraph.css';
import _ from 'lodash'

export  default class JXGBoard extends React.Component {
  constructor(props) {
    super(props);
    this.state= {
      _id: _.uniqueId('caja'),
      board: null,
      boardAttributes: props.boardAttributes,
      logic: props.logic,
      param: props.param,
      style: props.style,
    }

  }
  componentDidMount () {
    let board= JXG.JSXGraph.initBoard(this.state._id, this.props.boardAttributes);
    if (this.props.jessieCode) {
      board.jc.parse(this.props.logic);
    } else {
      this.props.logic(board, this.props.param);
    }
    this.setState({
      board: board
    })
  }

  componentDidUpdate (prevProps) {
    if (this.props.param !== prevProps.param ) {
      this.props.logic(this.state.board, this.props.param);
    }
    if (this.props.boardAttributes !== prevProps.boardAttributes ) {
      this.state.board.setBoundingBox(this.props.boardAttributes.boundingbox);
    }
  }
  render () {
    return (
      // eslint-disable-next-line react/style-prop-object
      <div id={this.state._id} className='jsxbox' style={this.props.style}></div>
    )
  }
}

JXGBoard.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string,
  logic: PropTypes.oneOfType([PropTypes.func, PropTypes.string]).isRequired,
  param: PropTypes.object,
  boardAttributes: PropTypes.object,
  jessieCode: PropTypes.bool
};

