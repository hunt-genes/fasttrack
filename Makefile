# The benefits of this makefile are not very big, but at least it gives a
# pointer in the right direction

build:
	npm run build

watch:
	npm run watch

install:
	npm install

run:
	nodemon

.PHONY: build watch install run
