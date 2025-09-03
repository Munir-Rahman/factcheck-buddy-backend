📰 FactCheck Buddy Backend

AI-Powered Fake News Detection & Media Literacy Platform (Backend)

This repository contains the backend for FactCheck Buddy, a platform that fetches verified news from trusted sources (NYT API), handles contact & feedback forms, and provides APIs for the frontend.

🚀 Features

🔍 Fetch Verified News – /news/:section endpoint returns top stories

📩 Contact Form – /send-contact endpoint sends email via Nodemailer

⭐ Feedback Form – /send-feedback endpoint collects user feedback

🌐 CORS enabled – Allows requests from your frontend

🛠️ Tech Stack

Node.js & Express – Server & API

Axios – Fetching external APIs

Nodemailer – Sending emails

dotenv – Environment variable management

CORS – Cross-origin requests

📂 Installation
# Clone the repo
git clone https://github.com/Munir-Rahman/factcheck-buddy-backend.git
cd factcheck-buddy-backend

# Install dependencies
npm install

# Create .env file based on .env.example
# Add your NYT_API_KEY, EMAIL_USER, EMAIL_PASS, RECEIVER_EMAIL

# Run locally
node server.js

📌 API Endpoints
1. Get News
GET /news/:section


Example: /news/home

Response: JSON array of articles:

[
  {
    "title": "Example News",
    "publishedAt": "2025-09-03T12:00:00Z",
    "description": "News abstract",
    "url": "https://example.com",
    "source": "New York Times",
    "image": "https://image.url"
  }
]

2. Send Contact Message
POST /send-contact


Body:

{
  "name": "Your Name",
  "email": "your@email.com",
  "message": "Your message here"
}

3. Send Feedback
POST /send-feedback


Body:

{
  "rating": 5,
  "feedbackText": "Great platform!",
  "email": "your@email.com"
}

🌐 Deployment

Recommended: Render or Railway for hosting Node.js backend

Set environment variables in the dashboard:

NYT_API_KEY, EMAIL_USER, EMAIL_PASS, RECEIVER_EMAIL

📄 License

This project is licensed under the MIT License.
