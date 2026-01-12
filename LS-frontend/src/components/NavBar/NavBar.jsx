import React from 'react'
import { Link } from 'react-router-dom';
import logo from '../../assets/Logo/logo.png'
function NavBar() {
  return (
    <>
    <nav className="navbar">
            <img src={logo} className="logo"/>
            <div className="page-name">LearnSphere</div>
    
          <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/pricing">Pricing</Link>
          <Link to="/contact">Contact</Link>
          </div>
    
          <div className="nav-actions">
          <Link to="/login" className='btn-login'>Login</Link>
          <Link to="/register" className='btn-register'>Register</Link>
          </div>
          </nav>
          </>
  )
}

export default NavBar