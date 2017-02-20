About Lifting RsIDs
===================

The RsID is the identificator of the SNP. RsIDs can be merged when people find
out they are the same. This is tracked in the `RsMergeArch.bcp.gz`file. When
RsIDs are merged, the lowest number is kept.

This knowledge is no longer needed to do imports to the Fasttrack service, the
toplevel README.md has the easiest howto.

RsMergeArch.bcp.gz
------------------

The important fields of this file:

* 0: High number
* 1: Low number
* 6: Current ID

If the high number is 9, and this has been merged with the lower 5, which has
later been merged with the lowest 3, all these are different. In most cases,
the low and the current value are the same.

So, why not just use columns 0 and 6? In some very rare cases, an older number
has been discovered to not be the same, and has to be [un-merged]. But we still
need to keep the history that is has been merged earlier. We use the
`SNPHistory.bcp.gz` file to scan for these cases.

SNPHistory.bcp.gz
-----------------

This file contains inactive SNPs. We need to avoid these inactive SNPs when we
follow the merging. Some lines contain the string "Re-activated", and these are
valid and should be ignored when looking up "deleted" RsIDs.

The algorithm from [Michigan] avoids these deleted in a way that if a current RsID is
marked as inactive, it will find the lowest merged ID before this, following
the merge path recursively.

Comments
--------

Be aware that the script in [2] is old, and looks for "re-activ" with a
lowercase "r", of which there are none in the SNPHistory.bcp.gz file. Code in
this repository has been corrected for this.

[un-merged]: https://www.ncbi.nlm.nih.gov/books/NBK44496/#Schema.rs4823903_which_has_merged_into_r
[Michigan]: http://genome.sph.umich.edu/wiki/LiftRsNumber.py
