import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv(
    "MONGO_URI",
    "mongodb+srv://pbinu5083:aEnpsmXjdomEuR6o@cluster0.ooictsa.mongodb.net/flask_ex"
)
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "AB2018")

# Split multiple origins by comma and strip spaces
CORS_ORIGINS = [origin.strip() for origin in os.getenv(
    "CORS_ORIGINS",
    "http://localhost:3000",
    "https://flsexpense.netlify.app",
    "https://expenses-track-flask-2.onrender.com"
).split(",")]
