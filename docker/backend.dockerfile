ARG BASE_IMAGE=spatial-power:base

FROM ${BASE_IMAGE}

ARG SPARRPOWR_TAG

# todo: move these into the base dockerfile once dependencies are finalized
RUN yum -y module reset nodejs
RUN yum -y module enable nodejs:13
RUN yum -y install udunits2-devel geos geos-devel libcurl-devel protobuf-devel gdal-devel v8-devel proj-devel sqlite-devel
RUN yum -y install https://download.fedoraproject.org/pub/epel/7/x86_64/Packages/j/jq-1.6-2.el7.x86_64.rpm
RUN yum -y install https://download.fedoraproject.org/pub/epel/7/x86_64/Packages/j/jq-devel-1.6-2.el7.x86_64.rpm

RUN Rscript -e "install.packages(c('geojsonio', 'tibble'), repos='https://cloud.r-project.org/')"

COPY . /deploy

# always install latest version of spatstat.core
RUN Rscript -e "remotes::install_github('spatstat/spatstat.core')"

# install version of sparrpowR specified by tag
RUN Rscript -e "remotes::install_github('machiela-lab/sparrpowR', ref='$SPARRPOWR_TAG')"

WORKDIR /deploy

RUN npm install

CMD npm start
