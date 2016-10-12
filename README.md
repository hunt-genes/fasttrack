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
make schema
make
npm start
````

````sh
virtualenv3 venv
source venv/bin/activate
pip install -r requirements
python import-freq.py
````

Deployment
----------

````sh
make install
make schema
make build
``

````sh
virtualenv -p python3 venv
source venv/bin/activate
pip install -r requirements
````

Get your web server to point to server.js in your cloned directory.

License
-------

[AGPL3](/LICENSE)
