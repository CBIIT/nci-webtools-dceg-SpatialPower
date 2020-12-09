ARG BASE_IMAGE=spatial-power:base

FROM ${BASE_IMAGE}

ARG SPARRPOWR_TAG=CBIIT

RUN Rscript -e "remotes::install_github('spatstat/spatstat.core', ref='v1.65-0')"

COPY . /deploy

# install version of sparrpowR specified by tag
RUN Rscript -e "remotes::install_github('machiela-lab/sparrpowR', ref='$SPARRPOWR_TAG')"

WORKDIR /deploy

RUN npm install

CMD npm start
