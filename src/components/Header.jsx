import React from 'react';
import './Header.css';

function Header(props) {
  const { user } = props;

  return (
    <div className="Header">
      <button type="button" className="Header_Logout" onClick={() => props.logout()}>logout</button>
      <p className="Header_Name">{user.display_name}</p>
      {user && user.images ? (
        <img className="Header_Img" src={user.images[0].url || ''} alt="user img" />
      ) : (
        <span />
      )}
      <div style={{ clear: 'both' }} />
    </div>
  );
}

export default Header;
