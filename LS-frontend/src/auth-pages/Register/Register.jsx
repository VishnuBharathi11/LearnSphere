import React,{useState} from "react";
import "./Register.scss";
import { Link, useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import Footer from "../../components/Footer/Footer";

function Register() {
  const navigate=useNavigate();
  const[form,setForm]=useState({
    username:"",
    email:"",
    phone:"",
    password:"",
    confirmPassword:"",
    role:"learner",
  });
  const[error,setError]=useState("");
  const handleChange=(e)=>{
    setForm({...form,[e.target.name]:e.target.value});
  }
  const handleRegister=(e)=>{
    e.preventDefault();
    if(!form.username||!form.email||!form.password){
      setError("Please fill all required feilds");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    const users=JSON.parse(localStorage.getItem("users"))||[];
    if(users.some((u)=>u.email===form.email)){
      setError("Email already registered");
      return;
    }
    const newUser={
      id:Date.now(),
      username:form.username,
      email:form.email,
      phone:form.phone,
      password:form.password,
      role:form.role,
    };
    localStorage.setItem("users",JSON.stringify([...users,newUser]));
    alert("Registration successful!");
    navigate("/login");
  }
  return (
    <>
    <NavBar/>
    <div className="reg-form">
      <div className="reg-form-card">
        <div className="reg-page-name">LearnSphere</div>
        <div className="reg-form-welcome">
          Create Account
          <p>Join LearnSphere today</p>
        </div>
        {error&&<p className="error">{error}</p>}
        <form onSubmit={handleRegister} autoComplete="off">
          <div className="reg-form-input">
              <input
                name="username"
                type="text"
                placeholder="Username"
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-form-input">
              <input
                name="email"
                type="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-form-input">
              <input
                name="phone"
                type="text"
                placeholder="Phone Number"
                onChange={handleChange}
              />
            </div>
            <div className="reg-form-input">
              <select name="role" onChange={handleChange}>
                <option value="learner">Learner</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>
            <div className="reg-form-input">
              <input
                name="password"
                type="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
            </div>
            <div className="reg-form-input">
              <input
                name="confirmPassword"
                type="password"
                placeholder="Confirm Password"
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" className="reg-form-btn">
              Register
            </button>
        </form>
        <div className="reg-form-login">
          Already have an account?
          <Link to="/login" className="reg-text">
            Login
          </Link>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default Register;
