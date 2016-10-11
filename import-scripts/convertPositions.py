"""
Will read a gzipped file containing build conversion info for snps (based on
snpdb), and save these extra values to the fasttrack database.

Recent version is 38. We use this because HUNT is now on 37 (19).

First parameter is build number (now we use 37). Second is gzip filename (now
we use b147_SNPChrPosOnRef_105.bcp.gz).
"""

import gzip

from argparse import ArgumentParser
from pymongo import MongoClient

mongo_client = MongoClient()

db = mongo_client.fasttrack

parser = ArgumentParser()
parser.add_argument('build_number', help='build_number to add columns for')
parser.add_argument('file',
        help='filename for gzipped file containing position info for this build')
args = parser.parse_args()

no_position = 0
db.gwas.ensure_index('snp_id_current')

# Create a set containing all gwas data we have a known snp_id_current for.
known = set()
for gwas in db.gwas.find().sort('snp_id_current'):
    try:
        rsid = gwas['snp_id_current']
    except KeyError:
        print("fail")
        continue
    else:
        if not rsid:
            continue
    known.add(rsid)

# Loop through gzip file and set new positions where we have a known
# snp_id_current.
updated = 0
_known = 0
_unknown = 0
with gzip.open(args.file, 'rt', encoding='utf-8') as zipfile:
    for i, line in enumerate(zipfile):
        if i % 100000 == 0:
            print(i/1000000)

        splitted = line.split('\t')
        try:
            snp, chr, pos, *extra = splitted
        except:
            continue

        if snp not in known:
            _unknown += 1
            continue

        _known += 1

        if chr == "X":
            num_chr = 100
        elif chr == "Y":
            num_chr = 101
        elif chr == "MT":
            num_chr = 200
        elif chr == "PAR":
            pass
        else:
            num_chr = int(chr)

        result = db.gwas.update_many({'snp_id_current': snp}, {'$set': {
            'build' + args.build_number + '_chr_id': chr,
            'build' + args.build_number + '_chr_num': num_chr,
            'build' + args.build_number + '_pos': pos,
            }})
        updated += result.modified_count

print("Updated {}, known {}, unknown (only in file) {}".format(updated, _known, _unknown))
