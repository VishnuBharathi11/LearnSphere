import React from 'react'
import './Footer.css'
function Footer() {
  return (
    <>
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
  )
}

export default Footer