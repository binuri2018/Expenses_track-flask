from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from flask_cors import CORS
from bson.objectid import ObjectId
from datetime import timedelta

import config
from helpers import hash_password, verify_password

app = Flask(__name__)
app.config["MONGO_URI"] = config.MONGO_URI
app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

mongo = PyMongo(app)
jwt = JWTManager(app)
CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

# Safe database access
db = mongo.cx.get_database()
users_collection = db["users"]

# --------------------------
# Home / Health Check Route
# --------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"msg": "Flask API is running"}), 200

# --------------------------
# Register
# --------------------------
@app.route("/api/auth/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400

    username = data.get("username", "").strip().lower()
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not username or not email or not password:
        return jsonify({"msg": "username, email and password are required"}), 400

    if users_collection.find_one({"email": email}):
        return jsonify({"msg": "Email already registered"}), 409

    hashed = hash_password(password)
    user = {"username": username, "email": email, "password": hashed}
    res = users_collection.insert_one(user)
    user_id = str(res.inserted_id)
    access_token = create_access_token(identity=user_id)
    return jsonify({"msg": "User created", "access_token": access_token}), 201

# --------------------------
# Login
# --------------------------
@app.route("/api/auth/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"msg": "email and password are required"}), 400

    user = users_collection.find_one({"email": email})
    if not user or not verify_password(user["password"], password):
        return jsonify({"msg": "Invalid credentials"}), 401

    user_id = str(user["_id"])
    access_token = create_access_token(identity=user_id)
    return jsonify({"msg": "Login successful", "access_token": access_token}), 200

# --------------------------
# Profile
# --------------------------
@app.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    try:
        user = users_collection.find_one({"_id": ObjectId(user_id)})
    except Exception:
        return jsonify({"msg": "User not found"}), 404

    if not user:
        return jsonify({"msg": "User not found"}), 404

    user_data = {
        "id": str(user["_id"]),
        "username": user.get("username"),
        "email": user.get("email"),
    }
    return jsonify({"user": user_data}), 200

# --------------------------
# Expenses Routes
# --------------------------
@app.route("/api/expenses", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    expenses = list(db["expenses"].find({"user_id": user_id}))
    # Convert ObjectId to string
    for exp in expenses:
        exp["_id"] = str(exp["_id"])
    return jsonify({"expenses": expenses}), 200

@app.route("/api/expenses", methods=["POST"])
@jwt_required()
def add_expense():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data or "title" not in data or "amount" not in data:
        return jsonify({"msg": "title and amount are required"}), 400

    expense = {
        "user_id": user_id,
        "title": data["title"],
        "amount": float(data["amount"])
    }
    res = db["expenses"].insert_one(expense)
    expense["_id"] = str(res.inserted_id)
    return jsonify({"msg": "Expense added", "expense": expense}), 201

@app.route("/api/expenses/<expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):
    user_id = get_jwt_identity()
    res = db["expenses"].delete_one({"_id": ObjectId(expense_id), "user_id": user_id})
    if res.deleted_count == 0:
        return jsonify({"msg": "Expense not found"}), 404
    return jsonify({"msg": "Expense deleted"}), 200


# --------------------------
# Run Server
# --------------------------
if __name__ == "__main__":
    print("✅ Connected to MongoDB:", config.MONGO_URI)
    app.run(debug=True, port=5000)
