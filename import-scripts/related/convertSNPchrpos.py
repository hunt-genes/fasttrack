#!/usr/bin/env python3

"""
Read a file where SNP is in first column, prepend [chr_id]:[chr_pos] to each
line.

This is first part to do checkup against imputations data.
"""

import argparse
import gzip
import re

parser = argparse.ArgumentParser()
parser.add_argument("snp_file")
parser.add_argument("position_file",
        help="filename for gzipped file containing SNPs and positions")
args = parser.parse_args()

snps_to_convert = {}

with open(args.snp_file) as snpfile:
    for line in snpfile:
        snp, *rest = line.split()
        snp = re.sub(r"^rs", "", snp)
        snps_to_convert[snp] = line

_known = 0
_unknown = 0
with open(args.snp_file+".chrpos", "w") as outfile:
    with gzip.open(args.position_file, "rt", encoding="utf-8") as zipfile:
        for i, line in enumerate(zipfile):
            if i % 100000 == 0:
                print(i/1000000)

            splitted = line.split('\t')
            try:
                snp, chr, pos, *extra = splitted
            except:
                continue

            if snp not in snps_to_convert:
                _unknown += 1
                continue

            _known += 1

            outfile.write("{}:{} {}".format(chr, pos,
                snps_to_convert[snp]))

print(len(snps_to_convert), _known, _unknown)
