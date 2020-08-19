ARG BASE_IMAGE=spatial-power:base

FROM ${BASE_IMAGE}

ARG UPDATE_SPARRPOWR

RUN [[ "$UPDATE_SPARRPOWR" = "true" ]] && Rscript -e "remotes::install_github(c('spatstat/spatstat.core', 'machiela-lab/sparrpowR'))" || true

COPY . /deploy

WORKDIR /deploy

RUN npm install

CMD npm start
