from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from bson.objectid import ObjectId
from datetime import datetime, timedelta

import config
from helpers import hash_password, verify_password

app = Flask(__name__)
app.config["MONGO_URI"] = config.MONGO_URI
app.config["JWT_SECRET_KEY"] = config.JWT_SECRET_KEY
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=1)

mongo = PyMongo(app)
jwt = JWTManager(app)

# -----------------------------
# CORS CONFIGURATION
# -----------------------------
# Allow multiple frontends
CORS(app, origins=config.CORS_ORIGINS, supports_credentials=True)

# Database collections
db = mongo.cx.get_database()
users_collection = db["users"]
expenses_collection = db["expenses"]

# -----------------------------
# Health Check
# -----------------------------
@app.route("/", methods=["GET"])
def home():
    return jsonify({"msg": "Flask API is running"}), 200

# -----------------------------
# Auth Routes
# -----------------------------
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

@app.route("/api/auth/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = get_jwt_identity()
    user = users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        return jsonify({"msg": "User not found"}), 404

    return jsonify({
        "user": {
            "id": str(user["_id"]),
            "username": user.get("username"),
            "email": user.get("email"),
        }
    }), 200

# -----------------------------
# Expenses Routes
# -----------------------------
@app.route("/api/expenses", methods=["GET"])
@jwt_required()
def get_expenses():
    user_id = get_jwt_identity()
    cursor = expenses_collection.find({"user_id": user_id}).sort("date", -1)
    expenses = []
    for exp in cursor:
        exp["_id"] = str(exp["_id"])
        if isinstance(exp.get("date"), datetime):
            exp["date"] = exp["date"].strftime("%b %d, %Y")
        expenses.append(exp)
    return jsonify({"expenses": expenses}), 200

@app.route("/api/expenses", methods=["POST"])
@jwt_required()
def add_expense():
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400

    title = data.get("title", "").strip()
    category = data.get("category", "").strip()
    amount = data.get("amount")
    description = data.get("description", "").strip() if data.get("description") else ""

    if not title or not category or amount is None:
        return jsonify({"msg": "title, category and amount are required"}), 400

    try:
        amount_val = float(amount)
    except (ValueError, TypeError):
        return jsonify({"msg": "amount must be a number"}), 400

    expense = {
        "user_id": user_id,
        "title": title,
        "category": category,
        "amount": amount_val,
        "description": description,
        "date": datetime.utcnow()
    }
    res = expenses_collection.insert_one(expense)
    expense["_id"] = str(res.inserted_id)
    expense["date"] = expense["date"].strftime("%b %d, %Y")
    return jsonify({"msg": "Expense added", "expense": expense}), 201

@app.route("/api/expenses/<expense_id>", methods=["DELETE"])
@jwt_required()
def delete_expense(expense_id):
    user_id = get_jwt_identity()
    try:
        res = expenses_collection.delete_one({"_id": ObjectId(expense_id), "user_id": user_id})
    except Exception:
        return jsonify({"msg": "Invalid expense id"}), 400

    if res.deleted_count == 0:
        return jsonify({"msg": "Expense not found"}), 404
    return jsonify({"msg": "Expense deleted"}), 200

@app.route("/api/expenses/<expense_id>", methods=["PUT"])
@jwt_required()
def update_expense(expense_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    if not data:
        return jsonify({"msg": "No input provided"}), 400

    update_fields = {}
    if "title" in data:
        title = data.get("title", "").strip()
        if title:
            update_fields["title"] = title
    if "category" in data:
        category = data.get("category", "").strip()
        if category:
            update_fields["category"] = category
    if "amount" in data:
        try:
            update_fields["amount"] = float(data.get("amount"))
        except (ValueError, TypeError):
            return jsonify({"msg": "amount must be a number"}), 400
    if "description" in data:
        update_fields["description"] = data.get("description", "").strip()

    if not update_fields:
        return jsonify({"msg": "No valid fields to update"}), 400

    try:
        res = expenses_collection.update_one(
            {"_id": ObjectId(expense_id), "user_id": user_id},
            {"$set": update_fields}
        )
    except Exception:
        return jsonify({"msg": "Invalid expense id"}), 400

    if res.matched_count == 0:
        return jsonify({"msg": "Expense not found"}), 404

    expense = expenses_collection.find_one({"_id": ObjectId(expense_id)})
    expense["_id"] = str(expense["_id"])
    if isinstance(expense.get("date"), datetime):
        expense["date"] = expense["date"].strftime("%b %d, %Y")
    return jsonify({"msg": "Expense updated", "expense": expense}), 200

# -----------------------------
# Run Server
# -----------------------------
if __name__ == "__main__":
    print("✅ Connected to MongoDB:", config.MONGO_URI)
    app.run(host="0.0.0.0", port=5000)
