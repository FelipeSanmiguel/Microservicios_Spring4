from django.conf import settings
from pymongo import MongoClient


# =========================
# Base de escritura / Command
# =========================
command_client = MongoClient(
    settings.MONGO_COMMAND_URI,
    serverSelectionTimeoutMS=5000
)

command_db = command_client[settings.MONGO_COMMAND_DB_NAME]

command_reportes_collection = command_db[
    settings.MONGO_COMMAND_COLLECTION_REPORTES
]


# =========================
# Base de lectura / Query
# =========================
query_client = MongoClient(
    settings.MONGO_QUERY_URI,
    serverSelectionTimeoutMS=5000
)

query_db = query_client[settings.MONGO_QUERY_DB_NAME]

query_reportes_collection = query_db[
    settings.MONGO_QUERY_COLLECTION_REPORTES
]


# Opcional: índice único solo en la base de escritura
# command_reportes_collection.create_index("reporte_id", unique=True)