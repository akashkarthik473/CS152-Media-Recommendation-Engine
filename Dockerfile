FROM node:24-slim

WORKDIR /app

COPY RecFinder/package.json RecFinder/package-lock.json ./

RUN npm install

COPY RecFinder/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
