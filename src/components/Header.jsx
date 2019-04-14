import React, { Component } from 'react';
import './Header.css';

class Header extends Component {
  render() {
    return (
      <div className="Header">
        <button className="Header_Logout" onClick={() => this.props.logout()}>logout</button>
        <p className="Header_Name">{this.props.user.display_name}</p>
        {this.props.user && this.props.user.images ? (
          <img className="Header_Img" src={this.props.user.images[0].url || ''} alt="user img" />
        ) : (
          <span />
        )}
        <div style={{ clear: 'both' }} />
      </div>
    );
  }
}

export default Header;
