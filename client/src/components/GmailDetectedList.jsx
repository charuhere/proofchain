import React from "react";

export const GmailDetectedList = ({
    foundEmails,
    onPreview,
    importEmailBill,
    previewLoading,
    selectedEmail,
    onClosePreview,
}) => {
    return (
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
                                    <h4 className="font-medium text-gray-900">{email.subject}</h4>
                                    <p className="text-sm text-gray-600 mt-1">{email.snippet}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        From: {email.from} •{" "}
                                        {new Date(email.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => onPreview(email)}
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
                        <h3 className="font-semibold text-blue-900">📧 Email Preview</h3>
                        <button
                            onClick={onClosePreview}
                            className="text-gray-400 hover:text-gray-600 text-lg"
                        >
                            ✕
                        </button>
                    </div>
                    <div className="space-y-2 text-sm text-gray-700 bg-white p-3 rounded">
                        <p>
                            <span className="font-semibold">From:</span> {selectedEmail.from}
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
                        {previewLoading ? "⏳ Processing with AI..." : "✅ Import Bill"}
                    </button>
                </div>
            )}
        </div>
    );
};
