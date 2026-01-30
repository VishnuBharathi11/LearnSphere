import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PaymentPage.scss";
import {courses} from "../../../data/courses";
function PaymentPage() {
  const [active, setActice] = useState("card");

  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === Number(id));
  if (!course) return <p>Invalid course</p>;
  const handlePayNow = () => {
    navigate("/payment-success", {
      state: { courseId: course.id },
    });
  };
  return (
    <div className="payment-page">
      <h2>Complete Your Purchase</h2>
      <div className="payment-summary">
        <div className="card paycard">
          <h3>Select Payment Method</h3>
          <div className="payment-methods">
            <button className={active === "card" ? "method-btn active" : "method-btn"} onClick={() => setActice("card")}>Card</button>
            <button className={active === "upi" ? "method-btn active" : "method-btn"} onClick={() => setActice("upi")}>UPI</button>
            <button className={active === "netbanking" ? "method-btn active" : "method-btn"} onClick={() => setActice("netbanking")}>Net Banking</button>
          </div>
          {active === "card" && (
            <div className="payment-form">
              Cardholder Name
              <input type="text" placeholder="Cardholder Name" />
              Card Number
              <input type="text" placeholder="Card Number" />
              <div className="row">
                <div className="row-column">
                  Expiry Date
                  <input type="text" placeholder="MM/YY" />
                </div>
                <div className="row-column">
                  CVV
                  <input type="text" placeholder="CVV" />
                </div>
              </div>
            </div>
          )}
          {active === "upi" && (
            <div className="payment-form">
              UPI
              <input type="text" placeholder="yourname@upi" />
            </div>
          )}
          {active === "netbanking" && (
            <div className="payment-form">
              Select Your Bank
              <select name="" id="">
                <option value="">Choose your bank </option>
                <option value="State Bank of India">State Bank of India</option>
                <option value="HDFC Bank">HDFC Bank</option>
                <option value="ICIC Bank">ICIC Bank</option>
                <option value="Axis Bank">Axis Bank</option>
                <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
              </select>
            </div>
          )}
          <button className="pay-btn" onClick={handlePayNow}>
            Pay ₹{course.price}
          </button>
          <p>
            By completing your purchase, you agree to our{" "}
            <span style={{ color: "#2563eb" }}>Terms</span> &{" "}
            <span style={{ color: "#2563eb" }}>Privacy Policy</span>
          </p>
        </div>
        <div className="card order-summary">
          <h3>Order Summary</h3>
          <p>{course.courseName}</p>
          <strong>Total: ₹{course.price}</strong>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
