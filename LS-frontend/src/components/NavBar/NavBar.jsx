import React from 'react'
import { Link } from 'react-router-dom';
import logo from '../../assets/Logo/logo.png'
import './NavBar.css'
function NavBar() {
  const scrollToSection=(id)=>{
      const section=document.getElementById(id);
      if(section){
        section.scrollIntoView({behavior:'smooth'});
      }
    }
  return (
    <>
    <nav className="navbar">
            <img src={logo} className="logo"/>
            <div className="page-name">LearnSphere</div>
    
          <div className="nav-links">
          <Link to="/">Home</Link>
          <span onClick={()=>scrollToSection("about")}>About</span>
          <span onClick={()=>scrollToSection("contact")}>Contact</span>
          <span onClick={()=>scrollToSection("pricing")}>Pricing</span>
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