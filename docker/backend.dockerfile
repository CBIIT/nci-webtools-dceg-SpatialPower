ARG BASE_REPOSITORY=spatial-power
ARG BASE_TAG=base

FROM ${BASE_REPOSITORY}:${BASE_TAG}

ARG UPDATE_SPARRPOWR

RUN [[ "$UPDATE_SPARRPOWR" = "true" ]] && Rscript -e "remotes::install_github(c('spatstat/spatstat.core', 'machiela-lab/sparrpowR'))" || true

COPY . /deploy

WORKDIR /deploy

RUN npm install

CMD npm start
