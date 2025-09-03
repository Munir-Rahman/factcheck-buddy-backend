import nodemailer from "nodemailer";
import express from "express";
import cors from "cors";
import axios from "axios";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
dotenv.config();
app.use(cors());
app.use(express.json());

// API: Check claim (stub, no dataset)
app.post("/api/check-claim", (req, res) => {
  const { claim } = req.body;

  if (!claim || claim.trim() === "") {
    return res.status(400).json({ error: "Claim text is required" });
  }

  // Always return unverified because no dataset is used
  return res.json({
    verdict: "unverified",
    description: "Claim not verified.",
    sources: []
  });
});


// 🔑 NYT API Key
const NYT_API_KEY = process.env.NYT_API_KEY;

// 📰 Route: /news/:section
app.get("/news/:section", async (req, res) => {
  try {
    const section = req.params.section || "home"; // Default section = home
    const url = `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`;

    const response = await axios.get(url);

    // Format articles (only first 20)
    const articles = response.data.results.slice(0, 20).map((item) => ({
      title: item.title,
      publishedAt: item.published_date,
      description: item.abstract,
      url: item.url,
      source: "New York Times",
      image:
        item.multimedia && item.multimedia.length > 0
          ? item.multimedia[0].url
          : null,
    }));

    res.json(articles);
  } catch (error) {
    console.error("❌ Error fetching news:", error.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// ================== CONTACT FORM ROUTE ==================

app.post("/send-contact", async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.json({ success: false, error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password, no spaces
      },
    });

    const mailOptions = {
      from: `"FactCheck Buddy Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `📩 New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    };

    // 🔹 Send email with callback to catch detailed error
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Nodemailer Error Details:", err); // 👈 This will show exact reason
        return res.json({ success: false, error: err.message });
      } else {
        console.log("✅ Email sent:", info.response);
        return res.json({ success: true });
      }
    });
  } catch (err) {
    console.error("❌ Server Exception:", err);
    res.json({ success: false, error: err.message });
  }
});

// ================== FEEDBACK FORM ==================
app.post("/send-feedback", async (req, res) => {
  const { rating, feedbackText, email } = req.body;

  if (!rating || !feedbackText || !email) {
    return res.json({ success: false, error: "All fields are required" });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
      },
    });

    const mailOptions = {
      from: `"FactCheck Buddy Feedback" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `⭐ New Feedback Received`,
      text: `Rating: ${rating}/5\nEmail: ${email}\nFeedback:\n${feedbackText}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Nodemailer Error:", err);
        return res.json({ success: false, error: err.message });
      } else {
        console.log("✅ Feedback Email sent:", info.response);
        return res.json({ success: true });
      }
    });
  } catch (err) {
    console.error("❌ Server Exception:", err);
    res.json({ success: false, error: err.message });
  }
});



// Root check
app.get("/", (req, res) => {
  res.send("✅ NYT FactCheck-Buddy Backend is running...");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
