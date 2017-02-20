Gwasc
=====

GWAS catalog search frontend. For a subset of GWAS and some other fields using
or modifying the import script.


Development
-----------

This is a Python and Javascript project that has a frontend server running
Express (Javascript) and an import script in Python.

````sh
yarn install
yarn run build:schema
yarn start
yarn run dev
````

You can now go to `localhost:3001/huntgenes/fasttrack`. We assume you
run this project under a path prefix. See the `src/prefix.js` file if
you need to change this.

For running python scripts when doing imports:

````sh
virtualenv3 venv
source venv/bin/activate
pip install -r requirements
````

Deployment
----------

For running python scripts when doing imports:

````sh
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements
````

When updating server to latest version, run:

````sh
npm deploy
``

The task to keep the server running is located in
setup/fasttrack.service.j2, and will be added to systemd during the
deploy command listed above. Per default, we use port number 13443, so
you must set up a proxy command in your web server to that port.

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
for f in `ls tmp/IMPUTATION_INFO/`; do echo $f; python import-scripts/import-imputation-data-from-hunt.py 37 hunt tmp/IMPUTATION_INFO/$f; done
```

This import script will also adjust the chromosome position by one during
matching, since biobank positions seems to be 0-indexed, while GWAS data is
1-indexed.

Please note that Hunt and Tromso have different import scripts, as one is
has 0-indexed RSIDs and the other has 1-indexed.

License
-------

[AGPL3](/LICENSE)
