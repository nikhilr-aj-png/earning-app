import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: Request) {
    console.log("[API] Create Order Request Init");
    try {
        const body = await req.json();
        console.log("[API] Create Order Payload:", body);

        const { userId, amount, type } = body;

        // SAFE LOGGING
        console.log("[API] Checking Keys:", {
            KEY_ID_EXISTS: !!process.env.RAZORPAY_KEY_ID,
            KEY_SECRET_EXISTS: !!process.env.RAZORPAY_KEY_SECRET
        });

        if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
            console.error("[API] Razorpay Keys Missing from Environment");
            return NextResponse.json({ error: 'Server Configuration Error: Razorpay Keys Missing' }, { status: 500 });
        }

        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized: Missing User ID' }, { status: 401 });
        }

        if (!amount || amount < 1) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        // Create Razorpay Order
        const options = {
            amount: Math.round(amount * 100), // Ensure integer (paise)
            currency: "INR",
            receipt: `${type || 'gen'}_${userId}_${Date.now()}`.substring(0, 40), // Receipt limit
        };

        console.log("[API] Creating Order options:", options);
        const order = await razorpay.orders.create(options);
        console.log("[API] Order Created:", order);

        return NextResponse.json(order);
    } catch (error: any) {
        console.error("Razorpay Order Error (Full):", error);

        let errorMessage = "Razorpay Order Creation Failed";

        // Handle Razorpay specific error structure
        if (error.error && error.error.description) {
            errorMessage = error.error.description;
        } else if (error.message) {
            errorMessage = error.message;
        }

        return NextResponse.json({
            error: errorMessage,
            details: error // Return full error for client debugging (dev only really, but useful now)
        }, { status: 500 });
    }
}
