FROM node:12.18.3

LABEL version="1.0"
LABEL description="This is the base docker image for the Ojvindix backend node app."
LABEL maintainer = ["hugo.ojvind.francois@gmail.com"]

WORKDIR /app

COPY ["package.json", "package-lock.json", "./"]

RUN npm install --production

COPY . .

EXPOSE 3001

CMD ["npm", "start"]