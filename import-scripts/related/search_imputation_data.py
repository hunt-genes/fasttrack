#!/usr/bin/env python3

"""
From a folder of gzipped files, and a list of desired positions, search for the
desired list within the gzipped files.
"""

import argparse
import gzip
import mimetypes
import sys
from os import listdir
from os.path import join

parser = argparse.ArgumentParser()
parser.add_argument("posfile")
parser.add_argument("buildno",
        help="For the most part, files in biobanks are 37, while the newest version is 38")
parser.add_argument("imputation_folder",
        help="where the folder of gzipped imputation data is")
args = parser.parse_args()

# find gzip files in folder
gzipped_files = [
        f for f in listdir(args.imputation_folder)
        if mimetypes.guess_type(join(args.imputation_folder, f))[1] == "gzip"
        ]

if len(gzipped_files) < 1:
    sys.exit("Found no gzipped files")

print("Will use {} gzipped files in {}".format(
    len(gzipped_files), args.imputation_folder))

positions = {}
with open(args.posfile) as posfile:
    for line in posfile:
        pos, snp, *rest = line.split()

        chrid, chrpos = pos.split(":")

        if args.buildno == "37":
            chrpos = int(chrpos) + 1

        positions["{}:{}".format(chrid, str(chrpos))] = snp

with open(args.posfile + ".imp", "w") as outfile:
    for gzipped_file in gzipped_files:
        path = join(args.imputation_folder, gzipped_file)
        with gzip.open(path, "rt", encoding="utf-8") as zipfile:
            print(gzipped_file)
            for i, line in enumerate(zipfile):
                if i % 100000 == 0:
                    print(i/1000000)

                splitted = line.split()
                pos = splitted[0]
                status = splitted[7]

                if pos in positions:
                    print(pos, status)
                    outfile.write("{snp} {pos} {status}\r\n".format(
                        snp=positions[pos], pos=pos, status=status))
