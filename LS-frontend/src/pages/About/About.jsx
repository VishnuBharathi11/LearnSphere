import React from "react";
import './About.css'
import aboutimg from '../../assets/about/aboutimg.jpg'
function About() {
  return (
    <>
      <div className="about">
        <div className="about-content">
          <div className="ab-cont-sub">About LearnSphere</div>
          <div className="ab-cont-mainhead">
            Empowering Learners with Skills 
            That Shape the Future
          </div>
        </div>

        <div className="ab-stats">
          <div className="ab-stats-al">
            <div className="ab-stats-c">10k+</div>
            <div className="ab-stats-st">Active Learners</div>
          </div>
          <div className="ab-stats-ei">
            <div className="ab-stats-c">1.5k+</div>
            <div className="ab-stats-st">Expert Instructors</div>
          </div>
          <div className="ab-stats-cc">
            <div className="ab-stats-c">24.1k+</div>
            <div className="ab-stats-st">Courses Completed</div>
          </div>
        </div>

        <div className="ab-image">
            <img src={aboutimg} alt="studentlearning" width={100} height={100}/>
        </div>
        <div className="ab-box">
            <div className="ab-box1">
                <div className="ab-box-t">🎯 Skill-Focused Learning</div>
                <div className="ab-box-c">
                    Our courses are designed with a strong focus on practical skills and real-world applications.
                    Each lesson is structured to help learners build confidence through hands-on projects and guided practice.
                </div>
            </div>
            <div className="ab-box2">
                <div className="ab-box-t">🧠 Expert-Led Content</div>
                <div className="ab-box-c">
                    Learn from experienced instructors and industry professionals who bring real insights into every course.
                    Our expert-led approach ensures learners gain knowledge that stays relevant in a fast-changing world.
                </div>
            </div>
            <div className="ab-box3">
                <div className="ab-box-t">🚀 Career Growth & Certification</div>
                <div className="ab-box-c">
                    LearnSphere supports learners beyond courses with certifications, progress tracking, and personalized learning paths.
                    Our platform helps you showcase your skills, boost your resume, and move confidently toward your career goals.</div>
            </div>
        </div>

      </div>
    </>
  );
}

export default About;
