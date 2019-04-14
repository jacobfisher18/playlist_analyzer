import React, { Component } from 'react';
import FeatureBar from './FeatureBar.jsx';
import Tooltip from 'react-tooltip-lite';
import './Stats.css';

// tbd: duration_ms, loudness, tempo, mode, etc.
const features = [
  {
    name: 'acousticness',
    description: 'A confidence measure from 0.0 to 1.0 of whether the track is acoustic. 1.0 represents high confidence the track is acoustic.',
  },
  {
    name: 'danceability',
    description: 'Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. A value of 0.0 is least danceable and 1.0 is most danceable.',
  },
  {
    name: 'energy',
    description: 'Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity. Typically, energetic tracks feel fast, loud, and noisy.',
  },
  {
    name: 'instrumentalness',
    description: 'Predicts whether a track contains no vocals. The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content. Values above 0.5 are intended to represent instrumental tracks.',
  },
  {
    name: 'liveness',
    description: 'Detects the presence of an audience in the recording. Higher liveness values represent an increased probability that the track was performed live. A value above 0.8 provides strong likelihood that the track is live.',
  },
  {
    name: 'speechiness',
    description: 'Speechiness detects the presence of spoken words in a track. The more exclusively speech-like the recording (e.g. talk show, audio book, poetry), the closer to 1.0 the attribute value.',
  },
  {
    name: 'valence',
    description: 'A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track. Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry).',
  },
]

class Stats extends Component {
  
  getAvg(feature) {
    const arr = this.props.trackStats || [];

    const avg = arr.reduce((accumulator, track) => accumulator + Number(track[feature]), 0) / arr.length;

    return Math.round(avg * 100) / 100;
  }

  renderAverages() {
    return features.map(feature => (
      <tr
        className="Stats_TableRow"
        key={feature.name}
      >
        <td className="Stats_FeatureName">
          <Tooltip content={feature.description} padding="20px">
            {feature.name}
          </Tooltip>
        </td>
        <td>
          <FeatureBar value={this.getAvg(feature.name)}/>
        </td >
        <td>{this.getAvg(feature.name)}</td>
      </tr>
    ));
  }

  render() {
    return (
      <div className="Stats">
        <h1 className="Stats_Averages_Title">Averages</h1>
        <table>
          <tbody>
            {this.renderAverages()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default Stats;
