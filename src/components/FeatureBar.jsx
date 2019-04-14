import React, { Component } from 'react';
import ReactTooltip from 'react-tooltip'
import './FeatureBar.css';

class FeatureBar extends Component {
  render() {

    const maxidth = 400;

    let multiplier = this.props.value || 0;
    if (multiplier < 0 || multiplier > 1) {
      multiplier = 0;
    }

    const outerWidthStyle = { width: `${maxidth}px` }
    const innerWidthStyle = { width: `${multiplier * maxidth}px` }

    return (
      <div className="FeatureBar_Outer" style={outerWidthStyle}>
        <div className="FeatureBar_Inner" style={innerWidthStyle} data-tip={this.props.value}></div>
        <ReactTooltip effect="solid"/>
      </div>
    );
  }
}

export default FeatureBar;
