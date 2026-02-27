import React from "react";
import "./Home.scss";
import web from "../../../assets/Popular Categories/web.png";
import ai from "../../../assets/Popular Categories/artificial-intelligence.png";
import mobile from "../../../assets/Popular Categories/app-development.png";
import ui from "../../../assets/Popular Categories/ui.png";
import cy from "../../../assets/Popular Categories/cyber-security.png";
import data from "../../../assets/Popular Categories/data-science.png";
import applicationImg from "../../../assets/Home/application.png";

import { FaSearch } from "react-icons/fa";
import Footer from "../../../components/Footer/Footer";
import NavBar from "../../../components/NavBar/NavBar";
import { useNavigate } from "react-router-dom";
import About from "../About/About";
import Contact from "../Contact/Contact";
import { featuredCourses } from "../../../data/courses";
function Home() {
  const navigate = useNavigate();
  return (
    <>
      <NavBar />
      <div className="main-head">
        Unlock Your
        <br /> Potential with
        <br /> Online Learning
      </div>
      <div className="sub-main">
        LearnSphere helps you master new skills with high-quality courses,
        expert instructors, and flexible learning paths tailored for you.
      </div>

      <div className="search">
        <input
          type="search"
          name="search"
          placeholder="Search for Courses,Instructors..."
        />
        <div>
          <FaSearch />
        </div>
      </div>
      <div className="btn-get-browse">
        <button className="btn-get" onClick={() => navigate("/free-courses")}>
          Get Started for Free
        </button>
        <button className="btn-browse" onClick={() => navigate("/courses")}>
          Browse Course
        </button>
      </div>

      <div className="pop-cat">
        <div className="pop-cat-head">Popular Categories</div>

        <div className="pop-cat-box">
          <div className="pop-cat-cont">
            <div className="pop-cat-font">
              <img src={web} />
              <div className="pop-cat-title">Web Development</div>
              <div className="pop-cat-in-font">
                Master HTML, CSS, <br />
                JavaScript, and <br />
                modern frameworks.
              </div>
            </div>
          </div>

          <div className="pop-cat-cont">
            <div className="pop-cat-font">
              <img src={ui} />
              <div className="pop-cat-title">UI/UX Design</div>
              <div className="pop-cat-in-font">
                Learn wireframing, <br />
                prototyping, and <br />
                design thinking.
              </div>
            </div>
          </div>

          <div className="pop-cat-cont">
            <div className="pop-cat-font">
              <img src={data} />
              <div className="pop-cat-title">Data Science</div>
              <div className="pop-cat-in-font">
                Explore Python, ML <br />
                models, and real-
                <br />
                world datasets.
              </div>
            </div>
          </div>

          <div className="pop-cat-cont">
            <div className="pop-cat-font">
              <img src={mobile} />
              <div className="pop-cat-title">Mobile Development</div>
              <div className="pop-cat-in-font">
                Build Android & iOS <br />
                apps with Flutter and
                <br /> React Native.
              </div>
            </div>
          </div>

          <div className="pop-cat-cont">
            <div className="pop-cat-font">
              <img src={ai} />
              <div className="pop-cat-title">Artificial Intelligence</div>
              <div className="pop-cat-in-font">
                Understand neural <br />
                networks, NLP, and <br />
                deep learning.
              </div>
            </div>
          </div>

          <div className="pop-cat-cont">
            <div className="pop-cat-font">
              <img src={cy} />
              <div className="pop-cat-title">Cybersecurity</div>
              <div className="pop-cat-in-font">
                Protect systems with <br />
                ethical hacking and <br />
                security tools.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fea-cour">
        <div className="pop-cat-head">Featured Courses</div>
        <div className="fea-cat-sub-title">
          Learn from high-quality courses curated by industry experts.
        </div>
        <div className="fea-cour-box">
          {featuredCourses.map((course) => (
            <div className="fea-cour-cont" key={course.id}>
              <div className="fea-cour-title-align">
                <img
                  src={course.thumbnail || "/assets/course-placeholder.png"}
                  alt={course.courseName}
                />
                <div className="fea-cour-title">
                  {course.courseName}
                  <br />
                  <span className="fea-cour-inst-name">
                    {course.instructor}
                  </span>
                </div>
              </div>
              <div className="fea-cour-review">
                ⭐ {course.rating}
                <span className="fea-cour-price">
                  {course.price === 0 ? "Free" : `₹${course.price}`}
                </span>
              </div>
              <div className="fea-cour-module-font">
                {course.category} • {course.level}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="instructor-cta">
        <div className="instructor-cta__card">
          <div className="instructor-cta__image">
            <img src={applicationImg} alt="Become an instructor" />
          </div>
          <div className="instructor-cta__content">
            <h2>Become a LearnSphere Instructor</h2>
            <p>
              Share your expertise with thousands of learners. Build your profile, publish
              high-quality courses, and grow your impact with our community.
            </p>
            <div className="instructor-cta__meta">
              Flexible schedule - Dedicated support - Professional growth
            </div>
            <div className="instructor-cta__actions">
              <button
                className="instructor-cta__button"
                onClick={() => navigate("/instructor-application")}
              >
                Send Application
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="why-learn">
        <div className="pop-cat-head">Why LearnSphere</div>

        <div className="why-learn-box">
          <div className="why-learn-cont">
            <img src={web} />
            <div className="why-learn-title">Expert Instructors</div>
            <div className="why-learn-in-font">
              Learn from industry professionals with real-world experience
              across multiple domains.
            </div>
          </div>

          <div className="why-learn-cont">
            <img src={web} />
            <div className="why-learn-title">
              Structured <br />
              Learning Path
            </div>
            <div className="why-learn-in-font">
              Follow well-designed course paths to grow from beginner to
              advanced levels efficiently.
            </div>
          </div>

          <div className="why-learn-cont">
            <img src={web} />
            <div className="why-learn-title">
              Hands-On <br />
              Projects
            </div>
            <div className="why-learn-in-font">
              Build real projects that strengthen your portfolio and practical
              skills.
            </div>
          </div>

          <div className="why-learn-cont">
            <img src={web} />
            <div className="why-learn-title">Certified Courses</div>
            <div className="why-learn-in-font">
              Receive shareable certificates for every completed course to boost
              your resume.
            </div>
          </div>

          <div className="why-learn-cont">
            <img src={web} />
            <div className="why-learn-title">Personalized Learning</div>
            <div className="why-learn-in-font">
              AI-powered suggestions to help you discover courses based on your
              goals and interests.
            </div>
          </div>
        </div>
      </div>
      <About />
      <Contact />
      <Footer />
    </>
  );
}

export default Home;
