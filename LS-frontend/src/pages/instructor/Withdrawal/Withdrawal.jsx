import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowDownToLine,
  AtSign,
  BadgeIndianRupee,
  Building2,
  CheckCircle2,
  Clock3,
  CreditCard,
  Hash,
  Info,
  Landmark,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  User,
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
  return `₹${Number(value || 0).toLocaleString("en-IN", {
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
function getStatusClass(status) {
  const s = String(status || "PENDING").toLowerCase();
  if (s === "paid") return "paid";
  if (s === "rejected" || s === "cancelled") return "rejected";
  if (s === "processing" || s === "approved") return "processing";
  return "pending";
}
function maskAccountNumber(number) {
  if (!number) return "-";
  const numStr = String(number).trim();
  if (numStr.length <= 4) return numStr;
  return `•••• •••• ${numStr.slice(-4)}`;
}
function maskUpiId(upiId) {
  if (!upiId) return "-";
  const str = String(upiId).trim();
  const index = str.indexOf("@");
  if (index === -1) return str.slice(0, 3) + "***";
  const name = str.slice(0, index);
  const domain = str.slice(index);
  return `${name.slice(0, Math.min(name.length, 3))}***${domain}`;
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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [refreshing, setRefreshing] = useState(false);
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
  const handleManualRefresh = async () => {
    if (!instructorId) return;
    setRefreshing(true);
    setError("");
    try {
      const loadedCourses = await getInstructorCourses(String(instructorId), 0, 300);
      const parsedCourses = Array.isArray(loadedCourses) ? loadedCourses : [];
      setCourses(parsedCourses);
      const ids = parsedCourses.map((course) => String(course.id)).filter(Boolean);
      const [summaryResult, withdrawalResult] = await Promise.all([
        getInstructorWithdrawalSummary(String(instructorId), ids),
        getInstructorWithdrawals(String(instructorId), 20),
      ]);
      setSummary(summaryResult);
      setWithdrawals(withdrawalResult);
      setSuccess("Ledger details synchronized successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err) {
      setError(getFriendlyErrorMessage(err, "Unable to refresh details."));
    } finally {
      setRefreshing(false);
    }
  };
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
  const filteredWithdrawals = useMemo(() => {
    return (withdrawals || []).filter((item) => {
      const matchesSearch = item.id ? String(item.id).toLowerCase().includes(searchTerm.toLowerCase()) : true;
      const s = String(item.status || "").toUpperCase();
      let mappedStatus = "PENDING";
      if (s === "PAID") mappedStatus = "PAID";
      else if (s === "REJECTED" || s === "CANCELLED") mappedStatus = "REJECTED";
      else if (s === "PROCESSING" || s === "APPROVED") mappedStatus = "APPROVED";
      const matchesStatus = statusFilter === "ALL" ? true : mappedStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [withdrawals, searchTerm, statusFilter]);
  if (loading) {
    return (
      <div className="withdrawal-loading-container">
        <div className="payout-spinner-glow">
          <RefreshCw size={36} className="spinner-icon animate-spin" />
        </div>
        <h3>Loading Revenue Ledger...</h3>
        <p>Retrieving your payout history and earnings details.</p>
      </div>
    );
  }
  return (
    <div className="withdrawal-page">
      <header className="withdrawal-hero">
        <div className="hero-context">
          <span className="withdrawal-eyebrow">
            <Sparkles size={12} className="sparkle-icon" /> Instructor Earnings
          </span>
          <h1>Instructor Payouts</h1>
          <p>
            Submit payout requests and track your earnings from enrollment fees.
          </p>
        </div>
        <button 
          className={`refresh-button ${refreshing ? "refreshing" : ""}`} 
          type="button" 
          onClick={handleManualRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={15} className={refreshing ? "spin-animation" : ""} />
          <span>{refreshing ? "Syncing..." : "Refresh Details"}</span>
        </button>
      </header>
      {error ? (
        <div className="withdrawal-alert error">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      ) : null}
      {success ? (
        <div className="withdrawal-alert success">
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      ) : null}
      <div className="withdrawal-metrics">
        <div className="metric-card primary">
          <div className="card-ambient-glow"></div>
          <div className="card-top-row">
            <span className="card-title">Available Balance</span>
            <div className="card-icon"><WalletCards size={18} /></div>
          </div>
          <div className="card-amount">
            <span className="currency">₹</span>
            <strong>{Number(summary?.availableBalance || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="card-footer">
            <span className="footer-status">Ready to request</span>
          </div>
        </div>
        <div className="metric-card earnings">
          <div className="card-ambient-glow"></div>
          <div className="card-top-row">
            <span className="card-title">Net Earnings</span>
            <div className="card-icon"><BadgeIndianRupee size={18} /></div>
          </div>
          <div className="card-amount">
            <span className="currency">₹</span>
            <strong>{Number(summary?.netEarnings || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="card-footer">
            <span className="footer-status">All-time revenue</span>
          </div>
        </div>
        <div className="metric-card pending">
          <div className="card-ambient-glow"></div>
          <div className="card-top-row">
            <span className="card-title">Pending Review</span>
            <div className="card-icon"><Clock3 size={18} /></div>
          </div>
          <div className="card-amount">
            <span className="currency">₹</span>
            <strong>{Number(summary?.pendingWithdrawal || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="card-footer">
            <span className="footer-status">Under verification</span>
          </div>
        </div>
        <div className="metric-card paid">
          <div className="card-ambient-glow"></div>
          <div className="card-top-row">
            <span className="card-title">Paid Out</span>
            <div className="card-icon"><CheckCircle2 size={18} /></div>
          </div>
          <div className="card-amount">
            <span className="currency">₹</span>
            <strong>{Number(summary?.totalWithdrawn || 0).toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</strong>
          </div>
          <div className="card-footer">
            <span className="footer-status">Cleared to accounts</span>
          </div>
        </div>
      </div>
      <div className="withdrawal-grid">
        <form className="withdrawal-form-panel" onSubmit={handleSubmit}>
          <div className="panel-heading">
            <div>
              <h2>Request Payout</h2>
              <p>Minimum payout amount: <strong>{formatMoney(summary?.minimumWithdrawal)}</strong></p>
            </div>
          </div>
          <div className="form-content">
            <div className="field-block">
              <span className="field-label">Withdrawal Amount</span>
              <div className="amount-input-group">
                <span className="currency-symbol">₹</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
                <button type="button" className="max-button" onClick={handleMaxAmount}>Use Max</button>
              </div>
              {requestedAmount > 0 && (
                <div className="amount-gauge-indicator">
                  {requestedAmount < minimumWithdrawal && (
                    <span className="gauge-warning red">
                      <AlertCircle size={12} /> Minimum amount to withdraw is {formatMoney(minimumWithdrawal)}
                    </span>
                  )}
                  {requestedAmount > availableBalance && (
                    <span className="gauge-warning red">
                      <AlertCircle size={12} /> Requested amount exceeds your available balance
                    </span>
                  )}
                  {requestedAmount >= minimumWithdrawal && requestedAmount <= availableBalance && (
                    <span className="gauge-warning green">
                      <CheckCircle2 size={12} /> Amount is valid for withdrawal.
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="field-block">
              <span className="field-label">Choose Settlement Channel</span>
              <div className="method-slider-container">
                <button
                  type="button"
                  className={`method-slider-btn ${form.payoutMethod === "BANK" ? "active" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, payoutMethod: "BANK" }))}
                >
                  <Landmark size={15} />
                  <span>Bank Transfer</span>
                </button>
                <button
                  type="button"
                  className={`method-slider-btn ${form.payoutMethod === "UPI" ? "active" : ""}`}
                  onClick={() => setForm((prev) => ({ ...prev, payoutMethod: "UPI" }))}
                >
                  <CreditCard size={15} />
                  <span>UPI ID Payout</span>
                </button>
              </div>
            </div>
            {form.payoutMethod === "BANK" ? (
              <div className="form-fields-grid animate-fade-in">
                <div className="field-block">
                  <span className="field-label">Account Holder Name</span>
                  <div className="input-group-premium">
                    <User size={15} />
                    <input
                      name="accountHolderName"
                      value={form.accountHolderName}
                      onChange={handleChange}
                      placeholder="Name as in Bank Book"
                    />
                  </div>
                </div>
                <div className="field-block">
                  <span className="field-label">Bank Name</span>
                  <div className="input-group-premium">
                    <Building2 size={15} />
                    <input
                      name="bankName"
                      value={form.bankName}
                      onChange={handleChange}
                      placeholder="e.g. HDFC Bank"
                    />
                  </div>
                </div>
                <div className="field-block">
                  <span className="field-label">Account Number</span>
                  <div className="input-group-premium">
                    <Hash size={15} />
                    <input
                      name="accountNumber"
                      value={form.accountNumber}
                      onChange={handleChange}
                      placeholder="Savings or Current account no."
                    />
                  </div>
                </div>
                <div className="field-block">
                  <span className="field-label">IFSC Code</span>
                  <div className="input-group-premium">
                    <ShieldCheck size={15} />
                    <input
                      name="ifscCode"
                      value={form.ifscCode}
                      onChange={handleChange}
                      placeholder="11-character alphanumeric code"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="field-block animate-fade-in">
                <span className="field-label">UPI ID Target</span>
                <div className="input-group-premium">
                  <AtSign size={15} />
                  <input
                    name="upiId"
                    value={form.upiId}
                    onChange={handleChange}
                    placeholder="example@okaxis or name@upi"
                  />
                </div>
              </div>
            )}
            <div className="field-block">
              <span className="field-label">Reference Note (Optional)</span>
              <textarea
                name="note"
                rows="2"
                value={form.note}
                onChange={handleChange}
                placeholder="Message for audit or finance reference"
              />
            </div>
            <div className="settlement-receipt-card">
              <div className="receipt-title">Settlement Breakdown</div>
              <div className="receipt-rows">
                <div className="receipt-row">
                  <span>Gross Payout Requested</span>
                  <span>{formatMoney(requestedAmount)}</span>
                </div>
                <div className="receipt-row">
                  <span>Service Platform Fee</span>
                  <span className="free-tag">₹0 (FREE)</span>
                </div>
                <div className="receipt-row">
                  <span>Estimated Credit Delay</span>
                  <span>{form.payoutMethod === "UPI" ? "Within 24 Hours" : "2-3 Business Days"}</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-row total">
                  <span>Net Estimated Credit</span>
                  <strong className="glowing-value">{formatMoney(requestedAmount)}</strong>
                </div>
              </div>
              <div className="receipt-trust-seal">
                <Lock size={12} />
                <span>Transactions are processed securely.</span>
              </div>
            </div>
            <button className="submit-withdrawal" type="submit" disabled={!canSubmit}>
              {submitting ? "Processing Transaction..." : "Submit Withdrawal Request"}
            </button>
          </div>
        </form>
        <aside className="withdrawal-side-panel">
          <div className="side-card payout-rules-card">
            <div className="side-icon"><ShieldCheck size={20} /></div>
            <h3>Payout Guidelines</h3>
            <p>{summary?.instructorSharePercent || 80}% instructor share is calculated from successful paid enrollments.</p>
            <ul>
              <li>Pending payouts are deducted from your available balance.</li>
              <li>If a request is rejected, the funds are returned to your balance.</li>
              <li>Payouts are processed within 2-3 business days.</li>
            </ul>
          </div>
          <div className="side-card compact">
            <div className="card-detail">
              <span>Courses Linked</span>
              <strong>{courseIds.length}</strong>
            </div>
          </div>
          <div className="side-card compact">
            <div className="card-detail">
              <span>Platform Service Fee</span>
              <strong>{formatMoney(summary?.platformFee)}</strong>
            </div>
          </div>
        </aside>
      </div>
      <section className="withdrawal-history">
        <header className="history-header">
          <div>
            <h2>Withdrawal History</h2>
            <p>Latest payout requests and current review status.</p>
          </div>
          <div className="history-toolbar">
            <div className="search-box">
              <Search size={14} />
              <input
                type="text"
                placeholder="Search Request ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-chips">
              {[
                { value: "ALL", label: "All" },
                { value: "PENDING", label: "Pending" },
                { value: "APPROVED", label: "Processing" },
                { value: "PAID", label: "Paid" },
                { value: "REJECTED", label: "Rejected" }
              ].map((chip) => (
                <button
                  key={chip.value}
                  type="button"
                  className={`filter-chip ${statusFilter === chip.value ? "active" : ""}`}
                  onClick={() => setStatusFilter(chip.value)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </header>
        <div className="history-table-wrap">
          <table>
            <thead>
              <tr>
                <th>Request Details</th>
                <th>Method</th>
                <th>Destination</th>
                <th>Status</th>
                <th>Date Requested</th>
              </tr>
            </thead>
            <tbody>
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-history">
                    <div className="empty-state">
                      <Clock3 size={32} />
                      <p>No payout matching current filters found.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="request-id">
                        <strong>{formatMoney(item.amount)}</strong>
                        <span>ID: #{item.id}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`method-badge ${item.payoutMethod === "UPI" ? "upi" : "bank"}`}>
                        {item.payoutMethod === "UPI" ? "UPI" : "Bank Transfer"}
                      </span>
                    </td>
                    <td>
                      <div className="destination">
                        <Building2 size={13} />
                        <span>
                          {item.payoutMethod === "UPI" 
                            ? maskUpiId(item.upiId) 
                            : maskAccountNumber(item.accountNumber)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusClass(item.status)}`}>
                        <span className="pulse-dot"></span>
                        <span>{statusLabel(item.status)}</span>
                      </span>
                    </td>
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