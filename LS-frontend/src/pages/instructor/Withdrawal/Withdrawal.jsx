import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Landmark,
  RefreshCw,
  ShieldCheck,
  WalletCards,
} from "lucide-react";
import { getInstructorCourses } from "../../../services/courseApi";
import {
  getInstructorWithdrawals,
  getInstructorWithdrawalSummary,
  requestInstructorWithdrawal,
} from "../../../services/enrollmentApi";
import { getFriendlyErrorMessage } from "../../../services/apiError";
import { getCurrentUser } from "../../../services/userProfileStore";
import "./Withdrawal.scss";

const initialForm = {
  amount: "",
  payoutMethod: "BANK",
  accountHolderName: "",
  bankName: "",
  accountNumber: "",
  ifscCode: "",
  upiId: "",
  note: "",
};

function formatMoney(value) {
  return `INR ${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status) {
  return String(status || "PENDING").toLowerCase().replace(/^\w/, (char) => char.toUpperCase());
}

function Withdrawal() {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const currentUser = useMemo(() => {
    try {
      return getCurrentUser();
    } catch {
      return null;
    }
  }, []);
  const instructorId = currentUser?.id || currentUser?.userId || "";
  const courseIds = useMemo(() => courses.map((course) => String(course.id)).filter(Boolean), [courses]);

  const loadWithdrawalData = useCallback(async () => {
    if (!instructorId) return;
    setError("");
    try {
      let loadedCourses = courses;
      if (loadedCourses.length === 0) {
        loadedCourses = await getInstructorCourses(String(instructorId), 0, 300);
        loadedCourses = Array.isArray(loadedCourses) ? loadedCourses : [];
        setCourses(loadedCourses);
      }
      const ids = loadedCourses.map((course) => String(course.id)).filter(Boolean);
      const [summaryResult, withdrawalResult] = await Promise.all([
        getInstructorWithdrawalSummary(String(instructorId), ids),
        getInstructorWithdrawals(String(instructorId), 20),
      ]);
      setSummary(summaryResult);
      setWithdrawals(withdrawalResult);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Unable to load withdrawal details."));
    } finally {
      setLoading(false);
    }
  }, [courses, instructorId]);

  useEffect(() => {
    loadWithdrawalData();
    const timer = setInterval(loadWithdrawalData, 15000);
    return () => clearInterval(timer);
  }, [loadWithdrawalData]);

  const minimumWithdrawal = Number(summary?.minimumWithdrawal || 500);
  const availableBalance = Number(summary?.availableBalance || 0);
  const requestedAmount = Number(form.amount || 0);
  const canSubmit =
    requestedAmount >= minimumWithdrawal &&
    requestedAmount <= availableBalance &&
    !submitting &&
    courseIds.length > 0;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleMaxAmount = () => {
    setForm((prev) => ({ ...prev, amount: String(Math.floor(availableBalance)) }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await requestInstructorWithdrawal(String(instructorId), {
        ...form,
        amount: Number(form.amount),
        courseIds,
      });
      setForm(initialForm);
      setSuccess("Withdrawal request submitted for finance review.");
      await loadWithdrawalData();
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Unable to submit withdrawal request."));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return null;

  return (
    <div className="withdrawal-page">
      <section className="withdrawal-hero">
        <div>
          <span className="withdrawal-eyebrow">Instructor Earnings</span>
          <h1>Withdraw course revenue with a clear payout trail</h1>
          <p>
            Review available earnings, reserve a payout, and track each request from submission
            through finance processing.
          </p>
        </div>
        <button className="refresh-button" type="button" onClick={loadWithdrawalData}>
          <RefreshCw size={17} />
          Refresh
        </button>
      </section>

      {error ? <div className="withdrawal-alert error">{error}</div> : null}
      {success ? <div className="withdrawal-alert success">{success}</div> : null}

      <section className="withdrawal-metrics">
        <div className="metric-card primary">
          <div className="metric-icon"><WalletCards size={22} /></div>
          <span>Available Balance</span>
          <strong>{formatMoney(summary?.availableBalance)}</strong>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><BadgeIndianRupee size={22} /></div>
          <span>Net Earnings</span>
          <strong>{formatMoney(summary?.netEarnings)}</strong>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><Clock3 size={22} /></div>
          <span>Pending Review</span>
          <strong>{formatMoney(summary?.pendingWithdrawal)}</strong>
        </div>
        <div className="metric-card">
          <div className="metric-icon"><CheckCircle2 size={22} /></div>
          <span>Paid Out</span>
          <strong>{formatMoney(summary?.totalWithdrawn)}</strong>
        </div>
      </section>

      <div className="withdrawal-grid">
        <form className="withdrawal-form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <h2>Request Withdrawal</h2>
              <p>Minimum payout is {formatMoney(summary?.minimumWithdrawal)}.</p>
            </div>
            <ArrowDownToLine size={22} />
          </div>

          <label className="field-block">
            <span>Amount</span>
            <div className="amount-row">
              <input
                type="number"
                min="0"
                step="1"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Enter amount"
              />
              <button type="button" onClick={handleMaxAmount}>Max</button>
            </div>
          </label>

          <div className="method-toggle" role="group" aria-label="Payout method">
            <button
              type="button"
              className={form.payoutMethod === "BANK" ? "active" : ""}
              onClick={() => setForm((prev) => ({ ...prev, payoutMethod: "BANK" }))}
            >
              <Landmark size={17} />
              Bank
            </button>
            <button
              type="button"
              className={form.payoutMethod === "UPI" ? "active" : ""}
              onClick={() => setForm((prev) => ({ ...prev, payoutMethod: "UPI" }))}
            >
              <CreditCard size={17} />
              UPI
            </button>
          </div>

          {form.payoutMethod === "BANK" ? (
            <div className="form-grid">
              <label className="field-block">
                <span>Account holder</span>
                <input name="accountHolderName" value={form.accountHolderName} onChange={handleChange} />
              </label>
              <label className="field-block">
                <span>Bank name</span>
                <input name="bankName" value={form.bankName} onChange={handleChange} />
              </label>
              <label className="field-block">
                <span>Account number</span>
                <input name="accountNumber" value={form.accountNumber} onChange={handleChange} />
              </label>
              <label className="field-block">
                <span>IFSC code</span>
                <input name="ifscCode" value={form.ifscCode} onChange={handleChange} />
              </label>
            </div>
          ) : (
            <label className="field-block">
              <span>UPI ID</span>
              <input name="upiId" value={form.upiId} onChange={handleChange} placeholder="name@bank" />
            </label>
          )}

          <label className="field-block">
            <span>Note</span>
            <textarea
              name="note"
              rows="3"
              value={form.note}
              onChange={handleChange}
              placeholder="Optional payout reference"
            />
          </label>

          <button className="submit-withdrawal" type="submit" disabled={!canSubmit}>
            {submitting ? "Submitting..." : "Submit withdrawal request"}
          </button>
        </form>

        <aside className="withdrawal-side-panel">
          <div className="side-card">
            <div className="side-icon"><ShieldCheck size={21} /></div>
            <h3>Payout Rules</h3>
            <p>{summary?.instructorSharePercent || 80}% instructor share is calculated from successful paid enrollments.</p>
            <ul>
              <li>Pending payouts are reserved from available balance.</li>
              <li>Rejected requests release the balance automatically.</li>
              <li>Finance can process approved payouts offline.</li>
            </ul>
          </div>
          <div className="side-card compact">
            <span>Courses linked</span>
            <strong>{courseIds.length}</strong>
          </div>
          <div className="side-card compact">
            <span>Platform fee</span>
            <strong>{formatMoney(summary?.platformFee)}</strong>
          </div>
        </aside>
      </div>

      <section className="withdrawal-history">
        <div className="history-heading">
          <h2>Withdrawal History</h2>
          <p>Latest payout requests and current review status.</p>
        </div>
        <div className="history-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request</th>
                <th>Method</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-history">No withdrawal requests yet.</td>
                </tr>
              ) : (
                withdrawals.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{formatMoney(item.amount)}</strong>
                      <span>#{item.id}</span>
                    </td>
                    <td>{item.payoutMethod === "UPI" ? "UPI" : "Bank transfer"}</td>
                    <td>
                      <div className="destination">
                        <Building2 size={15} />
                        {item.payoutMethod === "UPI" ? item.upiId : item.accountNumber || item.bankName || "-"}
                      </div>
                    </td>
                    <td><span className={`status-pill ${String(item.status || "").toLowerCase()}`}>{statusLabel(item.status)}</span></td>
                    <td>{formatDate(item.requestedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default Withdrawal;
