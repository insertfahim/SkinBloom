import React, { useState } from 'react';
import API from '../auth';
import { useAuth } from './App'; // <--- UPDATED IMPORT PATH

export default function StripeCheckoutButton() {
    const { isAuthenticated } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleCheckout = async () => {
        // Only proceed if the user is authenticated
        if (!isAuthenticated) {
        setError('You must be logged in to book a consultation.');
        return;
        }

        setLoading(true);
        setError(null);
        try {
        // Make a POST request to your backend to create a Stripe checkout session
        const response = await API.post('/payments/consultation');
        const { url } = response.data;

        if (url) {
            // Redirect the user to the Stripe-hosted checkout page
            window.location.href = url;
        } else {
            setError('Failed to get a valid checkout URL from the server.');
        }
        } catch (err) {
        console.error('Stripe checkout error:', err);
        // Display a user-friendly error message
        setError(err.response?.data?.error || 'Failed to start the checkout process. Please try again.');
        } finally {
        setLoading(false);
        }
    };

    return (
        <>
        <button className="btn consultation-btn" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Redirecting...' : 'Book a Consultation'}
        </button>
        {error && (
            <p className="error-message">{error}</p>
        )}
        </>
    );
}