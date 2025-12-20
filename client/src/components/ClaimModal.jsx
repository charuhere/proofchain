import React, { useState } from "react";
import { Copy, Mail, Phone, AlertCircle, ExternalLink, Search, Loader2 } from "lucide-react";
import api from "../utils/api";

export const ClaimModal = ({ bill, onClose }) => {
  const [copied, setCopied] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [claimLinks, setClaimLinks] = useState(null);
  const [searchError, setSearchError] = useState("");

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(""), 2000);
  };

  const findClaimLinks = async () => {
    setSearchLoading(true);
    setSearchError("");

    try {
      const response = await api.post(`/bills/${bill._id}/find-claim-links`);

      if (response.success) {
        setClaimLinks(response.data);
      } else {
        setSearchError("Failed to find warranty claim links");
      }
    } catch (error) {
      console.error("Error finding claim links:", error);
      setSearchError(error.message || "Failed to search for claim links");
    } finally {
      setSearchLoading(false);
    }
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

        {/* Content - Scrollable */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Warranty Claim Links Search */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-1">
                Find Warranty Claim Resources
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Search for official warranty pages, service centers, and claim guides for <span className="font-semibold">{bill.productName}</span>
              </p>

              <button
                onClick={findClaimLinks}
                disabled={searchLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-3 rounded-lg hover:shadow-lg transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {searchLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search size={20} />
                    Find Warranty Links
                  </>
                )}
              </button>
            </div>

            {/* Search Error */}
            {searchError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {searchError}
              </div>
            )}

            {/* Search Results */}
            {claimLinks && (
              <div className="space-y-4 mt-4">
                {/* Official Support */}
                {claimLinks.officialSupport && claimLinks.officialSupport.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-purple-700 uppercase mb-2 flex items-center gap-2">
                      🏢 Official Support
                    </h4>
                    <div className="space-y-2">
                      {claimLinks.officialSupport.map((link, idx) => (
                        <LinkCard key={idx} link={link} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Service Centers */}
                {claimLinks.serviceCenters && claimLinks.serviceCenters.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-blue-700 uppercase mb-2 flex items-center gap-2">
                      🔧 Service Centers
                    </h4>
                    <div className="space-y-2">
                      {claimLinks.serviceCenters.map((link, idx) => (
                        <LinkCard key={idx} link={link} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Registration */}
                {claimLinks.registration && claimLinks.registration.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-green-700 uppercase mb-2 flex items-center gap-2">
                      📝 Product Registration
                    </h4>
                    <div className="space-y-2">
                      {claimLinks.registration.map((link, idx) => (
                        <LinkCard key={idx} link={link} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Guides */}
                {claimLinks.guides && claimLinks.guides.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-orange-700 uppercase mb-2 flex items-center gap-2">
                      📘 Guides & How-To
                    </h4>
                    <div className="space-y-2">
                      {claimLinks.guides.map((link, idx) => (
                        <LinkCard key={idx} link={link} />
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {Object.values(claimLinks).every(arr => !arr || arr.length === 0) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                    <p className="text-sm text-gray-600">
                      No warranty claim links found. Try searching manually for "{bill.brand || bill.productName} warranty claim"
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Store Contact Info - Only if available */}
            {(bill.storeEmail || bill.storePhone) && (
              <div className="mt-6 pt-6 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Store Contact</h4>

                {bill.storeEmail && (
                  <div className="mb-2 flex items-center gap-3 bg-gray-50 p-3 rounded">
                    <Mail size={16} className="text-blue-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Email</p>
                      <p className="text-sm font-mono text-gray-900">{bill.storeEmail}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bill.storeEmail, "email")}
                      className={`p-2 rounded transition text-sm ${copied === "email"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}

                {bill.storePhone && (
                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                    <Phone size={16} className="text-green-600" />
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Phone</p>
                      <p className="text-sm font-mono text-gray-900">{bill.storePhone}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(bill.storePhone, "phone")}
                      className={`p-2 rounded transition text-sm ${copied === "phone"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                )}
              </div>
            )}
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

// Link Card Component
const LinkCard = ({ link }) => {
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(link.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getDomain = (url) => {
    try {
      const domain = new URL(url).hostname.replace('www.', '');
      return domain;
    } catch {
      return url;
    }
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 hover:bg-gray-100 transition">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-semibold text-gray-800 line-clamp-1">
            {link.title}
          </h5>
          <p className="text-xs text-gray-600 mt-1 line-clamp-2">
            {link.description}
          </p>
          <p className="text-xs text-blue-600 mt-1 font-mono">
            {getDomain(link.url)}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            onClick={copyLink}
            className={`p-2 rounded transition ${copied
              ? "bg-green-100 text-green-700"
              : "bg-white text-gray-600 hover:bg-gray-200"
              }`}
            title="Copy link"
          >
            <Copy size={14} />
          </button>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded transition"
            title="Open link"
          >
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};

