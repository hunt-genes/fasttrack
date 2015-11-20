from pymongo import MongoClient
import csv

mongo_client = MongoClient()
db = mongo_client.gwasc


def is_int(value):
    try:
        int(value)
        return True
    except ValueError:
        return False

i = 0
with open('freq-table-hunt.csv') as tsvfile:
    freqs = csv.reader(tsvfile, delimiter='\t')
    for row in freqs:
        i += 1
        snp = row[0].replace("rs", "")
        if is_int(snp):
            out = db.gwas.update_many({"SNP_ID_CURRENT": snp},
                                      {"$set": {"hunt": row[3]}})
            if (out.matched_count):
                print(i, snp, out.acknowledged, out.matched_count, out.modified_count)
