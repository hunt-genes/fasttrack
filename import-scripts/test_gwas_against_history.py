from argparse import ArgumentParser
import gzip
from pymongo import MongoClient

mongo_client = MongoClient()

db = mongo_client.fasttrack

parser = ArgumentParser()
parser.add_argument('file')

args = parser.parse_args()

with gzip.open(args.file, 'r') as zipfile:
    for line in zipfile:
        splitted = line.decode('utf-8').split()
        dead = db.snps.find_one({'snp_id_current': splitted[0]})
        if dead:
            print(dead, splitted)
