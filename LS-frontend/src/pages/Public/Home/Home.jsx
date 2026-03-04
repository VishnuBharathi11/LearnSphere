import React from "react";
import "./Home.scss";
import web from "../../../assets/Popular Categories/web.png";
import ai from "../../../assets/Popular Categories/artificial-intelligence.png";
import mobile from "../../../assets/Popular Categories/app-development.png";
import ui from "../../../assets/Popular Categories/ui.png";
import cy from "../../../assets/Popular Categories/cyber-security.png";
import data from "../../../assets/Popular Categories/data-science.png";
import applicationImg from "../../../assets/Home/application.png";
import heroVideo from "../../../assets/Home/Hero section.mp4";

import { FaSearch } from "react-icons/fa";
import { FaEnvelope, FaMapMarkerAlt, FaPhoneAlt, FaStar } from "react-icons/fa";
import Footer from "../../../components/Footer/Footer";
import NavBar from "../../../components/NavBar/NavBar";
import { useNavigate } from "react-router-dom";
import About from "../About/About";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <NavBar transparent />
      <section className="hero-section">
        <video
          className="hero-section__video-bg"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div className="hero-section__overlay" />
        <div className="hero-section__content">
          <div className="hero-section__right">
            <div className="main-head">
              Unlock Your
              <br /> <span className="hero-gradient-text">Potential</span> with
              <br /> Online Learning
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
          </div>
        </div>
      </section>

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
      <section className="home-contact" id="contact">
        <div className="home-contact__header">
          <div className="home-contact__eyebrow">Get in Touch</div>
          <h2>Let us help you</h2>
          <p>Our team is here to answer questions about courses, support, and learning paths.</p>
        </div>
        <div className="home-contact__quick">
          <div className="home-contact__item">
            <FaMapMarkerAlt />
            <div>
              <h4>Main Office</h4>
              <p>LearnSphere Support Hub, India</p>
            </div>
          </div>
          <div className="home-contact__item">
            <FaEnvelope />
            <div>
              <h4>Email Address</h4>
              <a href="mailto:learnspheredemo@gmail.com">learnspheredemo@gmail.com</a>
            </div>
          </div>
          <div className="home-contact__item">
            <FaPhoneAlt />
            <div>
              <h4>Phone Number</h4>
              <a href="tel:+919047006761">9047006761</a>
            </div>
          </div>
        </div>
        <div className="home-contact__body">
          <div className="home-contact__content">
            <div className="home-contact__mini-title">Contact Us</div>
            <h3>Have questions? Don't hesitate to contact us</h3>
            <p>
              We can guide you through course selection, account support, and
              instructor onboarding. Send your message and our team will respond quickly.
            </p>
            <div className="home-contact__social-proof">
              <div className="home-contact__avatars">
                <span className="home-contact__avatar">AK</span>
                <span className="home-contact__avatar">RV</span>
                <span className="home-contact__avatar">SM</span>
                <span className="home-contact__avatar">NT</span>
              </div>
              <div className="home-contact__rating">
                <span>
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                  <FaStar />
                </span>
                <small>2.5k+ reviews (4.8 of 5)</small>
              </div>
            </div>
          </div>
          <form className="home-contact__form" autoComplete="off">
            <h4>Get In Touch</h4>
            <input type="text" name="name" placeholder="Enter Name..." />
            <input type="email" name="email" placeholder="Enter Email..." />
            <input type="tel" name="phone" placeholder="Enter Phone..." />
            <textarea name="message" rows={4} placeholder="Enter Your Message..." />
            <button type="button">Send Message</button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  );
}

export default Home;
