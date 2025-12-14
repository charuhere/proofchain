import React from "react";
import { Search } from "lucide-react";

export const DashboardFilters = ({
    searchQuery,
    setSearchQuery,
    filterStatus,
    setFilterStatus,
}) => {
    return (
        <>
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
                            className="input pl-10"
                        />
                    </div>
                </div>
            </div>

            {/* Filter */}
            <div className="card mb-6">
                <div className="flex gap-2">
                    {["verified", "pending", "expired"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilterStatus(status)}
                            className={`px-4 py-2 rounded-lg capitalize ${filterStatus === status
                                ? "bg-blue-600 text-white"
                                : "bg-gray-200 text-gray-800"
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>
        </>
    );
};
