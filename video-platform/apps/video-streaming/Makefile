
IMAGE_NAME = "video_stream"
CONTAINER_NAME = "video_stream"

.PHONY: help build-image run clean logs

help:
	@echo "Usage:"
	@echo "  make build-image"
	@echo "  make run"
	@echo "  make clean"
	@echo "  make logs"

build-image:
	docker build -t $(IMAGE_NAME) .

run:
	docker run -d --init --name $(CONTAINER_NAME) --env DEBUG=true -p 3000:3000 $(IMAGE_NAME)

clean: 
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

logs:
	docker logs -f $(CONTAINER_NAME)

