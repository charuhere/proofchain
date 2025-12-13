import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { Upload, Search, LogOut, Plus } from "lucide-react";
import { UploadBillModal } from "../components/UploadBillModal";
import { BillCard } from "../components/BillCard";
import { ClaimModal } from "../components/ClaimModal";

export const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState("verified");
  const [foundEmails, setFoundEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null); // Preview panel
  const [previewLoading, setPreviewLoading] = useState(false);
  const [claimBill, setClaimBill] = useState(null); // Claim modal

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      setLoading(true);
      const response = await api.get("/bills");
      setBills(response.data);
    } catch (err) {
      setError("Failed to load bills");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchBills();
      return;
    }

    try {
      setLoading(true);
      const response = await api.get(`/bills/search?query=${searchQuery}`);
      setBills(response.data);
    } catch (err) {
      setError("Search failed");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const filteredBills = bills.filter((bill) => bill.status === filterStatus);

  const handleConnectGmail = async () => {
    try {
      // 1. Ask backend for the Google Login URL
      const response = await api.get("/auth/google/url");

      // 2. Redirect the browser to that URL
      window.location.href = response.url;
    } catch (error) {
      console.error("Failed to start Gmail auth:", error);
      alert("Could not connect to Gmail. Please try again.");
    }
  };

  const handleScan = async () => {
    try {
      setLoading(true);
      const response = await api.post("/bills/scan-gmail");

      if (response.count === 0) {
        alert("No new bills found in the last 30 days.");
      } else {
        setFoundEmails(response.data); // Store them to show in UI
        setFilterStatus("pending"); // Switch to pending filter to show detected emails
      }
    } catch (error) {
      console.error(error);
      alert("Scan failed. Make sure Gmail is connected.");
    } finally {
      setLoading(false);
    }
  };

  // Function to handle when user clicks "Import Bill" on a specific email
  const importEmailBill = async (emailId) => {
    try {
      setPreviewLoading(true);

      // Call backend to analyze with Groq and extract keywords
      const response = await api.post(`/bills/gmail-import/${emailId}`);
      const billData = response.data;

      // Save to Database without alerts
      await api.post("/bills", billData);

      // Remove from list and close preview
      setFoundEmails((prev) => prev.filter((e) => e.gmailId !== emailId));
      setSelectedEmail(null);
      setFilterStatus("verified"); // Switch to verified filter to show imported bill
      fetchBills(); // Refresh main list
    } catch (error) {
      console.error(error);
      alert("Failed to import bill. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
  };

  // Function to show email preview panel
  const showEmailPreview = (email) => {
    setSelectedEmail(email);
  };

  useEffect(() => {
    // Check if the URL has ?gmail=success
    const params = new URLSearchParams(window.location.search);
    const status = params.get("gmail");

    if (status === "success") {
      alert("✅ Gmail Connected Successfully! You can now scan for bills.");

      // Clean up the URL (remove ?gmail=success) so it doesn't pop up again on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === "failed") {
      alert("❌ Gmail Connection Failed. Please try again.");
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">ProofChain</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{user?.email}</span>
            <button
              onClick={handleLogout}
              className="btn btn-secondary flex items-center gap-2"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Top Actions */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={20} />
            Upload Bill
          </button>
        </div>

        {/* --- Gmail Actions Group --- */}
        <div className="flex gap-3 mb-6">
          {/* 1. Connect Button */}
          <button
            onClick={handleConnectGmail}
            className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
            </svg>
            Connect Gmail
          </button>

          {/* 2. NEW SCAN BUTTON (Paste this!) */}
          <button
            onClick={handleScan}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
          >
            <Search size={20} />
            Scan Inbox
          </button>
        </div>

        {/* Search Bar */}
        <div className="card mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search by product, store, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="input pl-10"
              />
            </div>
            <button onClick={handleSearch} className="btn btn-primary">
              Search
            </button>
          </div>
        </div>

        {/* Filter */}
        <div className="card mb-6">
          <div className="flex gap-2">
            {["verified", "pending", "expired"].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg capitalize ${
                  filterStatus === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Bills Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Loading bills...</p>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filterStatus === "pending" &&
          foundEmails.length > 0 &&
          filteredBills.length === 0 ? (
          // Show detected emails in pending section
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-bold text-blue-900 mb-4">
                📧 Detected Emails ({foundEmails.length})
              </h3>
              <div className="space-y-3">
                {foundEmails.map((email) => (
                  <div
                    key={email.gmailId}
                    className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-400 transition"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {email.subject}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {email.snippet}
                        </p>
                        <p className="text-xs text-gray-500 mt-2">
                          From: {email.from} •{" "}
                          {new Date(email.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => showEmailPreview(email)}
                        className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded text-sm font-medium transition"
                      >
                        Preview
                      </button>
                      <button
                        onClick={() => importEmailBill(email.gmailId)}
                        disabled={previewLoading}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 rounded text-sm font-medium transition"
                      >
                        {previewLoading ? "Importing..." : "Import"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Email Preview Panel */}
            {selectedEmail && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold text-blue-900">
                    📧 Email Preview
                  </h3>
                  <button
                    onClick={() => setSelectedEmail(null)}
                    className="text-gray-400 hover:text-gray-600 text-lg"
                  >
                    ✕
                  </button>
                </div>
                <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded">
                  <p>
                    <span className="font-semibold">From:</span>{" "}
                    {selectedEmail.from}
                  </p>
                  <p>
                    <span className="font-semibold">Subject:</span>{" "}
                    {selectedEmail.subject}
                  </p>
                  <p>
                    <span className="font-semibold">Date:</span>{" "}
                    {new Date(selectedEmail.date).toLocaleString()}
                  </p>
                  {selectedEmail.attachments.length > 0 && (
                    <div>
                      <span className="font-semibold">📎 Attachments:</span>
                      <ul className="ml-4 mt-1">
                        {selectedEmail.attachments.map((att, idx) => (
                          <li key={idx} className="text-xs text-gray-600">
                            {att.filename} ({att.sizeKB} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Content Preview:</span>
                    <p className="mt-1 text-xs bg-gray-50 p-2 rounded border border-gray-200">
                      "{selectedEmail.contentPreview.substring(0, 300)}..."
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => importEmailBill(selectedEmail.gmailId)}
                  disabled={previewLoading}
                  className="mt-3 w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium transition"
                >
                  {previewLoading
                    ? "⏳ Processing with AI..."
                    : "✅ Import Bill"}
                </button>
              </div>
            )}
          </div>
        ) : filteredBills.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-600">
              No bills found. Upload your first bill to get started!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBills.map((bill) => (
              <BillCard
                key={bill._id}
                bill={bill}
                onRefresh={fetchBills}
                onClaim={setClaimBill}
              />
            ))}
          </div>
        )}
      </main>

      {/* Claim Modal */}
      {claimBill && (
        <ClaimModal bill={claimBill} onClose={() => setClaimBill(null)} />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadBillModal
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            setShowUploadModal(false);
            fetchBills();
          }}
        />
      )}
    </div>
  );
};
