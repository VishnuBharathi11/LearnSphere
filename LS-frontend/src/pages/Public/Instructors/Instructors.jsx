import React from "react";
import instructors from "../../../data/instructors";
import { FaLinkedinIn, FaGithub, FaTwitter } from "react-icons/fa";
import "./Instructors.css";
const Instructors = () => {
  return (
    <div className="instructors-page">
      <div className="instructors-hero">
        <h1>Meet Our Instructors</h1>
        <p>
          Learn from industry professionals and domain experts who bring
          real-world experience into every course.
        </p>
      </div>
      <div className="instructors-grid">
        {instructors.map((inst) => (
          <div className="instructor-card" key={inst.id}>
            <img src={inst.image} alt={inst.name} />
            <h3>{inst.name}</h3>
            <p className="role">{inst.role}</p>
            <div className="socials">
              {inst.socials.linkedin && (
                <a href={inst.socials.linkedin} target="_blank" rel="noreferrer">
                  <FaLinkedinIn />
                </a>
              )}
              {inst.socials.github && (
                <a href={inst.socials.github} target="_blank" rel="noreferrer">
                  <FaGithub />
                </a>
              )}
              {inst.socials.twitter && (
                <a href={inst.socials.twitter} target="_blank" rel="noreferrer">
                  <FaTwitter />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Instructors;
