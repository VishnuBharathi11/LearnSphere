import React from 'react'
import SidebarStudent from '../../../components/SideBar-S/SidebarStudent'
import './LearnerDashboard.css'

function LearnerDashboard() {
  return (
    <div className="learner-layout">
      <SidebarStudent />
      <div className="learner-content">
        <input type="search" placeholder="Search courses..." />
        <h1>Learner</h1>
      </div>

    </div>
  )
}

export default LearnerDashboard
