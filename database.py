from pymongo import MongoClient

# Replace with your actual Atlas connection string
MONGO_URI = "mongodb+srv://<username>:<password>@cluster0.abcde.mongodb.net/myDatabase?retryWrites=true&w=majority"

# Connect to MongoDB
client = MongoClient(MONGO_URI)

# Choose a database
db = client["myDatabase"]

# Choose a collection
collection = db["myCollection"]

print("✅ Connected to MongoDB!")
