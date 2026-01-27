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

function Dashboard() {
  return (
    <div>
      <SidebarStudent/>
    </div>
  )
}

export default Dashboard