import React, { useState } from "react";
import { Trash2, Eye, X, ZoomIn, AlertCircle, Calendar, Tag } from "lucide-react"; // Added Tag icon
import api from "../utils/api";
import EditExpiryModal from "./EditExpiryModal";

export const BillCard = ({ bill, onRefresh, onClaim }) => {
  const [showModal, setShowModal] = useState(false);
  const [showEditExpiry, setShowEditExpiry] = useState(false);
  const [showKeywordsModal, setShowKeywordsModal] = useState(false); // ✅ New State
  const [deleting, setDeleting] = useState(false);
  const [billData, setBillData] = useState(bill);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      try {
        setDeleting(true);
        await api.delete(`/bills/${bill._id}`);
        onRefresh();
      } catch (err) {
        alert("Failed to delete bill");
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleUpdateBill = (updatedBill) => {
    setBillData(updatedBill);
    onRefresh();
  };

  const getDaysUntilExpiry = () => {
    const today = new Date();
    const expiry = new Date(billData.expiryDate);
    const diff = expiry - today;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiry();
  const statusColor = {
    pending: "bg-yellow-100 text-yellow-800",
    verified: "bg-blue-100 text-blue-800",
    claimed: "bg-green-100 text-green-800",
    expired: "bg-red-100 text-red-800",
    archived: "bg-gray-100 text-gray-800",
  };

  const warrantyColor =
    daysLeft <= 0
      ? "text-red-600"
      : daysLeft <= 30
      ? "text-yellow-600"
      : "text-green-600";

  return (
    <>
      <div className="card transition hover:shadow-lg flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3
              className="text-lg font-bold text-gray-800 line-clamp-1"
              title={billData.productName}
            >
              {billData.productName}
            </h3>
            <p className="text-sm text-gray-600">{billData.storeName}</p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${
              statusColor[billData.status]
            }`}
          >
            {billData.status}
          </span>
        </div>

        {/* Image Preview Area */}
        <div
          className="mb-4 relative group cursor-pointer"
          onClick={() => setShowModal(true)}
        >
          <div className="w-full h-32 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
            <img
              src={billData.billImageUrl}
              alt="Bill Preview"
              className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition"
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-20 transition">
              <ZoomIn
                className="text-white opacity-0 group-hover:opacity-100 drop-shadow-md"
                size={24}
              />
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Purchase Date:</span>
            <span className="font-medium">
              {new Date(billData.purchaseDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Warranty Expiry:</span>
            <span className={`font-medium ${warrantyColor}`}>
              {new Date(billData.expiryDate).toLocaleDateString()}
            </span>
          </div>
          {billData.purchasePrice > 0 && (
            <div className="flex justify-between">
              <span className="text-gray-600">Price:</span>
              <span className="font-medium">₹{billData.purchasePrice}</span>
            </div>
          )}
        </div>

        {/* Warranty Status Bar */}
        <div
          className={`p-3 rounded-lg mb-4 text-sm font-medium text-center ${
            daysLeft <= 0
              ? "bg-red-100 text-red-700"
              : daysLeft <= 30
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {daysLeft <= 0
            ? `Expired ${Math.abs(daysLeft)} days ago`
            : `${daysLeft} days remaining`}
        </div>

        {/* Keywords Section (Updated) */}
        {billData.keywords && billData.keywords.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {/* Show first 3 keywords */}
              {billData.keywords.slice(0, 3).map((keyword, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded border border-gray-200"
                >
                  {keyword}
                </span>
              ))}
              
              {/* ✅ Clickable "+X" Button */}
              {billData.keywords.length > 3 && (
                <button 
                  onClick={() => setShowKeywordsModal(true)}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded border border-blue-200 transition font-medium"
                >
                  +{billData.keywords.length - 3} more
                </button>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 mt-auto">
          <button
            onClick={() => setShowModal(true)}
            className="p-2.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition"
            title="View bill"
          >
            <Eye size={18} />
          </button>

          <button
            onClick={() => setShowEditExpiry(true)}
            className="p-2.5 bg-purple-50 text-purple-600 hover:bg-purple-100 rounded-lg transition"
            title="Edit expiry date"
          >
            <Calendar size={18} />
          </button>

          <button
            onClick={() => onClaim(billData)}
            className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white hover:shadow-md py-2 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition"
          >
            <AlertCircle size={16} /> Claim
          </button>

          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
            title="Delete bill"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* --- IMAGE PREVIEW MODAL --- */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full flex flex-col items-center">
            <button
              onClick={() => setShowModal(false)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition"
            >
              <X size={32} />
            </button>

            <img
              src={billData.billImageUrl}
              alt="Full Bill"
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl bg-white object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            <div className="mt-4 text-white text-center">
              <p className="font-bold text-lg">{billData.productName}</p>
              <p className="text-sm opacity-80">
                Uploaded on{" "}
                {new Date(
                  billData.createdAt || Date.now()
                ).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- ✅ NEW KEYWORDS MODAL --- */}
      {showKeywordsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={() => setShowKeywordsModal(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4 pb-4 border-b">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Tag size={20} className="text-blue-600" />
                All Keywords
              </h3>
              <button 
                onClick={() => setShowKeywordsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto p-1">
              {billData.keywords.map((keyword, idx) => (
                <span
                  key={idx}
                  className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded-md border border-gray-200"
                >
                  {keyword}
                </span>
              ))}
            </div>

            <div className="mt-6 text-center">
              <button 
                onClick={() => setShowKeywordsModal(false)}
                className="w-full py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT EXPIRY MODAL --- */}
      <EditExpiryModal
        bill={billData}
        isOpen={showEditExpiry}
        onClose={() => setShowEditExpiry(false)}
        onUpdate={handleUpdateBill}
      />
    </>
  );
};