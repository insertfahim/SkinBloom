import React, { useEffect, useState } from "react";
import {
    Link,
    NavLink,
    Outlet,
    useNavigate,
    useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function App() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Check if we're on the home page
    const isHomePage = location.pathname === "/";

    useEffect(() => {
        // Remove cart tracking as products are removed
    }, []);

    function getNavItems() {
        if (!user) {
            return [];
        }

        const commonItems = [{ to: "/profile", label: "Profile" }];

        switch (user.role) {
            case "admin":
                return [
                    { to: "/admin/dashboard", label: "Admin Dashboard" },
                    ...commonItems,
                ];
            case "dermatologist":
                return [
                    { to: "/dermatologist/dashboard", label: "Dashboard" },
                    { to: "/products", label: "Products" },
                    { to: "/tickets", label: "Consultations" },
                    ...commonItems,
                ];
            case "user":
            default:
                return [
                    { to: "/dashboard", label: "Dashboard" },
                    { to: "/products", label: "Shop" },
                    { to: "/consultation-request", label: "Book Consultation" },
                    { to: "/wishlist", label: "Wishlist" },
                    { to: "/cart", label: "Cart" },
                    { to: "/routine", label: "Routine" },
                    { to: "/timeline", label: "Progress" },
                    { to: "/tickets", label: "Help" },
                    ...commonItems,
                ];
        }
    }

    const navItems = getNavItems();

    return (
        <>
            {/* Header */}
            <div className="header">
                <div className="container navbar">
                    <Link to="/" className="logo">
                        SkinBloom
                    </Link>

                    <div className="nav-link-group">
                        {user ? (
                            <>
                                <NavLink to="/profile" className="nav-link">
                                    Hi {user?.name || "User"}
                                    <span
                                        style={{
                                            fontSize: "11px",
                                            background:
                                                user.role === "admin"
                                                    ? "#dc2626"
                                                    : user.role ===
                                                      "dermatologist"
                                                    ? "#0369a1"
                                                    : "#16a34a",
                                            color: "white",
                                            padding: "2px 6px",
                                            borderRadius: "4px",
                                            marginLeft: "6px",
                                            textTransform: "capitalize",
                                        }}
                                    >
                                        {user.role}
                                    </span>
                                </NavLink>
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        className="nav-link"
                                    >
                                        {item.label}
                                    </NavLink>
                                ))}
                                <button className="btn ghost" onClick={logout}>
                                    Logout
                                </button>
                            </>
                        ) : (
                            <>
                                <NavLink to="/login" className="nav-link">
                                    Login
                                </NavLink>
                                <NavLink to="/register" className="btn blue">
                                    Sign up
                                </NavLink>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div
                className={isHomePage ? "" : "container"}
                style={isHomePage ? {} : { padding: "24px 0" }}
            >
                <Outlet />
            </div>

            {/* Footer */}
            <div className="footer">
                <div className="container footer-content">
                    <div>
                        © {new Date().getFullYear()} SkinBloom • Skincare
                        simplified
                    </div>
                    <div className="footer-links">
                        <Link to="/profile">Profile</Link>
                        <Link to="/routine">Routine</Link>
                        <a href="mailto:support@skinbloom.app">Contact</a>
                    </div>
                </div>
            </div>
        </>
    );
}
