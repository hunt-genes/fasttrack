# The benefits of this makefile are not very big, but at least it gives a
# pointer in the right direction

schema:
	npm run build:schema

install:
	yarn install

run:
	npm start

# webpack dev-server
dev:
	npm run dev

lint:
	npm run lint

.PHONY: schema install run dev lint
