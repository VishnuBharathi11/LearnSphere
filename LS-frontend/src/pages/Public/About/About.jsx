import {useNavigate} from "react-router-dom";
import "./About.scss";
import aboutimg from "../../../assets/about/learnImg.png";
import { MdOutlineKeyboardArrowRight } from "react-icons/md";
import { FiArrowRight } from "react-icons/fi";
function About() {
  const navigate=useNavigate();
  return (
    <>
      <div className="about" id="about">
        <div className="ab-title">About Us</div>
        <div className="about-content">
          <div className="ab-cont-sub">About LearnSphere</div>
          <div className="ab-mainhead-stats">
            <div className="ab-cont-mainhead">
            Learn the Skills Needed <br />
            to Advance Your Tech Career
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
        </div>
        <p className="ab-desc">
          LearnSphere is a career-focused learning platform designed to
          make quality education practical and accessible. We connect you
          with industry professionals, structured learning paths, and
          real-world projects so you can build job-ready skills.
        </p>
      </div>
      <div className="ab-img-box">
        <div className="ab-image">
          <img src={aboutimg} alt="studentlearning" />
        </div>
        <div className="ab-box">
          <div className="ab-box-small">
            <div className="ab-card highlight">
              <div className="ab-box-t">Skill-Focused Learning</div>
              <div className="ab-box-c">
                Our courses are designed with a strong focus on practical
                skills and real-world applications. Each lesson is structured
                to help learners build confidence through hands-on projects
                and guided practice.
              </div>
              <div className="ab-btn">
                <button onClick={()=>navigate("/courses?source=explore")}>
                  Explore Courses <FiArrowRight />
                </button>
              </div>
            </div>
            <div className="ab-card">
              <div className="ab-box-t">Expert-Led Content</div>
              <div className="ab-box-c">
                Learn from experienced instructors and industry professionals
                who bring real insights into every course. Our expert-led
                approach ensures learners gain knowledge that stays relevant
                in a fast-changing world.
              </div>
              <div className="ab-btn">
                <button onClick={()=>navigate("instructors")}>
                  Meet Our Instructors <FiArrowRight />
                </button>
              </div>
            </div>
          </div>
          <div className="ab-card large">
            <div className="ab-box-t">Career Growth & Certification</div>
            <div className="ab-box-c">
              LearnSphere supports your learning goals with progress tracking,
              expert support, and certificate generation. We help you
              demonstrate your capabilities, boost your resume, and move
              confidently toward your career milestones.
            </div>
            <div className="ab-btn ab-primary">
                <button onClick={()=>navigate("/courses?source=cta")}>
                  Start Learning Today <MdOutlineKeyboardArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
export default About;