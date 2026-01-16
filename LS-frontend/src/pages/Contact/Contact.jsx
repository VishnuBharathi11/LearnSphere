import React, {useState } from "react";

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
      localStorage.setItem("user", JSON.stringify(form));
      setForm({ name: "", email: "", role: "", subject: "", message: "" });
    } else {
      setErrors(validationErrors);
    }
  };

  return (
    <>
      <div className="contact">
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
          <div className="ct-card-support">
            <div className="ct-card-icon"></div>
            <div className="ct-card-title">Student Support</div>
            <div className="ct-card-desc">
              Need help with courses, payments, certificates, or account access?
            </div>
            <div className="ct-card-link">support@learnsphere.com</div>
          </div>

          <div className="ct-card-instructor">
            <div className="ct-card-icon"></div>
            <div className="ct-card-title">Instructor Assistance</div>
            <div className="ct-card-desc">
              Questions about course creation, approvals, publishing, or
              earnings.
            </div>
            <div className="ct-card-link">instructors@learnsphere.com</div>
          </div>

          <div className="ct-card-general">
            <div className="ct-card-icon"></div>
            <div className="ct-card-title">General Enquiries</div>
            <div className="ct-card-desc">
              Business partnerships, collaborations, or general questions.
            </div>
            <div className="ct-card-link">info@learnsphere.com</div>
          </div>
        </div>

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
          <div className="ct-cnt-avatar"> have to place avatar </div>
        </div>

        <div className="contact-form">
          <div className="ct-form-title">Send us a message</div>
          <div className="ct-form">
            <form autoComplete="off" onSubmit={handleSubmit}>
              <div className="ct-form-field">
                Name
                <input
                  type="text"
                  name="username"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>
              <div className="ct-form-field">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={form.email}
                  onChange={handleChange}
                />
              </div>
              <div className="ct-form-field">
                Role
                <select name="role" value={form.role} onChange={handleChange}>
                  <option value="">Select a Role</option>
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="visitor">Visitor</option>
                </select>
              </div>
              <div className="ct-form-field">
                Subject
                <select name="subject" value={form.subject}>
                  <option value="">Select a subject</option>
                  <option value="course related issue">
                    Course related issue
                  </option>
                  <option value="payment or billing">Payment or billing</option>
                  <option value="instructor support">Instructor support</option>
                  <option value="general enquiry">General enquiry</option>
                </select>
              </div>
              <div className="ct-form-field">
                Message
                <textarea
                  name="message"
                  placeholder="Write a message here..."
                  value={form.message}
                  onChange={handleChange}
                  rows={4}
                />
              </div>
              <button type="submit" className="ct-form-btn">
                Send Message
              </button>
            </form>
          </div>
        </div>

      </div>
    </>
  );
}

export default Contact;
