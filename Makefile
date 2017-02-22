# use yarn
install:
	yarn install

# generate graphql schema
schema:
	npm run build:schema

run:
	npm start

# webpack dev-server
dev:
	npm run dev

lint:
	npm run lint

.PHONY: schema install run dev lint
