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

# data = {}
traits = {}
db.drop_collection("gwas")
db.drop_collection("traits")

# with open('freq-table-hunt.csv') as tsvfile:
    # freqs = csv.reader(tsvfile, delimiter='\t')
    # for row in freqs:
        # snp = row[0].replace("rs", "")
        # if is_int(snp):
            # data[snp] = row[3]

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
            mapped_trait_index = row.index("MAPPED_TRAIT")
            mapped_trait_uri_index = row.index("MAPPED_TRAIT_URI")
            chr_id_index = row.index("CHR_ID")
            chr_pos_index = row.index("CHR_POS")

            header_line = False

        else:
            __headers = list(headers)

            # snp = row[23]
            # if snp in data:
                # hunt = data[snp]
                # __headers.append("hunt")
                # row.append(hunt)

            # parse pvalue
            try:
                row[pvalue_index] = float(row[pvalue_index])
            except:
                pass

            # parse chr_id
            if row[chr_id_index]:
                try:
                    row[chr_id_index] = int(row[chr_id_index])
                except:
                    print("ERROR: could not parse CHR_ID <", row[chr_id_index], "as int")

            # parse chr_pos
            if row[chr_pos_index]:
                try:
                    row[chr_pos_index] = int(row[chr_pos_index])
                except:
                    print("ERROR: could not parse CHR_POS <", row[chr_id_index], "as int")

            # parse and split traits
            trait_ids = [trait.strip().replace(".", "").lower() for trait in row[mapped_trait_index].split(",")]
            if trait_ids:
                __headers.append("traits")
                row.append(trait_ids)
                if isinstance(row[pvalue_index], float) and row[pvalue_index] < 0.00000005:
                    trait_uris = [trait_uri.strip() for trait_uri in row[mapped_trait_uri_index].split(",")]
                    traits_with_uris = zip(trait_ids, trait_uris)
                    for trait, uri in traits_with_uris:
                        traits[trait] = uri

            row_data = dict(zip(__headers, row))
            db.gwas.insert(row_data)
            # print(i, snp)

    for trait, uri in traits.items():
        _id = trait.replace(".", "")
        db.traits.insert({"_id": _id, "uri": uri})
