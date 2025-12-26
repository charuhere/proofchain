import { useState } from "react";
import { Calendar, Clock, X, CheckCircle } from "lucide-react";
import api from "../utils/api";

const EditExpiryModal = ({ bill, isOpen, onClose, onUpdate }) => {
  const [expiryDate, setExpiryDate] = useState(
    bill?.expiryDate
      ? new Date(bill.expiryDate).toISOString().split("T")[0]
      : ""
  );
  const [reminderDaysBefore, setReminderDaysBefore] = useState(
    bill?.reminderDaysBefore || 30
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [savedData, setSavedData] = useState(null);

  // Sync state when modal opens or bill changes
  React.useEffect(() => {
    if (isOpen && bill) {
      setExpiryDate(
        bill.expiryDate
          ? new Date(bill.expiryDate).toISOString().split("T")[0]
          : ""
      );
      setReminderDaysBefore(bill.reminderDaysBefore || 30);
      setSuccessMessage("");
      setError("");
      setSavedData(null);
    }
  }, [isOpen, bill]);

  // ✅ Helper to reset success state when user edits inputs
  const handleInputChange = (setter, value) => {
    setSuccessMessage(""); // Hide "Saved" message immediately
    setter(value);
  };

  const handleSave = async () => {
    if (!expiryDate) {
      setError("Please select an expiry date");
      return;
    }

    const reminderDaysNum = Math.max(
      1,
      Math.min(365, parseInt(reminderDaysBefore) || 30)
    );

    setLoading(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await api.patch(`/bills/${bill._id}`, {
        expiryDate: new Date(expiryDate).toISOString(),
        reminderDaysBefore: reminderDaysNum,
      });

      const isSuccess = response.data?.success || response.success;
      const updatedBillData = response.data?.data || response.data || response;

      if (isSuccess) {
        setSuccessMessage("Saved successfully!");
        setSavedData(updatedBillData);
        // We stay open and keep button enabled
      } else {
        const errorMsg = response.data?.message || response.message || "Failed to update bill";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Full error object:", err);
      const message = err.response?.data?.message || err.message || "Error updating bill";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (savedData) {
      onUpdate(savedData); // Refresh dashboard only on close
    }
    onClose();
  };

  const handleCancel = () => {
    setExpiryDate(
      bill?.expiryDate
        ? new Date(bill.expiryDate).toISOString().split("T")[0]
        : ""
    );
    setReminderDaysBefore(bill?.reminderDaysBefore || 30);
    setError("");
    setSuccessMessage("");
    onClose();
  };

  const calculateDaysLeft = () => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysLeft = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  const daysLeft = calculateDaysLeft();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            Edit Warranty Expiry
          </h2>
          <button
            onClick={savedData ? handleClose : handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Product
            </label>
            <p className="text-gray-600">
              {bill?.productName || "Unknown Product"}
            </p>
          </div>

          {/* Expiry Date */}
          <div>
            <label
              htmlFor="expiry-date"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <Calendar className="inline mr-2" size={16} />
              Expiry Date
            </label>
            <input
              type="date"
              id="expiry-date"
              value={expiryDate}
              // ✅ Reset success message when user changes date
              onChange={(e) => handleInputChange(setExpiryDate, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            {daysLeft !== null && (
              <p
                className={`text-sm mt-2 font-medium ${daysLeft > 0
                    ? daysLeft > 90
                      ? "text-green-600"
                      : daysLeft > 30
                        ? "text-yellow-600"
                        : "text-red-600"
                    : "text-red-600"
                  }`}
              >
                {daysLeft > 0 ? `${daysLeft} days left` : "Already expired"}
              </p>
            )}
          </div>

          {/* Reminder Days */}
          <div>
            <label
              htmlFor="reminder-days"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              <Clock className="inline mr-2" size={16} />
              Remind me (days before expiry)
            </label>
            <input
              type="number"
              id="reminder-days"
              min="1"
              max="365"
              value={reminderDaysBefore}
              // ✅ Reset success message when user changes days
              onChange={(e) => handleInputChange(setReminderDaysBefore, e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-2">
              You'll receive an email {reminderDaysBefore} days before expiry
            </p>
          </div>

          {/* SUCCESS MESSAGE */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle size={16} />
              {successMessage}
            </div>
          )}

          {/* ERROR MESSAGE */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={savedData ? handleClose : handleCancel}
            className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 font-medium transition-colors"
          >
            {savedData ? "Close" : "Cancel"}
          </button>

          <button
            onClick={handleSave}
            // ✅ FIX: Only disable when loading. Never disabled by success.
            disabled={loading}
            className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${successMessage
                ? "bg-green-600 hover:bg-green-700" // Green if saved (but still clickable)
                : "bg-blue-600 hover:bg-blue-700"   // Blue otherwise
              }`}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Saving...
              </>
            ) : successMessage ? (
              <>
                <CheckCircle size={18} />
                Saved
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditExpiryModal;