from pymongo import MongoClient
import csv
import re
import argparse


def categorize_float(value):
    if value <= 0.001:
        return "[0,0.001]"
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


parser = argparse.ArgumentParser()
parser.add_argument("filename", help="Filename to tsv file")
args = parser.parse_args()

mongo_client = MongoClient()
db = mongo_client.gwasc

all_positions = db.gwas.find()
positions = {}

for position in all_positions:
    positions["chr"+str(position["CHR_ID"])+":"+str(position["CHR_POS"])] = position

print(len(positions))

counter = 0
huntcounter = 0
with open(args.filename) as tsvfile:
    data = csv.reader(tsvfile, delimiter=' ')
    for line in data:
        chr_id = re.sub("^chr", "", line[0])
        try:  # some values are at X chromosome
            chr_id = int(chr_id)
            chr_pos = int(line[1])
            _id = line[0] + ":" + line[1]
            if _id in positions:
                counter += 1
                if "hunt" in positions[_id]:
                    print("hunt", _id)
                    huntcounter += 1


                hunt_imputed = {
                        "REF": line[3],
                        "ALT": line[4],
                        # "ALT_Frq": categorize_float(float(line[5])),
                        "MAF": categorize_float(float(line[6])),
                        "AvgCall": float(line[7]),
                        "Rsq": float(line[8]),
                        "Genotyped": line[9] == "Genotyped",
                        }
                if line[9] == "Genotyped":
                    print("Genotyped", _id)
                # if line[10] != "-":
                    # hunt_imputed["LooRsq"] = float(line[10])
                # if line[11] != "-":
                    # hunt_imputed["EmpR"] = float(line[11])
                # if line[12] != "-":
                    # hunt_imputed["EmpRsq"] = float(line[12])
                # if line[13] != "-":
                    # hunt_imputed["Dose0"] = float(line[13])
                # if line[14] != "-":
                    # hunt_imputed["Dose1"] = float(line[14])
                db.gwas.update_many({"CHR_ID": chr_id, "CHR_POS": chr_pos},
                        {"$set": {"imputed": {"hunt": hunt_imputed}}})
        except:
            pass

print(counter)
print(huntcounter)
