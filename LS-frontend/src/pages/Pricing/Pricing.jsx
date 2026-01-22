import React from "react";
import { BookmarkIcon } from "@heroicons/react/24/solid";
import { FlagIcon } from "@heroicons/react/24/solid";
import { Crown } from "lucide-react";
// import icon1 from "../../assets/Pricing/save.svg";
// import icon2 from "../../assets/Pricing/flag.svg";
// import icon3 from "../../assets/Pricing/crown.svg";
import "./Pricing.css";
function Pricing() {
  return (
    <div className="pricing" id="pricing">
      <div className="pricing-header">
        <div className="p-title">Pricing Plans</div>
        <div className="p-sub-title">Choose the plan that fits your goals</div>
      </div>
      <div className="card-layout">
        <div className="price-card ">
          <BookmarkIcon className="pricing-icon" />
          <div className="card-title">Basic</div>
          <div className="price">
            ₹0 <span className="price-muted">/ Free</span>
          </div>
          <div className="tag">For Beginners</div>
          <div className="line"></div>
          <ul className="pricing-features">
            <li className="included">Access to free courses</li>
            <li className="included">Community support</li>
            <li className="included">Course completion certificate</li>
            <li className="excluded">No premium courses</li>
            <li className="excluded">No instructor Q&A</li>
          </ul>
          <div className="pricing-btn">
            <button>Get Started</button>
          </div>
        </div>
        <div className="price-card pro">
          <FlagIcon className="pricing-icon pro" />
          <div className="card-title">Pro (Most Popular)</div>
          <div className="price">
            ₹999 <span className="price-muted">/month</span>
          </div>
          <div className="tag">For Dedicated Learners</div>
          <div className="line"></div>
          <ul className="pricing-features">
            <li className="included">All Basic features</li>
            <li className="included">Access to premium courses</li>
            <li className="included">Instructor Q&A</li>
            <li className="included">Downloadable resources</li>
            <li className="included">Course progress tracking</li>
          </ul>
          <div className="pricing-btn">
            <button>Start Learning</button>
          </div>
        </div>
        <div className="price-card premium">
          <Crown className="pricing-icon premium" />
          <div className="card-title">Premium</div>
          <div className="price">
            ₹4999 <span className="price-muted">/year</span>
          </div>
          <div className="tag">Best value</div>
          <div className="line"></div>
          <ul className="pricing-features">
            <li className="included">All Pro features</li>
            <li className="included">1-on-1 mentor sessions</li>
            <li className="included">Career roadmap</li>
            <li className="included">Resume & interview prep</li>
            <li className="included">Priority support</li>
          </ul>
          <div className="pricing-btn">
            <button>Upgrade Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Pricing;
