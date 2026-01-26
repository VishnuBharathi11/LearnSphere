import React from "react";
import "./Dashboard.css";
import SidebarStudent from "../../components/SideBar-S/SidebarStudent";
import { IoIosNotifications } from "react-icons/io";
import { CgProfile } from "react-icons/cg";
import courses from "../../data/courses";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";


const learningProgressData = [
  { day: "Sunday", hours: 3 },
  { day: "Monday", hours: 5 },
  { day: "Tuesday", hours: 7 },
  { day: "Wednesday", hours: 6 },
  { day: "Thursday", hours: 8 },
  { day: "Friday", hours: 10 },
  { day: "Saturday", hours: 13 },
];


function Dashboard() {
  return (
    <div className="dashboard-layout">
      <SidebarStudent />

      <div className="classname">
        <input type="search" placeholder="search for courses..."/>
        <IoIosNotifications />
        <CgProfile />
      </div>

      <div className="classname">
        <div>Welcome back , Vishnu!</div>
        <div>Keep Learning!</div>
        <button>Continue Learning</button>
      </div>

      <div className="classname">

        <div className="classname">
          <div className="">5</div>
          <div className="classname">Enrolled Courses</div>
        </div>

        <div className="classname">
          <div className="">25</div>
          <div className="classname">Lessons Completed</div>
        </div>

        <div className="classname">
          <div className="">6</div>
          <div className="classname">Certificates</div>
        </div>

        <div className="classname">
          <div className="">45</div>
          <div className="classname">Hours Studied</div>
        </div>

      </div>

      <div className="classname">

        <ResponsiveContainer width="300px" height={180}>
        <LineChart
          data={learningProgressData}
          margin={{ top: 0, right: 20, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="hours"
            stroke="#4A6CF7"
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      </div>

      <div className="classname"> Continue Learning</div>

      <div className="classname">

        {/* {
          courses.map((course,index)=>(

          ))
        } */}
      </div>

    </div>
  );
}

export default Dashboard;
