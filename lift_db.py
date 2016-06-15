from pymongo import MongoClient
from pyliftover import LiftOver

mongo_client = MongoClient()
db = mongo_client.gwasc

lo = LiftOver('hg38ToHg19.over.chain.gz')

unmatched = 0
matched = 0
for r in db.gwas.find():
    chrid = r['CHR_ID']
    chrpos = r['CHR_POS']
    if chrid and chrpos:
        lifted = lo.convert_coordinate('chr%s' % chrid, chrpos - 1)
        if lifted:
            new_chrid = lifted[0][0].split('chr')[1]
            new_chrpos = lifted[0][1]
            matched += 1
            db.gwas.update_many({'CHR_ID': chrid, 'CHR_POS': chrpos}, {'$set': {'hg19chr': new_chrid, 'hg19pos': new_chrpos}})
        else:
            #print('NONE: %s %s' %(chrid, chrpos))
            unmatched += 1

print(unmatched, matched)
