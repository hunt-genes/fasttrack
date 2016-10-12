from pymongo import MongoClient
from pyliftover import LiftOver

mongo_client = MongoClient()
db = mongo_client.fasttrack

lo = LiftOver('hg38ToHg19.over.chain.gz')

unmatched = 0
matched = 0
for r in db.gwas.find():
    chrid = r['chr_id']
    chrpos = r['chr_pos']
    if chrid and chrpos:
        try:
            _chrpos = int(chrpos)
        except:
            pass
        else:
            lifted = lo.convert_coordinate('chr%s' % chrid, _chrpos - 1)
            if lifted:
                new_chrid = lifted[0][0].split('chr')[1]
                new_chrpos = lifted[0][1]
                matched += 1
                db.gwas.update_many({'chr_id': chrid, 'chr_pos': chrpos}, {'$set': {'hg19chr': new_chrid, 'hg19pos': new_chrpos}})
            else:
                #print('NONE: %s %s' %(chrid, chrpos))
                unmatched += 1

print(unmatched, matched)
