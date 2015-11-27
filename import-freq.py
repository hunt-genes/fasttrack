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
db.drop_collection("gwas")

with open('freq-table-hunt.csv') as tsvfile:
    freqs = csv.reader(tsvfile, delimiter='\t')
    for row in freqs:
        snp = row[0].replace("rs", "")
        if is_int(snp):
            data[snp] = row[3]

with open('gwas_catalog_v1.0.1-downloaded_2015-11-18.tsv') as tsvfile:
    gwas = csv.reader(tsvfile, delimiter='\t')
    header_line = True
    headers = None
    pvalue_index = None
    i = 0
    for row in gwas:
        if False:
            continue
        i += 1

        if header_line:
            headers = row
            pvalue_index = row.index("P-VALUE")
            header_line = False

        else:
            snp = row[23]
            if snp in data:
                hunt = data[snp]
                headers.append("hunt")
                row.append(hunt)
            try:
                row[pvalue_index] = float(row[pvalue_index])
            except:
                pass
            row_data = dict(zip(headers, row))
            db.gwas.insert(row_data)
            #print(i, snp)
