import json
from pymongo import MongoClient
import os
from datetime import datetime

print("Current working directory:", os.getcwd())

db_name = 'QLBenhVien'  # tên database MongoDB

client = MongoClient('mongodb://localhost:27017/')
db = client[db_name]

def convert_dates(record):
    if 'NgayKham' in record and isinstance(record['NgayKham'], str):
        try:
            # parse chuỗi ISO8601 thành datetime object
            record['NgayKham'] = datetime.fromisoformat(record['NgayKham'].replace("Z", "+00:00"))
        except Exception as e:
            print(f"Error parsing date: {record['NgayKham']} -> {e}")
    return record

with open('.\\python\\data.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for collection_name, records in data.items():
    collection = db[collection_name]
    if isinstance(records, list):
        # Convert date fields nếu collection là lichkham
        if collection_name.lower() == 'lichkham':
            records = [convert_dates(r) for r in records]

        if records:
            collection.insert_many(records)
            print(f'Inserted {len(records)} documents into collection "{collection_name}"')
    else:
        record = records
        if collection_name.lower() == 'lichkham':
            record = convert_dates(record)
        collection.insert_one(record)
        print(f'Inserted 1 document into collection "{collection_name}"')

print('Done!')
