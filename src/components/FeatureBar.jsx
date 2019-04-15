import React from 'react';
import ReactTooltip from 'react-tooltip';
import './FeatureBar.css';

function FeatureBar(props) {
  const maxidth = 400;
  const { value } = props;

  let multiplier = value || 0;
  if (multiplier < 0 || multiplier > 1) {
    multiplier = 0;
  }

  const outerWidthStyle = { width: `${maxidth}px` };
  const innerWidthStyle = { width: `${multiplier * maxidth}px` };

  return (
    <div className="FeatureBar_Outer" style={outerWidthStyle}>
      <div className="FeatureBar_Inner" style={innerWidthStyle} data-tip={value} />
      <ReactTooltip effect="solid" />
    </div>
  );
}

export default FeatureBar;
