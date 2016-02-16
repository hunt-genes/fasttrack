#!/usr/bin/env python3.5

# Needs binary executable liftOver from
# http://genome.sph.umich.edu/wiki/LiftOver

# Also needs chain file from
# http://hgdownload.cse.ucsc.edu/goldenPath/hg19/liftOver/hg19ToHg38.over.chain.gz

# And it's using subprocess.run, which is new in python 3.5

# To unpack all chromosome data, copy everything to a new place and run:
# for a in `ls *zip`; do echo $a; b=${a#chr_}; unzip -P PASSWORD $a chr${b%.zip}.info.gz; done

import argparse
import subprocess

# ask for chromosome id and info.gz file
parser = argparse.ArgumentParser()
parser.add_argument("chr_id", help="Chromosome ID, usually a number")
parser.add_argument("filename", help="Filename to info.gz file")
args = parser.parse_args()

file_prefix = "chr" + args.chr_id

# unpack and add id column to use when merging later
cmd = "gunzip -c %s | tail -n +2 | awk '{++b; printf \"%%s\\t%%08d\\n\", $0, b}'> %s.all" % (args.filename, file_prefix)
print(cmd)
subprocess.run(cmd, shell=True)

# create bed format for liftOver using the same id
cmd = "gunzip -c %s | tail -n +2 | awk '{ split($1, a, \":\"); ++b; printf \"chr%%d\\t%%d\\t%%d\\t%%08d\\n\", a[1], a[2]+1, a[2]+2, b}'> %s.bed" % (args.filename, file_prefix)
print(cmd)
#subprocess.run(cmd, shell=True)

# run liftover
cmd = "./liftOver %(prefix)s.bed hg19ToHg38.over.chain.gz %(prefix)s.out %(prefix)s.unlifted" % {"prefix": file_prefix}
print(cmd)
#subprocess.run(cmd, shell=True)

# merge new positions to old file
cmd = "join -1 14 -2 4 %(prefix)s.all %(prefix)s.out -o 2.1,2.2,2.3,1.2,1.3,1.4,1.5,1.6,1.7,1.8,1.9,1.10,1.11,1.12,1.13 > %(prefix)s.tsv" % {"prefix": file_prefix}
print(cmd)
#subprocess.run(cmd, shell=True)
