"""
Importing imputation data into database. You need to specify the build number,
or "current" (for the most current: 38). And a biobank_identifier because we
support multiple biobanks. And of course the file to import from.

If you import data is specified in multiple files, you need to run this
multiple times.
"""

import argparse
import csv
import gzip
import re

from pymongo import MongoClient

def categorize_float(value):
    if value > 0 and value <= 0.001:
        return "(0,0.001]"
    elif value <= 0.01:
        return "(0.001,0.01]"
    elif value <= 0.1:
        return "(0.01,0.1]"
    elif value <= 0.2:
        return "(0.1,0.2]"
    elif value <= 0.3:
        return "(0.2,0.3]"
    elif value <= 0.4:
        return "(0.3,0.4]"
    elif value <= 0.5:
        return "(0.4,0.5]"
    else:
        raise ValueError


def add_imputation_data(snps, position, ref, alt, alt_frq, maf, rsq, genotyped, imputed):

    data = dict(position=position, ref=ref, alt=alt, alt_frq=alt_frq, maf=maf,
            rsq=rsq, genotyped=genotyped, imputed=imputed)

    snps[position].append(data)

parser = argparse.ArgumentParser()
parser.add_argument("build_number", help="Build number to use when doing database lookups")
parser.add_argument("biobank_identifier", help="Identifier to distinguish data in database")
parser.add_argument("filename", help="Filename to gzip file")
args = parser.parse_args()

mongo_client = MongoClient()
db = mongo_client.fasttrack

gwas_snps = db.gwas.find()
positions = {}

if args.build_number == "38" or args.build_number == "current":
    chr_col = "chr_id"
    pos_col = "chr_pos"
else:
    chr_col = "build" + args.build_number + "_chr_id"
    pos_col = "build" + args.build_number + "_pos"

bad = 0
for position in gwas_snps:
    if position['snp_id_current']:
        if not chr_col in position:
            # print('missing chr_col', position);
            bad += 1
            continue
        if not chr_col in position:
            # print('missing pos_col', position);
            bad += 1
            continue
        positions[position[chr_col] + ":" + str(int(position[pos_col]) + 1)] = []

missed = 0
ignored = 0
with gzip.open(args.filename, 'rt', encoding='utf-8') as zipfile:
    data = csv.reader(zipfile, delimiter='\t')
    for counter, line in enumerate(data):
        if counter % 100000 == 0:
            print(counter)

        pos, ref, alt, _alt_frq, _maf, avg_call, _rsq, _genotyped, *rest = line
        if pos not in positions:
            # ignore this line if we don't have it in fasttrack database
            missed += 1
            continue

        rsq = None
        imputed = _genotyped == "Imputed"
        genotyped = _genotyped == "Genotyped"
        try:
            alt_frq = float(_alt_frq)
            maf = float(_maf)
            if genotyped or imputed:
                rsq = float(_rsq)
        except:
            print(line)
            raise "ost"

        if _genotyped == "Typed_Only":
            add_imputation_data(positions, pos, ref, alt, alt_frq, maf, None,
                    genotyped, imputed)
        elif _genotyped == "Genotyped":
            add_imputation_data(positions, pos, ref, alt, alt_frq, maf, rsq,
                    genotyped, imputed)
        else:  # imputed
            if maf < 0.005:
                # print(line, "low maf")
                if rsq >= 0.8:
                    add_imputation_data(positions, pos, ref, alt, alt_frq, maf,
                            rsq, genotyped, imputed)
                else:
                    ignored += 1
            else:
                # print(line, "high maf")
                if rsq >= 0.3:
                    add_imputation_data(positions, pos, ref, alt, alt_frq, maf,
                            rsq, genotyped, imputed)
                else:
                    ignored += 1

matched = 0
updated = 0
has_data = 0

for position, data in positions.items():
    if data:
        has_data += 1
        chr_id, chr_pos = position.split(":")
        chr_pos = str(int(chr_pos) - 1)

        result = db.gwas.update_many({chr_col: chr_id, pos_col: chr_pos},
                {"$set": {args.biobank_identifier: data}})
        matched += result.matched_count
        updated += result.modified_count

print("Matched {} studies of {} snps with data, and updated {}. Ignored: {}, missed: {}, bad: {}".format(
    matched, has_data, updated, ignored, missed, bad
    ))
