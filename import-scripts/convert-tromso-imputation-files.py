import argparse
import csv
import re

parser = argparse.ArgumentParser()
parser.add_argument("input_filename")
parser.add_argument("output_filename")
args = parser.parse_args()

with open(args.input_filename) as ssvfile:
    with open(args.output_filename, "w") as tsvfile:
        data = csv.reader(ssvfile, delimiter=' ')
        for line in data:
            chr_id = re.sub("^chr", "", line[0])
            chr_pos = line[1]
            newline = chr_id + ":" + chr_pos + "\t" + "\t".join(line[3:]) + "\n"
            tsvfile.write(newline)
