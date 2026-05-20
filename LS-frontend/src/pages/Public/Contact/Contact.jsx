import React, { useState } from "react";
import "./Contact.scss";
import headset from "../../../assets/Contact/headset.png";
import school from "../../../assets/Contact/school.png";
import teacher from "../../../assets/Contact/teacher.png";
import email from "../../../assets/Contact/message.png";
import avatar1 from "../../../assets/Contact/avatar1.png";
import avatar2 from "../../../assets/Contact/avatar2.png";
import avatar3 from "../../../assets/Contact/avatar3.png";
import avatar4 from "../../../assets/Contact/avatar4.png";
import avatar5 from "../../../assets/Contact/avatar5.png";
import avatar6 from "../../../assets/Contact/avatar6.png";

function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validate = () => {
    let err = {};
    if (!form.name.trim()) err.name = "name is required";
    if (!form.email.trim()) err.email = "email is required";
    else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9._]+\.[a-zA-Z]{2,}$/.test(form.email)
    )
      err.email = "invalid email";
    if (!form.role) err.role = "select a role";
    if (!form.subject) err.subject = "select a subject";
    if (!form.message.trim()) err.message = "message cannot be empty";
    return err;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      alert("User logged in successfully");
      setForm({ name: "", email: "", role: "", subject: "", message: "" });
    } else {
      setErrors(validationErrors);
    }
  };
  const handleSendMessage=()=>{
    alert("Message Sent Successfully");
  }

  return (
    <>
      <div className="contact" id="contact">
        <div className="contact-header">
          <div className="ct-title">Contact Us</div>
          <div className="ct-title-sub">
            Have questions? We’re here to help you learn better.
          </div>
          <div className="ct-title-meta">
            Support • Instructor Help • Partnerships • General Enquiries
          </div>
        </div>

        <div className="contact-card">
          <div className="ct-card student">
            <div className="ct-card-icon">
              {" "}
              <img src={headset} />
            </div>
            <div className="ct-card-title">Student Support</div>
            <div className="ct-card-desc">
              Need help with courses, <br /> payments, certificates, <br /> or
              account access?
            </div>
            <div className="ct-card-email ">
              {" "}
              <img src={email} /> support@learnsphere.com
            </div>
          </div>

          <div className="ct-card instructor">
            <div className="ct-card-icon">
              {" "}
              <img src={teacher} />{" "}
            </div>
            <div className="ct-card-title">Instructor Assistance</div>
            <div className="ct-card-desc">
              Questions about course <br /> creation, approvals, <br />{" "}
              publishing, or earnings.
            </div>
            <div className="ct-card-email ct-primary">
              {" "}
              <img src={email} /> instructors@learnsphere.com
            </div>
          </div>

          <div className="ct-card general">
            <div className="ct-card-icon">
              {" "}
              <img src={school} />{" "}
            </div>
            <div className="ct-card-title">General Enquiries</div>
            <div className="ct-card-desc">
              Business partnerships, <br /> collaborations, or general
              questions.
            </div>
            <div className="ct-card-email ct-secondary">
              {" "}
              <img src={email} /> info@learnsphere.com
            </div>
          </div>
        </div>

        <div className="ct-content-form">
          <div className="contact-content">
            <div className="ct-cnt-label">GET IN TOUCH</div>
            <div className="ct-cnt-head">
              Have questions? <br /> Don’t hesitate to contact us
            </div>
            <div className="ct-cnt-text">
              At LearnSphere, we’re committed to making quality <br />
              education accessible and practical. Whether you’re <br />
              a learner or an instructor, our team is here to support <br />
              you every step of the way.
            </div>
            <div className="ct-cnt-trust">
              Trusted by 10,000+ learners and 1,500+ instructors
            </div>
            <div className="ct-cnt-avatar">
              <img src={avatar1} />
              <img src={avatar2} />
              <img src={avatar3} />
              <img src={avatar4} />
              <img src={avatar5} />
              <img src={avatar6} />
            </div>
          </div>

          <div className="contact-form">
            <div className="ct-form-title">Send us a message</div>
            <div className="ct-form">
              <form autoComplete="off" onSubmit={handleSubmit}>
                <div className="ct-form-field">
                  <label> Name </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <p className="error">{errors.name}</p>}
                </div>
                <div className="ct-form-field">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter your email address"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <p className="error">{errors.email}</p>}
                </div>
                <div className="ct-form-field">
                  <label>Role</label>
                  <select name="role" value={form.role} onChange={handleChange}>
                    <option value="">Select a Role</option>
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="visitor">Visitor</option>
                  </select>
                  {errors.role && <p className="error">{errors.role}</p>}
                </div>
                <div className="ct-form-field">
                  <label>Subject</label>
                  <select name="subject" value={form.subject} onChange={handleChange}>
                    <option value="">Select a subject</option>
                    <option value="course related issue">
                      Course related issue
                    </option>
                    <option value="payment or billing">
                      Payment or billing
                    </option>
                    <option value="instructor support">
                      Instructor support
                    </option>
                    <option value="general enquiry">General enquiry</option>
                  </select>
                  {errors.subject && <p className="error">{errors.subject}</p>}
                </div>
                <div className="ct-form-field">
                  <textarea
                    name="message"
                    placeholder="Write a message here..."
                    value={form.message}
                    onChange={handleChange}
                    rows={4}
                  />
                  {errors.message && <p className="error">{errors.message}</p>}
                </div>
                <button type="submit" className="ct-form-btn" onClick={handleSendMessage}>
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Contact;
