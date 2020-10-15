ARG BASE_IMAGE=spatial-power:base

FROM ${BASE_IMAGE}

ARG SPARRPOWR_TAG

RUN RScript -e "install.packages(c('geojsonio', 'tibble'), repos='https://cloud.r-project.org/')"

COPY . /deploy

# always install latest version of spatstat.core
RUN Rscript -e "remotes::install_github('spatstat/spatstat.core')"

# install version of sparrpowR specified by tag
RUN Rscript -e "remotes::install_github('machiela-lab/sparrpowR', ref='$SPARRPOWR_TAG')"

WORKDIR /deploy

RUN npm install

CMD npm start
