// controllers/payments.js
import dotenv from "dotenv";
import Stripe from "stripe";
import User from "../models/User.js";
import Product from "../models/Product.js";

dotenv.config(); // Load .env variables

if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe secret key is missing. Check your .env file.");
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2022-11-15",
});

// Create consultation checkout session
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
                            description: "Professional skin consultation with certified dermatologist",
                            images: ["https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=500&h=500&fit=crop"]
                        },
                        unit_amount: 5000, // $50 in cents
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/cancel`,
            metadata: {
                type: "consultation",
                userId: req.user?.id || "guest"
            }
        });

        res.status(200).json({ id: session.id, url: session.url });
    } catch (error) {
        console.error("Stripe consultation error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Create product checkout session (for cart items)
export const createProductCheckout = async (req, res) => {
    try {
        const { cartItems, paymentType = "full", customerInfo } = req.body;
        
        if (!cartItems || cartItems.length === 0) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        // Fetch product details and validate stock
        const line_items = [];
        let totalAmount = 0;

        for (const item of cartItems) {
            const product = await Product.findById(item.productId);
            if (!product) {
                return res.status(404).json({ error: `Product ${item.productId} not found` });
            }
            
            if (!product.inStock) {
                return res.status(400).json({ error: `Product ${product.name} is out of stock` });
            }

            const itemAmount = product.price * item.quantity;
            totalAmount += itemAmount;

            line_items.push({
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: product.name,
                        description: `${product.brand} - ${product.category}`,
                        images: product.image ? [product.image] : [],
                        metadata: {
                            productId: product._id.toString(),
                            brand: product.brand,
                            category: product.category
                        }
                    },
                    unit_amount: Math.round(product.price * 100), // Convert to cents
                },
                quantity: item.quantity,
            });
        }

        // Calculate EMI amount if applicable
        let sessionAmount = totalAmount;
        let mode = "payment";
        
        if (paymentType === "emi" && totalAmount >= 100) {
            // For EMI, create subscription mode (simplified example)
            mode = "payment"; // Keep as payment for simplicity
            // In real implementation, you'd create subscription for EMI
        }

        // Create Stripe session
        const sessionConfig = {
            payment_method_types: ["card"],
            line_items,
            mode,
            success_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || "http://localhost:5173"}/cart`,
            metadata: {
                type: "product_purchase",
                userId: req.user?.id || "guest",
                paymentType,
                totalAmount: totalAmount.toString(),
                itemCount: cartItems.length.toString()
            },
            shipping_address_collection: {
                allowed_countries: ['US', 'CA', 'GB', 'AU', 'BD', 'IN'],
            },
            phone_number_collection: {
                enabled: true,
            }
        };

        // Add customer email if provided
        if (customerInfo?.email) {
            sessionConfig.customer_email = customerInfo.email;
        }

        // Add discount for cash payment
        if (paymentType === "cash_discount") {
            const discountAmount = Math.round(totalAmount * 0.05 * 100); // 5% discount
            sessionConfig.discounts = [{
                coupon: await createDiscountCoupon(discountAmount)
            }];
        }

        const session = await stripe.checkout.sessions.create(sessionConfig);

        res.status(200).json({ 
            id: session.id, 
            url: session.url,
            totalAmount,
            paymentType
        });
    } catch (error) {
        console.error("Stripe product checkout error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Create discount coupon for cash payments
const createDiscountCoupon = async (discountAmount) => {
    try {
        const coupon = await stripe.coupons.create({
            amount_off: discountAmount,
            currency: 'usd',
            duration: 'once',
            name: 'Cash Payment Discount (5%)'
        });
        return coupon.id;
    } catch (error) {
        console.error("Error creating coupon:", error);
        return null;
    }
};

// Verify payment and create order
export const verifyPayment = async (req, res) => {
    try {
        const { sessionId } = req.params;
        
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        
        if (session.payment_status === 'paid') {
            // Payment successful - create order record
            const orderData = {
                sessionId,
                userId: session.metadata.userId !== "guest" ? session.metadata.userId : null,
                type: session.metadata.type,
                amount: session.amount_total / 100, // Convert from cents
                paymentType: session.metadata.paymentType || "full",
                status: "paid",
                customerEmail: session.customer_details?.email,
                customerPhone: session.customer_details?.phone,
                shippingAddress: session.shipping_details?.address,
                createdAt: new Date()
            };

            // In a real app, you'd save this to an Orders collection
            // For now, we'll just return the verification

            res.status(200).json({
                success: true,
                order: orderData,
                session: {
                    id: session.id,
                    payment_status: session.payment_status,
                    amount_total: session.amount_total,
                    customer_details: session.customer_details
                }
            });
        } else {
            res.status(400).json({
                success: false,
                error: "Payment not completed",
                status: session.payment_status
            });
        }
    } catch (error) {
        console.error("Payment verification error:", error.message);
        res.status(500).json({ error: error.message });
    }
};

// Get payment methods and options
export const getPaymentOptions = async (req, res) => {
    try {
        const { amount } = req.query;
        const numAmount = parseFloat(amount) || 0;

        const options = {
            full_payment: {
                available: true,
                amount: numAmount,
                description: "Pay full amount now"
            },
            cash_discount: {
                available: numAmount >= 50,
                amount: numAmount * 0.95, // 5% discount
                savings: numAmount * 0.05,
                description: "5% discount for immediate payment"
            },
            emi_options: {
                available: numAmount >= 100,
                plans: numAmount >= 100 ? [
                    {
                        months: 3,
                        monthly_amount: (numAmount / 3).toFixed(2),
                        total_amount: numAmount,
                        interest_rate: "0%"
                    },
                    {
                        months: 6,
                        monthly_amount: (numAmount / 6).toFixed(2),
                        total_amount: numAmount,
                        interest_rate: "0%"
                    },
                    {
                        months: 12,
                        monthly_amount: (numAmount * 1.05 / 12).toFixed(2),
                        total_amount: (numAmount * 1.05).toFixed(2),
                        interest_rate: "5%"
                    }
                ] : []
            }
        };

        res.status(200).json(options);
    } catch (error) {
        console.error("Error getting payment options:", error.message);
        res.status(500).json({ error: error.message });
    }
};
