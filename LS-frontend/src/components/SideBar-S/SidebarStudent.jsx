import React from 'react'
import { Link } from 'react-router-dom'
import logo from '../../assets/Logo/logo.png'
import "./SidebarStudent.css"
function SidebarStudent() {
  return (
        <>
        <nav className="L-navbar">
        <div className="logo-name">
        <img src={logo} className="logo"/>
        <div className="page-name">LearnSphere</div>
        </div>
        <div className="L-sidebar">
        <Link to="/">Dashboard</Link>
        <Link to="/learner-my-courses">My Courses</Link>
        <Link to="/learner-progress">Progress</Link>
        <Link to="/learner-assesment">Assesment</Link>
        <Link to="/learner-my-profile">My Profile</Link>
        </div>
        </nav>
        </>
  )
}

export default SidebarStudent