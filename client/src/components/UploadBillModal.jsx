import { useState } from "react";
import { X, Upload } from "lucide-react";
import api from "../utils/api";

export const UploadBillModal = ({ onClose, onSuccess }) => {
  const [productName, setProductName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [warrantyYears, setWarrantyYears] = useState("1");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!productName || !purchaseDate || !file) {
      setError("Please fill all fields and select a file");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("productName", productName);
      formData.append("purchaseDate", purchaseDate);
      formData.append("warrantyYears", warrantyYears);
      formData.append("billImage", file);

      const response = await api.post("/bills/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.success) {
        onSuccess();
      }
    } catch (err) {
      setError(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold">Upload Bill</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Product Name *
            </label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="e.g., Sony WF-1000XM5 Headphones"
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Purchase Date *
            </label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Warranty Years *
            </label>
            <select
              value={warrantyYears}
              onChange={(e) => setWarrantyYears(e.target.value)}
              className="input"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((year) => (
                <option key={year} value={year}>
                  {year} Year{year > 1 ? "s" : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Bill Image/PDF *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:bg-gray-50">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="file-input"
                required
              />
              <label htmlFor="file-input" className="cursor-pointer">
                {preview ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded mb-2"
                  />
                ) : (
                  <>
                    <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                    <p className="text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-gray-400 text-sm">
                      JPG, PNG, or PDF (max 10MB)
                    </p>
                  </>
                )}
              </label>
            </div>
            {file && <p className="text-sm text-gray-600 mt-2">{file.name}</p>}
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary flex-1"
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
