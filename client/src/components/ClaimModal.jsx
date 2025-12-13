import React, { useState } from "react";
import { Copy, Mail, Phone, AlertCircle } from "lucide-react";

export const ClaimModal = ({ bill, onClose }) => {
  const [copied, setCopied] = useState("");

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <AlertCircle size={28} />
              Warranty Claim Information
            </h2>
            <p className="text-blue-100 mt-1">
              Use this information to contact the store for warranty claims
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-2xl hover:text-blue-100 transition"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product & Brand */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Product Details
            </h3>
            <p className="text-lg font-bold text-gray-900 mt-1">
              {bill.productName}
            </p>
            {bill.brand && bill.brand !== "Unknown Brand" && (
              <p className="text-sm text-gray-600 mt-1">
                <span className="font-semibold">Brand:</span> {bill.brand}
              </p>
            )}
          </div>

          {/* Store Contact Info */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Store Contact
            </h3>
            <p className="text-gray-900 font-semibold mt-2">{bill.storeName}</p>

            {/* Email */}
            {bill.storeEmail && (
              <div className="mt-3 flex items-center gap-3 bg-gray-50 p-3 rounded">
                <Mail size={18} className="text-blue-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-mono text-gray-900">
                    {bill.storeEmail}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(bill.storeEmail, "email")}
                  className={`p-2 rounded transition ${
                    copied === "email"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Copy email"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}

            {/* Phone */}
            {bill.storePhone && (
              <div className="mt-3 flex items-center gap-3 bg-gray-50 p-3 rounded">
                <Phone size={18} className="text-green-600" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Phone</p>
                  <p className="text-sm font-mono text-gray-900">
                    {bill.storePhone}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(bill.storePhone, "phone")}
                  className={`p-2 rounded transition ${
                    copied === "phone"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                  title="Copy phone"
                >
                  <Copy size={16} />
                </button>
              </div>
            )}

            {!bill.storeEmail && !bill.storePhone && (
              <p className="text-sm text-gray-500 mt-2 italic">
                No contact information found. Try searching for "
                {bill.storeName}" customer support online.
              </p>
            )}
          </div>

          {/* Warranty Details */}
          <div className="border-l-4 border-orange-500 pl-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Warranty Details
            </h3>
            <div className="mt-3 space-y-2 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Purchase Date:</span>{" "}
                {new Date(bill.purchaseDate).toLocaleDateString()}
              </p>
              <p>
                <span className="font-semibold">Warranty Period:</span>{" "}
                {bill.warrantyYears} year(s)
              </p>
              <p>
                <span className="font-semibold">Expires:</span>{" "}
                {new Date(bill.expiryDate).toLocaleDateString()}
              </p>
              {bill.purchasePrice > 0 && (
                <p>
                  <span className="font-semibold">Purchase Price:</span> $
                  {bill.purchasePrice.toFixed(2)}
                </p>
              )}
            </div>

            {bill.warrantyDetailsText && (
              <div className="mt-3 bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-xs text-amber-700 font-semibold mb-1">
                  Warranty Terms Found:
                </p>
                <p className="text-xs text-amber-900">
                  {bill.warrantyDetailsText}
                </p>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">💡 How to claim:</span>
            </p>
            <ol className="list-decimal list-inside text-sm text-blue-800 mt-2 space-y-1">
              <li>Contact the store using the email or phone above</li>
              <li>Mention your purchase date and warranty period</li>
              <li>
                Provide proof of purchase (you have the bill image in
                ProofChain)
              </li>
              <li>Follow the store's warranty claim process</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t bg-gray-50 p-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 font-medium transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
