import React from "react";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <header className="bg-white shadow-sm">
            <div className="container py-4 flex justify-between items-center">
                <h1 className="text-2xl font-bold text-blue-600">ProofChain</h1>
                <div className="flex items-center gap-4">
                    <span className="text-gray-600">{user?.email}</span>
                    <button
                        onClick={handleLogout}
                        className="btn btn-secondary flex items-center gap-2"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>
                </div>
            </div>
        </header>
    );
};
