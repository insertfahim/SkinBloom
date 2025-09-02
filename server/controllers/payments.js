// controllers/payments.js
import dotenv from "dotenv";
import Stripe from "stripe";

dotenv.config(); // Load .env variables

if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe secret key is missing. Check your .env file.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
    });

    export const createConsultationCheckout = async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
            price_data: {
                currency: "usd",
                product_data: {
                name: "Dermatologist Consultation",
                },
                unit_amount: 5000, // $50 in cents
            },
            quantity: 1,
            },
        ],
        mode: "payment",
        success_url: "http://localhost:3000/success",
        cancel_url: "http://localhost:3000/cancel",
        });

        // Send back the URL so the frontend can redirect
        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe error:", error.message);
        res.status(500).json({ error: error.message });
    }
};
