import gzip

from argparse import ArgumentParser
from pymongo import MongoClient

mongo_client = MongoClient()

db = mongo_client.fasttrack

parser = ArgumentParser()
parser.add_argument('merged')
parser.add_argument('history')

args = parser.parse_args()

merged = dict()
history = set()
unchanged = 0
lifted = 0
unlifted = 0

def find_current_rs(rs):
    if rs in merged:
        low, current = merged[rs]
        if current not in history:
            return current
        return find_current_rs(low)

with gzip.open(args.merged, 'rt', encoding='utf-8') as zipfile:
    for line in zipfile:
        splitted = line.split('\t')
        high = int(splitted[0])
        low = int(splitted[1])
        current = int(splitted[6])
        merged[high] = (low, current)

with gzip.open(args.history, 'rt', encoding='utf-8') as zipfile:
    for line in zipfile:
        if 'Re-activated' not in line:
            splitted = line.split('\t')
            history.add(int(splitted[0]))

for snp in db.gwas.find():
    rs = snp['snp_id_current']
    if rs not in merged:
        unchanged += 1
        continue

    rs = find_current_rs(rs)
    unlifted += 1

print(unchanged, lifted, unlifted)
