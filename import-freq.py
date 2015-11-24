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

data = {}
with open('freq-table-hunt.csv') as tsvfile:
    freqs = csv.reader(tsvfile, delimiter='\t')
    for row in freqs:
        snp = row[0].replace("rs", "")
        if is_int(snp):
            data[snp] = row[3]

with open('gwas_catalog_v1.0.1-downloaded_2015-11-18.tsv') as tsvfile:
    gwas = csv.reader(tsvfile, delimiter='\t')
    header_line = True
    for row in gwas:
        snp = row[23]
        hunt = data[snp]
            out = db.gwas.update_many({"SNP_ID_CURRENT": snp},
                                      {"$set": {"hunt": row[3]}})
            if (out.matched_count):
                print(i, snp, out.acknowledged, out.matched_count, out.modified_count)
        header_line = False
