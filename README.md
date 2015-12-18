Gwasc
=====

GWAS catalog search frontend. For a subset of GWAS and some other fields using
or modifying the import script.


Development
-----------

This is a Python and Javascript project that has a frontend server running
Express (Javascript) and an import script in Python.

````sh
make install
make
npm start
````

````sh
virtualenv3 venv
source venv/bin/activate
pip install -r requirements
python import-freq.py
````

License
-------

[AGPL3](/LICENSE)
