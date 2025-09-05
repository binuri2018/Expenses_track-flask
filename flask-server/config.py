import os
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb+srv://pbinu5083:aEnpsmXjdomEuR6o@cluster0.ooictsa.mongodb.net/flask_ex")
JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "AB2018")
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:3000")
