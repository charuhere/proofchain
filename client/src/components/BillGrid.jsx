import React from "react";
import { BillCard } from "./BillCard";

export const BillGrid = ({ loading, error, bills, onRefresh, onClaim }) => {
    if (loading) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-600">Loading bills...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    if (bills.length === 0) {
        return (
            <div className="card text-center py-12">
                <p className="text-gray-600">
                    No bills found. Upload your first bill to get started!
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bills.map((bill) => (
                <BillCard
                    key={bill._id}
                    bill={bill}
                    onRefresh={onRefresh}
                    onClaim={onClaim}
                />
            ))}
        </div>
    );
};
