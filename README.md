Gwasc
=====

GWAS catalog search frontend. For a subset of GWAS and some other fields using
or modifying the import script.


Development
-----------

This is a Python and Javascript project that has a frontend server running
Express (Javascript) and an import script in Python.

````sh
npm install
npm run build:schema
npm run watch
npm start
````

````sh
virtualenv3 venv
source venv/bin/activate
pip install -r requirements
````

Deployment
----------

````sh
npm install
npm run build:schema
npm run build
``

````sh
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements
````

Get your web server to point to server.js in your cloned directory.

Data import
-----------

Download gwas catalog data from: https://www.ebi.ac.uk/gwas/docs/downloads

````sh
wget https://www.ebi.ac.uk/gwas/api/search/downloads/alternative
python import-scripts/import-gwas.py alternative
````

To add a set of columns for build 37 (Norwegian biobanks are normally on build
37, GWAS catalog is on 38), add a set of extra fields for build 37 by running:

```sh
python import-scripts/convertPositions.py 37 /home/sigurdga/lift/b147_SNPChrPosOnRef_105.bcp.gz
```

Assuming you have imputation info in the folder `tmp/IMPUTATION_INFO`, import all
the files. The normal way today is to have one file per chromosome, made for
build 37 so we loop and import all of these in the following command:

```sh
for f in `ls tmp/IMPUTATION_INFO/`; do echo $f; python import-scripts/import-imputation-data.py 37 hunt tmp/IMPUTATION_INFO/$f; done
```

This import script will also adjust the chromosome position by one during
matching, since biobank positions seems to be 0-indexed, while GWAS data is
1-indexed.

License
-------

[AGPL3](/LICENSE)
