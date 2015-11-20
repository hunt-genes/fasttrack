from pandas import pandas as pd
from pymongo import MongoClient
import json

mongo_client = MongoClient()
db = mongo_client.gwasc

data = pd.read_csv("gwas_catalog_v1.0.1-downloaded_2015-11-18.tsv", delimiter="\t", index_col="SNP_ID_CURRENT")
print(len(data.columns))
print(len(data))
print(data)
print(data.columns)
data.drop_duplicates(subset="index")
print(data.to_json(orient="index"))
json_data = json.loads(data.to_json(orient="records"))
db.gwas.insert(json_data)
