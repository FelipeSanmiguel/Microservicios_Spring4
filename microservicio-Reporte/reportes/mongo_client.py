from django.conf import settings
from pymongo import MongoClient


client = MongoClient(
    settings.MONGO_URI,
    serverSelectionTimeoutMS=5000
)

db = client[settings.MONGO_DB_NAME]

reportes_collection = db[settings.MONGO_COLLECTION_REPORTES]

# Índice único para evitar reportes repetidos con el mismo reporte_id
#reportes_collection.create_index("reporte_id", unique=True)