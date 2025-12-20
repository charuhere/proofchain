import { Plus, Search } from "lucide-react";

export const DashboardActions = ({ onUpload, onConnectGmail, onScanInbox }) => {
    return (
        <>
            {/* Top Actions */}
            <div className="flex gap-4 mb-8">
                <button
                    onClick={onUpload}
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
                    onClick={onConnectGmail}
                    className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 5.457v13.909c0 .904-.732 1.636-1.636 1.636h-3.819V11.73L12 16.64l-6.545-4.91v9.273H1.636A1.636 1.636 0 0 1 0 19.366V5.457c0-2.023 2.309-3.178 3.927-1.964L5.455 4.64 12 9.548l6.545-4.91 1.528-1.145C21.69 2.28 24 3.434 24 5.457z" />
                    </svg>
                    Connect Gmail
                </button>

                {/* 2. Scan Button */}
                <button
                    onClick={onScanInbox}
                    className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition shadow-sm"
                >
                    <Search size={20} />
                    Scan Inbox
                </button>
            </div>
        </>
    );
};
