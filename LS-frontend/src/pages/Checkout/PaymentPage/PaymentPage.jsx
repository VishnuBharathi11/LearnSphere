import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import "./PaymentPage.scss";
import { getCourseById } from "../../../services/courseApi";
import { useCurrentUser } from "../../../hooks/useCurrentUser";
import {
  createEnrollmentOrder,
  getRazorpayPublicKey,
  verifyEnrollmentPayment,
} from "../../../services/enrollmentApi";

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

function PaymentPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: userLoading } = useCurrentUser();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPaying, setIsPaying] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("");
  const checkoutOpenedRef = useRef(false);

  useEffect(() => {
    if (userLoading) return;
    if (!currentUser?.id) {
      navigate("/login", {
        replace: true,
        state: { from: location.pathname },
      });
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    getCourseById(id)
      .then((data) => {
        if (!active) return;
        setCourse(data);
      })
      .catch(() => {
        if (!active) return;
        setError("Invalid course");
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, currentUser?.id, location.pathname, navigate, userLoading]);

  useEffect(() => {
    if (!currentUser?.id) return;

    let active = true;
    getRazorpayPublicKey()
      .then((key) => {
        if (!active) return;
        setRazorpayKey(key || import.meta.env.VITE_RAZORPAY_KEY || "");
      })
      .catch(() => {
        if (!active) return;
        setRazorpayKey(import.meta.env.VITE_RAZORPAY_KEY || "");
      });

    return () => {
      active = false;
    };
  }, [currentUser?.id]);

  const ensureRazorpayScript = () =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT;
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayNow = async () => {
    if (!course || !currentUser?.id) return;

    if (!razorpayKey) {
      setError("Unable to load Razorpay key. Please try again.");
      return;
    }

    setError("");
    setIsPaying(true);

    try {
      const loaded = await ensureRazorpayScript();
      if (!loaded) {
        throw new Error("Unable to load Razorpay checkout.");
      }

      const orderId = await createEnrollmentOrder(String(currentUser.id), String(id));

      const options = {
        key: razorpayKey,
        amount: Math.round(Number(course.price || 0) * 100),
        currency: "INR",
        name: "LearnSphere",
        description: course.courseName,
        order_id: orderId,
        prefill: {
          name: currentUser.name || currentUser.username || "",
          email: currentUser.email || "",
          contact: currentUser.phone || "",
        },
        notes: {
          courseId: String(id),
          userId: String(currentUser.id),
        },
        theme: {
          color: "#2563eb",
        },
        handler: async (response) => {
          try {
            await verifyEnrollmentPayment({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              userId: String(currentUser.id),
              courseId: String(id),
            });

            navigate("/payment-success", {
              replace: true,
              state: {
                courseId: String(id),
                paymentId: response.razorpay_payment_id,
              },
            });
          } catch {
            setError("Payment succeeded but enrollment verification failed. Please contact support.");
            setIsPaying(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsPaying(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (apiError) {
      const message =
        apiError?.response?.data?.message ||
        apiError?.response?.data?.error ||
        apiError?.message ||
        "Unable to start payment";
      setError(message);
      setIsPaying(false);
    }
  };

  useEffect(() => {
    if (loading || !course || !currentUser?.id || !razorpayKey) return;
    if (checkoutOpenedRef.current) return;
    checkoutOpenedRef.current = true;
    handlePayNow();
  }, [loading, course, currentUser?.id, razorpayKey]);

  if (loading || userLoading) return <p style={{ padding: 40 }}>Loading...</p>;
  if (error && !course) return <p style={{ padding: 40 }}>{error}</p>;
  if (!course) return <p style={{ padding: 40 }}>Invalid course</p>;

  return (
    <div className="payment-page">
      <h2>Redirecting To Razorpay</h2>

      <div className="payment-summary">
        <div className="card paycard">
          <h3>{course.courseName}</h3>
          <p>Total: Rs {course.price}</p>
          <p>Opening secure checkout...</p>

          {error && <p className="payment-error">{error}</p>}

          <button className="pay-btn" onClick={handlePayNow} disabled={isPaying}>
            {isPaying ? "Opening..." : "Retry Razorpay Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;

