import { useNavigate, useParams } from "react-router-dom";
import "./PaymentPage.scss";
import {courses} from "../../../data/courses";
function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const course = courses.find((c) => c.id === Number(id));
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!course) return <p>Invalid course</p>;
  const handlePayNow = () => {
     if (!currentUser) {
      navigate("/login");
      return;
    }
    navigate("/payment-success", {
      state: { courseId: course.id ,paymentId:"TEMP-"+Date.now(),},
    });
  };
  return (
    <div className="payment-page">
      <h2>Complete Your Purchase</h2>

      <div className="payment-summary">
        <div className="card paycard">
          <h3>{course.courseName}</h3>
          <p>Total: ₹{course.price}</p>

          <button className="pay-btn" onClick={handlePayNow}>
            Pay ₹{course.price}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;
