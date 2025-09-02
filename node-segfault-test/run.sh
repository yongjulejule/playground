docker run --rm -it --platform linux/amd64 -p 5432:5432 -e "DATABASE_URL=postgresql://<id>:<pw>@host.docker.internal:5432/prisma-test" prisma-gc-test:latest
