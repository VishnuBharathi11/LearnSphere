import React from 'react'
import './Dashboard.css'
import SidebarStudent from '../../../components/SideBar-S/SidebarStudent';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// const status = [
//   { title: "Completed Courses", value: 3 },
//   { title: "Enrolled Courses", value: 5 },
//   { title: "Hours Studied", value: 52 },
//   { title: "Certificates", value: 2 },
// ];
const weeklyData = [
  { day: "Mon", hours: 5 },
  { day: "Tue", hours: 8 },
  { day: "Wed", hours: 11 },
  { day: "Thu", hours: 5 },
  { day: "Fri", hours: 9 },
  { day: "Sat", hours: 14 },
  { day: "Sun", hours: 7 },
];

const courses = [
  {
    title: "Advance Java Script",
    instructor: "Sarah Chen",
    progress: 15,
    status: "In Progress",
  },
  {
    title: "Data Science Fundamentals",
    instructor: "Dr. Lee",
    progress: 100,
    status: "Completed",
  },
  {
    title: "Cybersecurity",
    instructor: "John Smith",
    progress: 38,
    status: "In Progress",
  },
];
function Dashboard() {
  return (
    <div className="learner-layout">
      <SidebarStudent/>
   <div className="learner-content">
     <input type="search" placeholder="Search courses..." />
     <div className="welcome-cont">
     <div className="classname">Welcome Back,Vishnu!</div>
     <div className="classname">Keep Learning!</div>
     <button className="">Continue Learning</button>
     </div>
     <div className="chart-card">
       <div>Weekly Learning Activity</div>
       <ResponsiveContainer width="100%" height={250}>
         <LineChart data={weeklyData}>
           <CartesianGrid strokeDasharray="3 3" />
           <XAxis dataKey="day" />
           <YAxis />
           <Tooltip />
           <Line
             type="monotone"
             dataKey="hours"
             stroke="#4f6ef7"
             strokeWidth={3}
           />
         </LineChart>
       </ResponsiveContainer>
     </div>
     <div className="classname">
       <div className="classname">Continue Learning</div>
       <div className="classname">
          <div>
             {courses.map((course, index) => (
               <div className="course-progress-card" key={index}>
                 <div className="course-row">
                   <div>
                     <h5>{course.title}</h5>
                     <span>{course.instructor}</span>
                   </div>
 
                   <span
                     className={
                       course.status === "Completed"
                         ? "badge completed"
                         : "badge progress"
                     }
                   >
                     {course.status}
                   </span>
                 </div>
 
                 <div className="progress-bar">
                   <div
                     className="progress-fill"
                     style={{ width: `${course.progress}%` }}
                   ></div>
                 </div>
 
                 <small>Progress: {course.progress}%</small>
               </div>
             ))}
           </div>
       </div>
     </div>
 
   </div>
 </div>
  )
}

export default Dashboard