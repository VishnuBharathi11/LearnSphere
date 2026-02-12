import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import "./Certificate.scss";
import certificateImage from "../../../assets/Learner/certificate.png";
function Certificate() {
  const location = useLocation();
  const {id}=useParams();
  const results=JSON.parse(localStorage.getItem("testResults"))||[];
  const result=results.find((r)=>r.courseId===Number(id));
  if(!result||result.passed){
    return <p style={{ padding: 40 }}>Certificate locked. Pass assessment first.</p>
  }
  const courseName =
    location.state?.courseName||"Course";
    const handleDownload=async()=>{
      try {
        const response=await fetch(
          `https://localhost:8080/api/certificate/${id}`,
          {
            method:"GET",headers:{Accept:"application/pdf"},
          }
        );
        if(!response.ok){
          throw new Error("Certificate download failed");
        }
        const blob=await response.blob();
        const url=window.URL.createObjectURL(blob);
        const link=document.createElement("a");
        link.href=url;
        link.download=`${courseName}-certificate.pdf`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error("Download Error:",error);
        alert("Unable to download certificate")
      }
    };
  return (
    <div className="certificate-page">
      <div className="certificate-header">
        <div>
          <h2>{courseName} Certificate</h2>
        </div>
      </div>
      <div className="certificate-layout">
        <div className="certificate-preview">
          <img
            src={certificateImage}
            alt="Certificate"
            className="certificate-image"
          />
        </div>
        <div className="certificate-actions">
          <div className="cert-meta">
            <p><span>Course</span>{courseName}</p>
            <p><span>Learner</span>Peter Parker</p>
            <p><span>Issued</span>12 Feb 2026</p>
            <p><span>Certificate</span>LS-2026-00125</p>
          </div>
          <button className="download-btn" onClick={handleDownload}>Download PDF</button>
          <button className="share-btn">Share on LinkedIn</button>
        </div>
      </div>
    </div>
  );
}

export default Certificate;
