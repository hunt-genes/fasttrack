import gzip

from argparse import ArgumentParser
from pymongo import MongoClient

mongo_client = MongoClient()

db = mongo_client.fasttrack

parser = ArgumentParser()
parser.add_argument('file')

args = parser.parse_args()

moved = set()

with gzip.open(args.file, 'rt', encoding='utf-8') as zipfile:
    for line in zipfile:
        splitted = line.split()
        high = int(splitted[0])
        moved.add(high)


for snp in db.gwas.find():
    if snp['snp_id_current'] in moved:
        print('old', snp)
    else:
        print("good", snp['snp_id_current'])
