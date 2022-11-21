FROM ubuntu:22.04

LABEL org.opencontainers.image.source=https://github.com/yongjulejule/playground
LABEL org.opencontainers.image.authors=yongjule(lyjshow200@gmail.com)
LABEL org.opencontainers.image.version=1.0.0
LABEL org.opencontainers.image.description="linux playground for tests"


RUN apt update && apt install -y gcc g++ vim git curl

RUN bash -c "$(curl -fsSL https://raw.githubusercontent.com/ohmybash/oh-my-bash/master/tools/install.sh)" && \
		sed -i 's/OSH_THEME="robbyrussell"/OSH_THEME="agnoster"/g' ~/.bashrc 


VOLUME ["/root/playground"]
