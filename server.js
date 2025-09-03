import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// ======================
// NYT NEWS ROUTE
// ======================
const NYT_API_KEY = process.env.NYT_API_KEY;

app.get("/news/:section", async (req, res) => {
  try {
    const section = req.params.section || "home";
    const url = `https://api.nytimes.com/svc/topstories/v2/${section}.json?api-key=${NYT_API_KEY}`;

    const response = await axios.get(url);

    const articles = response.data.results.slice(0, 20).map((item) => ({
      title: item.title,
      publishedAt: item.published_date,
      description: item.abstract,
      url: item.url,
      source: "New York Times",
      image: item.multimedia && item.multimedia.length > 0 ? item.multimedia[0].url : null,
    }));

    res.json(articles);
  } catch (err) {
    console.error("❌ Error fetching news:", err.message);
    res.status(500).json({ error: "Failed to fetch news" });
  }
});

// ======================
// CONTACT FORM ROUTE
// ======================
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
        pass: process.env.EMAIL_PASS, // Gmail App Password
      },
    });

    const mailOptions = {
      from: `"FactCheck Buddy Contact" <${process.env.EMAIL_USER}>`,
      to: process.env.RECEIVER_EMAIL,
      subject: `📩 New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
    };

    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("❌ Nodemailer Error Details:", err);
        return res.json({ success: false, error: err.message });
      }
      console.log("✅ Contact Email sent:", info.response);
      return res.json({ success: true });
    });
  } catch (err) {
    console.error("❌ Server Exception:", err);
    res.json({ success: false, error: err.message });
  }
});

// ======================
// FEEDBACK FORM ROUTE
// ======================
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
        pass: process.env.EMAIL_PASS,
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
      }
      console.log("✅ Feedback Email sent:", info.response);
      return res.json({ success: true });
    });
  } catch (err) {
    console.error("❌ Server Exception:", err);
    res.json({ success: false, error: err.message });
  }
});

// ======================
// CLAIM CHECK STUB
// ======================
app.post("/api/check-claim", (req, res) => {
  const { claim } = req.body;

  if (!claim || claim.trim() === "") {
    return res.status(400).json({ error: "Claim text is required" });
  }

  return res.json({
    verdict: "unverified",
    description: "Claim not verified.",
    sources: [],
  });
});

// ======================
// ROOT CHECK
// ======================
app.get("/", (req, res) => {
  res.send("✅ NYT FactCheck-Buddy Backend is running...");
});

// ======================
// START SERVER
// ======================
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
