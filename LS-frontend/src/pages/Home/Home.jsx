import React from 'react';
import './Home.css';
import { Link } from 'react-router-dom';
import logo from '../../assets/Logo/logo.png'
import web from '../../assets/Popular Categories/web.png'; 
import ai from '../../assets/Popular Categories/artificial-intelligence.png'; 
import mobile from '../../assets/Popular Categories/app-development.png'; 
import ui from '../../assets/Popular Categories/ui.png'; 
import cy from '../../assets/Popular Categories/cyber-security.png'; 
import data from '../../assets/Popular Categories/data-science.png'; 
import f1 from '../../assets/Featured Courses/1.jpg'; 
import f2 from '../../assets/Featured Courses/2.jpg'; 
import f3 from '../../assets/Featured Courses/3.jpg'; 
import f4 from '../../assets/Featured Courses/4.jpg'; 
import { FaSearch } from "react-icons/fa";
function Home() {
  return (
    <> 
      <nav className="navbar">
        <img src={logo} className="logo"/>
         <div className="page-name">LearnSphere</div>

      <div className="nav-links">
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      <Link to="/pricing">Pricing</Link>
      <Link to="/contact">Contact</Link>
      </div>

      <div className="nav-actions">
      <Link to="/login" className='btn-login'>Login</Link>
      <Link to="/register" className='btn-register'>Register</Link>
      </div>

      </nav>


      <div className="main-head">Unlock Your<br/> Potential with<br/> Online Learning</div>

      <div className="sub-main">LearnSphere helps you master new skills with high-quality courses, expert instructors, and flexible learning paths tailored for you.</div>   

      <div className="search">
        <input type='search' name='search' placeholder='Search for Courses,Instructors...'/>
        <div><FaSearch/></div>
      </div>
      <div className="btn-get-browse">
        <button className="btn-get">Get Started for Free</button>
        <button className="btn-browse">Browse Course</button>
      </div>

      <div className="pop-cat">
      <div className="pop-cat-head">Popular Categories</div>
      
      <div className="pop-cat-box">

      <div className="pop-cat-cont">
          <div className="pop-cat-font">
          <img src={web}/>
          <div className="pop-cat-title">Web Development</div>
          <div className="pop-cat-in-font">Master HTML, CSS, <br/>JavaScript, and <br/>modern frameworks.</div>
          </div>
      </div>

        <div className="pop-cat-cont">
          <div className="pop-cat-font">
         <img src={ui}/>
          <div className="pop-cat-title">UI/UX Design</div>
          <div className="pop-cat-in-font">Learn wireframing, <br/>prototyping, and <br/>design thinking.</div>
          </div>
       </div>

        <div className="pop-cat-cont">
          <div className="pop-cat-font">
          <img src={data}/>
          <div className="pop-cat-title">Data Science</div>
          <div className="pop-cat-in-font">Explore Python, ML <br/>models, and real-<br/>world datasets.</div>
          </div>
        </div>

        <div className="pop-cat-cont">
          <div className="pop-cat-font">
          <img src={mobile}/>
          <div className="pop-cat-title">Mobile Development</div>
          <div className="pop-cat-in-font">Build Android & iOS <br/>apps with Flutter and<br/> React Native.</div>
          </div>
        </div>

        <div className="pop-cat-cont">
          <div className="pop-cat-font">
          <img src={ai}/>
          <div className="pop-cat-title">Artificial Intelligence</div>
          <div className="pop-cat-in-font">Understand neural <br/>networks, NLP, and <br/>deep learning.</div>
          </div>
        </div>

         <div className="pop-cat-cont">
          <div className="pop-cat-font">
          <img src={cy}/>
          <div className="pop-cat-title">Cybersecurity</div>
          <div className="pop-cat-in-font">Protect systems with <br/>ethical hacking and <br/>security tools.</div>
          </div>
        </div>
        </div>
  
      </div>

       <div className="fea-cour">
        <div className="pop-cat-head">Featured Courses Section</div>
        <div className="fea-cat-sub-title">Learn from high-quality courses curated by industry experts.</div>
      
       <div className="fea-cour-box">
        
          <div className="fea-cour-cont">
          <div className="fea-cour-title-align">
          <img src={f1}/>
          <div className="fea-cour-title">Modern Frontend Development with React <br/><span className="fea-cour-inst-name">Arun Prakash</span></div>
          </div>
          <div className="fea-cour-review">⭐ 4.8 (1.4k reviews)
          <span className="fea-cour-price">₹799</span>
          </div>
          <div className="fea-cour-module-font">React • JavaScript • UI Development</div>
          </div>

          <div className="fea-cour-cont">
            <div className="fea-cour-title-align">
          <img src={f2}/>
          <div className="fea-cour-title">Artificial Intelligence & Deep Learning Bootcamp<br/><span className="fea-cour-inst-name">Tony Stark</span></div>
          </div>
          <div className="fea-cour-review">⭐ 4.9 (4.2k reviews)
          <span className="fea-cour-price">₹1099</span>
          </div>
          <div className="fea-cour-module-font">Neural Networks • TensorFlow • Deep Learning</div>
          </div>

          <div className="fea-cour-cont">
            <div className="fea-cour-title-align">
          <img src={f3}/>
          <div className="fea-cour-title">Python Programming for Data Science & ML<br/><span className="fea-cour-inst-name">Dr. Kishore Menon</span></div>
          </div>
          <div className="fea-cour-review">⭐ 4.7 (2.6k reviews)<span className="fea-cour-price">₹699</span></div>
          <div className="fea-cour-module-font">Python • ML • Pandas</div>
          </div>

          <div className="fea-cour-cont">
            <div className="fea-cour-title-align">
          <img src={f4}/>
          <div className="fea-cour-title">Ethical Hacking & Cybersecurity Basics <br/><span className="fea-cour-inst-name">Maya Joseph</span></div>
          </div>
          <div className="fea-cour-review">⭐ 4.6 (1.8k reviews)
          <span className="fea-cour-price">₹899</span>
          </div>
          <div className="fea-cour-module-font">Cybersecurity • Networking • Tools</div>
          </div>
        </div>
      </div>

      <div className="why-learn">
      <div className="pop-cat-head">Why LearnSphere</div>

      <div className="why-learn-box">

        <div className="why-learn-cont">
        <img src={web}/>
          <div className="why-learn-title">Expert Instructors</div>
          <div className="why-learn-in-font">Learn from industry professionals with real-world experience across multiple domains.</div>
        </div>

        <div className="why-learn-cont">
          <img src={web}/>
          <div className="why-learn-title">Structured <br/>Learning Path</div>
          <div className="why-learn-in-font">Follow well-designed course paths to grow from beginner to advanced levels efficiently.</div>
        </div>

        <div className="why-learn-cont">
          <img src={web}/>
          <div className="why-learn-title">Hands-On <br/>Projects</div>
          <div className="why-learn-in-font">Build real projects that strengthen your portfolio
           and practical skills.</div>
        </div>
      
        <div className="why-learn-cont">
          <img src={web}/>
          <div className="why-learn-title">Certified Courses</div>
          <div className="why-learn-in-font">Receive shareable certificates for every completed course to boost your resume.</div>
        </div>

        <div className="why-learn-cont">
          <img src={web}/>
          <div className="why-learn-title">Personalized Learning</div>
          <div className="why-learn-in-font">AI-powered suggestions to help you discover courses 
          based on your goals and interests.</div>
        </div>
      </div>
      </div>

      <footer className="footer">
  <div className="footer-container">

    <div className="footer-column">
      <div className="footer-head">LearnSphere</div>
      <div className="footer-item">About us</div>
      <div className="footer-item">Courses</div>
      <div className="footer-item">Categories</div>
      <div className="footer-item">Contact us</div>
    </div>

    <div className="footer-column">
      <div className="footer-head">Support</div>
      <div className="footer-item">Help center</div>
      <div className="footer-item">FAQs</div>
      <div className="footer-item">Terms of Service</div>
      <div className="footer-item">Privacy Policy</div>
    </div>

    <div className="footer-column">
      <div className="footer-head">Follow Us</div>
      <div className="footer-item">Facebook</div>
      <div className="footer-item">Twitter</div>
      <div className="footer-item">LinkedIn</div>
    </div>

    <div className="footer-column">
      <div className="footer-head">Get in Touch</div>
      <div className="footer-item">info@learnsphere.com</div>
    </div>

     </div>

      <div className="footer-bottom">© 2025 LearnSphere. All rights reserved
      </div>
      <div className="logo-text">
      <div className="footer-brand-learn ">Learn</div><span className="footer-brand">Sphere</span>
      </div>
     </footer>
    </>
  );
}

export default Home;