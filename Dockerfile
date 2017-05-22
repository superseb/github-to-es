FROM node:7.10.0

ADD / /github-to-es
WORKDIR /github-to-es
RUN npm install

ADD config.json /github-to-es/config.json

ENTRYPOINT [ "/bin/bash" ]
