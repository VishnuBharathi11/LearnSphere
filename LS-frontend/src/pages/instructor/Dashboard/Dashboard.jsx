import React, { useMemo } from "react";
import {
  BookOpen,
  Users,
  Star,
  DollarSign,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import "./Dashboard.scss";
function Dashboard() {
  const { stats, enrollmentData, coursePerformance, recentActivities } =
    useMemo(() => {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser || currentUser.role !== "instructor") {
        return {
          stats: [],
          enrollmentData: [],
          coursePerformance: [],
          recentActivities: [],
        };
      }
      const allCourses = JSON.parse(localStorage.getItem("courses")) || [];
      const enrolledCourses =
        JSON.parse(localStorage.getItem("enrolledCourses")) || [];
      const ratings = JSON.parse(localStorage.getItem("courseRatings")) || [];

      const instructorCourses = allCourses.filter(
        (c) => c.instructorId === currentUser.id,
      );

      const totalCourses = instructorCourses.length;
      const instructorEnrollments = enrolledCourses.filter((ec) =>
        instructorCourses.some((c) => c.id === ec.courseId)
      );
      const totalStudents = instructorEnrollments.length;
      const totalRevenue = instructorEnrollments.reduce((sum, ec) => {
        const course = instructorCourses.find((c) => c.id === ec.courseId);
        if(!course||course.price<=0||course.status!=="published")
          return sum;
        return sum+course.price;
      }, 0);
      const instructorRatings = ratings.filter((r) =>
        instructorCourses.some((c) => c.id === r.courseId),
      );
      const avgRating =
        instructorRatings.length === 0
          ? 0
          : (
              instructorRatings.reduce((sum, r) => sum + r.rating, 0) /
              instructorRatings.length
            ).toFixed(1);

      const stats = [
        {
          title: "Total Courses",
          value: totalCourses,
          icon: BookOpen,
          color: "blue",
        },
        {
          title: "Total Students",
          value: totalStudents,
          icon: Users,
          color: "yellow",
        },
        {
          title: "Avg. Rating",
          value: avgRating,
          icon: Star,
          color: "green",
        },
        {
          title: "Revenue",
          value: `₹${totalRevenue}`,
          icon: DollarSign,
          color: "red",
        },
      ];

      const monthMap = {};
      instructorEnrollments.forEach((ec) => {
        if(!ec.enrolledAt)
          return;
        const date=new Date(ec.enrolledAt);
        const key=`${date.getFullYear()}-${date.getMonth()}`;
        monthMap[key]=(monthMap[key]||0)+1;
      });
      const enrollmentData = Object.entries(monthMap)
      .sort(([a],[b])=>new Date(a)-new Date(b))
      .map(([key,count])=>{
        const[year,month]=key.split("-");
        const label=new Date(year,month).toLocaleString("default",{month:"short",});
        return {month:label,students:count};
      });

      const coursePerformance = instructorCourses.map((course) => {
        const courseEnrollments = instructorEnrollments.filter(
          (ec) => ec.courseId === course.id,
        );
        const completed = courseEnrollments.filter(
          (ec) =>{
            const totalLessons=ec.totalLessons??course.lessons??0;
            return totalLessons>0&&ec.completedLessons===totalLessons;
          }).length;
        const completion =
          courseEnrollments.length === 0
            ? 0
            : Math.floor((completed / courseEnrollments.length) * 100);
        return {
          course: course.courseName,
          completion,
        };
      });

      const recentActivities = instructorEnrollments
        .slice(-5)
        .reverse()
        .map((ec) => {
          const course = instructorCourses.find((c) => c.id === ec.courseId);
          return {
            text: `New Enrollment in "${course?.courseName || "Course"}"`,
            time: new Date(ec.enrolledAt).toLocaleDateString(),
          };
        });
      return {
        stats,
        enrollmentData,
        coursePerformance,
        recentActivities,
      };
    }, []);
  return (
    <div className="instructor-layout">
      <div className="instructor-dashboard">
        <div className="status-grid">
          {stats.map((item, index) => {
            const Icon = item.icon;
            return (
              <div className={`status-card status-${item.color}`} key={index}>
                <div className="status-icon">
                  <Icon size={22} />
                </div>

                <div className="status-content">
                  <strong>{item.value}</strong>
                  <span>{item.title}</span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="chart-grid">
          <div className="chart-card">
            <div className="chart-header">
              <TrendingUp size={20} />
              <h3>Student Enrollment (Monthly)</h3>
            </div>
            <div className="bar-chart">
              {enrollmentData.length===0?(
                <p>No enrollment data</p>
              ):(
              enrollmentData.map((data, index) => (
                <div className="bar-item" key={index}>
                  <div
                    className="bar"
                    style={{
                      height: `${Math.min((data.students / 10) * 100, 100)}%`,
                    }}
                  ></div>
                  <span className="bar-value">{data.students}</span>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))
            )}
            </div>
          </div>
          <div className="chart-card">
            <div className="chart-header">
              <BarChart3 size={20} />
              <h3>Course Completion Rate</h3>
            </div>
            {coursePerformance.length===0?(
              <p>No course data</p>
            ):(
            coursePerformance.map((course, index) => (
              <div className="progress-row" key={index}>
                <div className="progress-info">
                  <span>{course.course}</span>
                  <span>{course.completion}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${course.completion}%` }}
                  ></div>
                </div>
              </div>
            )))}
          </div>
        </div>
        <div className="activity-card">
          <h3>Recent Activity</h3>
          {recentActivities.length === 0 ? (
            <p>No recent activity</p>
          ) : (
            recentActivities.map((activity, index) => (
              <div className="activity-item" key={index}>
                <span className="dot"></span>
                <div>
                  <p>{activity.text}</p>
                  <small>{activity.time}</small>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
