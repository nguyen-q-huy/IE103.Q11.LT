from pymongo import MongoClient
from datetime import datetime

client = MongoClient('mongodb://localhost:27017/')
db = client['QLBenhVien']
lichkham = db['LichKham']
bacsi = db['BacSi']

# Define date range
start_date = datetime(2024, 7, 1)
end_date = datetime(2024, 7, 31)

pipeline = [
    {
        "$match": {
            "NgayKham": {
                "$gte": start_date,
                "$lte": end_date
            }
        }
    },
    {
        "$group": {
            "_id": "$MaBacSi",
            "soLuotKham": {"$sum": 1}
        }
    },
    {
        "$lookup": {
            "from": "BacSi",
            "localField": "_id",
            "foreignField": "MaBacSi",
            "as": "bacsi_info"
        }
    },
    {
        "$unwind": "$bacsi_info"
    },
    {
        "$project": {
            "_id": 0,
            "MaBacSi": "$_id",
            "TenBacSi": "$bacsi_info.TenBacSi",
            "soLuotKham": 1
        }
    },
    {
        "$sort": {"soLuotKham": -1}
    }
]

results = lichkham.aggregate(pipeline)
print(f"Kết quả tìm kiếm từ {start_date.strftime('%Y-%m-%d')} đến {end_date.strftime('%Y-%m-%d')}")
for doc in results:
    print(f"BacSi: {doc['MaBacSi']} - Ten: {doc['TenBacSi']} - So Luot Kham: {doc['soLuotKham']}")
