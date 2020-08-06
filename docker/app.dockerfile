FROM cbiitss/spatial-power:base

COPY . /deploy

WORKDIR /deploy

RUN npm install \
 && cd client \
 && npm install \
 && npm run build

CMD npm start
