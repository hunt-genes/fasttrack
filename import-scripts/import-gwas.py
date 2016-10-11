"""
Import data from the official GWAS catalog.
"""

from datetime import datetime
from pymongo import MongoClient
import argparse
import csv
import re

mongo_client = MongoClient()
db = mongo_client.fasttrack


def is_int(value):
    try:
        int(value)
        return True
    except ValueError:
        return False


def should_update(old, new):
    # should have p value
    if not new['p_value']:
        return False

    # insert if not already there
    if not old:
        return True

    old_p = old['p_value']
    new_p = row_data['p_value']
    old_date = datetime.strptime(old['date'], '%Y-%m-%d')
    new_date = datetime.strptime(row_data['date'], '%Y-%m-%d')

    # don't update if the value to keep is the newest
    if new_date < old_date:
        return False

    # don't update if the value to keep is lowest
    # date should be equal if we want to rate on p values
    if new_date == old_date and new_p > old_p:
        return False

    return True

# data = {}
traits = {}
db.drop_collection("gwas")
db.drop_collection("traits")


parser = argparse.ArgumentParser()
parser.add_argument("filename", help="Filename to tsv file")
args = parser.parse_args()

# with open('freq-table-hunt.csv') as tsvfile:
    # freqs = csv.reader(tsvfile, delimiter='\t')
    # for row in freqs:
        # snp = row[0].replace("rs", "")
        # if is_int(snp):
            # data[snp] = row[3]

with open(args.filename) as tsvfile:
    gwas = csv.reader(tsvfile, delimiter='\t')
    header_line = True
    pvalue_index = None
    best_for_unique = dict()
    for i, row in enumerate(gwas):
        row_data = None
        if header_line:
            __headers = [ re.sub(r"\W+", "_", header).strip("_").lower().replace("95_ci_text", "p95_ci_text") for header in row ]

            snp_id_current_index = __headers.index("snp_id_current")
            chr_id_index = __headers.index("chr_id")
            chr_pos_index = __headers.index("chr_pos")
            region_index = __headers.index("region")
            snps_index = __headers.index("snps")
            pvalue_index = __headers.index("p_value")
            mapped_trait_index = __headers.index("mapped_trait")
            mapped_trait_uri_index = __headers.index("mapped_trait_uri")
            mapped_gene_index = __headers.index("mapped_gene")
            reported_gene_s_index = __headers.index("reported_gene_s")
            strongest_snp_risk_allele_index = __headers.index("strongest_snp_risk_allele")
            risk_allele_frequency_index = __headers.index("risk_allele_frequency")
            context_index = __headers.index("context")

            header_line = False

        else:

            # parse pvalue
            try:
                row[pvalue_index] = float(row[pvalue_index])
            except:
                pass

            # parse/convert other values
            # * snp_id_current does sometimes contain a "b" at the end
            # * risk_allele_frequency sometimes contains a comment

            # parse and split traits - not depending on chr_id
            trait_ids = [trait.strip().replace(".", "_").lower() for trait in row[mapped_trait_index].split(",")]
            if trait_ids:
                if isinstance(row[pvalue_index], float) and row[pvalue_index] < 0.00000005:
                    trait_uris = [trait_uri.strip() for trait_uri in row[mapped_trait_uri_index].split(",")]
                    traits_with_uris = zip(trait_ids, trait_uris)
                    for trait, uri in traits_with_uris:
                        traits[trait] = uri

            # parse chr_id
            chr_id = row[chr_id_index]
            if chr_id:
                row_data = dict(zip(__headers, row))
                row_data["traits"] = trait_ids

                chrs = re.split(r" x |;", row[chr_id_index])
                pos = re.split(r" x |;", row[chr_pos_index])
                regions = re.split(r" x |;", row[region_index])
                snps = re.split(r" x |;", row[snps_index])
                risk = re.split(r" x |;", row[strongest_snp_risk_allele_index])
                reported = re.split(r" x |;", row[reported_gene_s_index])
                mapped = re.split(r" x |;", row[mapped_gene_index])
                context = re.split(r" x |;", row[context_index])

                chr_set = set(chrs)
                pos_set = set(pos)
                snps_set = set(snps)
                risk_set = set(risk)
                reported_set = set(reported)
                mapped_set = set(mapped)
                context_set = set(context)

                # add extra database row since we want to sort chromosomes
                # numerically, but still have Xs and Ys
                if len(chr_set) == 1:
                    if chr_id == "X":
                        row_data["sortable_chr_id"] = 100
                    elif chr_id == "Y":
                        row_data["sortable_chr_id"] = 101
                    else:
                        row_data["sortable_chr_id"] = int(list(chr_set)[0])

                for _c, j in enumerate(chr_set):
                    if _c != "X" and _c != "Y":
                        try:
                            int(_c)
                        except:
                            print("ERROR: could not parse CHR_ID", row[chr_id_index], _c, "as int", zip(__headers, row))
                            raise KeyError

                row_data["chr_set"] = list(chr_set)
                row_data["pos_set"] = list(pos_set)
                row_data["snps_set"] = list(snps_set)
                row_data["risk_set"] = list(risk_set)
                row_data["reported_set"] = list(reported_set)
                row_data["mapped_set"] = list(mapped_set)
                row_data["context_set"] = list(context_set)

                if " x " in row[mapped_trait_index]:
                    print("ERROR: we do not support x operator in mapped trait field", row[mapped_trait_index])
                    raise KeyError

                genes = set()
                [ [ genes.add(gene) for gene in re.split(r", | - ", m) ] for m in mapped_set  ]
                row_data["genes"] = list(genes)

                # if this uses "x" as separator, this indicates gene interactions and strict format
                if " x " in row[chr_id_index] and not (len(chrs) == len(pos) == len(regions) == len(risk) == len(mapped)):
                    interactions = []
                    for _c, _i in enumerate(chrs):
                        interactions.append(dict(
                            chr_id=_c,
                            chr_pos=pos[_i],
                            snps=snps[_i],
                            strongest_snp_risk_allele=risk[_i],
                            reported_gene_s=reported[_i],
                            mapped_gene=mapped[_i],
                            ))

                    row_data["interactions"] = interactions

                # print chrs, pos, snps, risk, reported, mapped

                result = db.gwas.insert_one(row_data)

                snp_id = row[snp_id_current_index]

                if should_update(best_for_unique.get(snp_id), row_data):
                    row_data['_id'] = result.inserted_id
                    best_for_unique[snp_id] = row_data

    for trait, uri in traits.items():
        _id = trait.replace(".", "_")
        db.traits.insert({"_id": _id, "uri": uri})

    for rsid, data in best_for_unique.items():
        db.gwas.update_one({'_id': data['_id']}, {'$set': {'best_for_unique': True}})
