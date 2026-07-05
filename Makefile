IMAGE ?= ghcr.io/tuor4eg/scroller:latest

.PHONY: push deploy

# Build the production static image locally and push it to the registry.
push:
	docker build -t $(IMAGE) .
	docker push $(IMAGE)

# Pull the fresh app image and restart the application.
deploy:
	docker compose pull app
	docker compose up -d app

