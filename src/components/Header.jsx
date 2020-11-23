import React from 'react';
import './Header.css';

function Header(props) {
  const { user } = props;

  return (
    <div className="Header">
      {user && user.images ? (
        <img className="Header_Img" src={user.images[0].url || ''} alt="user img" />
      ) : (
        <span />
      )}
      <p className="Header_Name">{user.display_name}</p>
      <button type="button" className="Header_Logout" onClick={() => props.logout()}>Log Out</button>
    </div>
  );
}

export default Header;
