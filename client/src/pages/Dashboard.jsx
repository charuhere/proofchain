import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { UploadBillModal } from "../components/UploadBillModal";
import { ClaimModal } from "../components/ClaimModal";
import { DashboardHeader } from "../components/DashboardHeader";
import { DashboardActions } from "../components/DashboardActions";
import { DashboardFilters } from "../components/DashboardFilters";
import { GmailDetectedList } from "../components/GmailDetectedList";
import { BillGrid } from "../components/BillGrid";

import Fuse from "fuse.js";

export const Dashboard = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]); // Store filtered results separately
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

  // Update filtered bills when search query, filter status, or bills change
  useEffect(() => {
    let result = bills;

    // 0. Mark expired bills automatically (check expiry date)
    const today = new Date();
    result = result.map((bill) => {
      const expiryDate = new Date(bill.expiryDate);
      // If expired and not already marked as expired, mark it
      if (expiryDate < today && bill.status !== "expired") {
        return { ...bill, status: "expired" };
      }
      return bill;
    });

    // 1. Filter by Status
    result = result.filter((bill) => bill.status === filterStatus);

    // 2. Fuzzy Search if query exists
    if (searchQuery.trim()) {
      const fuse = new Fuse(result, {
        keys: ["productName", "storeName", "keywords", "brand"],
        threshold: 0.4, // 0.0 = exact match, 1.0 = match anything. 0.4 is good for typos.
        distance: 100,
        includeScore: true,
      });

      const searchResults = fuse.search(searchQuery);
      result = searchResults.map((r) => r.item);
    }

    setFilteredBills(result);
  }, [bills, searchQuery, filterStatus]);

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
      setFilterStatus("verified");
      fetchBills();
    } catch (error) {
      console.error(error);
      alert("Failed to import bill. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
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
      <DashboardHeader />

      <main className="container py-8">
        <DashboardActions
          onUpload={() => setShowUploadModal(true)}
          onConnectGmail={handleConnectGmail}
          onScanInbox={handleScan}
        />

        <DashboardFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}

          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />

        {filterStatus === "pending" && foundEmails.length > 0 && filteredBills.length === 0 ? (
          <GmailDetectedList
            foundEmails={foundEmails}
            onPreview={setSelectedEmail}
            importEmailBill={importEmailBill}
            previewLoading={previewLoading}
            selectedEmail={selectedEmail}
            onClosePreview={() => setSelectedEmail(null)}
          />
        ) : (
          <BillGrid
            loading={loading}
            error={error}
            bills={filteredBills}
            onRefresh={fetchBills}
            onClaim={setClaimBill}
          />
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

