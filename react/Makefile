build:
	docker build -t teisy-dev-ui .
run:
	make build
	docker run -p 3000:3000 -d --name app teisy-dev-ui
start:
	docker run -p 3000:3000 -d --name app teisy-dev-ui
stop:
	docker stop app
	docker rm app