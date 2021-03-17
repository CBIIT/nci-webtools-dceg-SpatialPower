# example build command (from repository root)
# docker build -t spatial-power:backend -f docker/backend.dockerfile --build-args SPARRPOWR_TAG=CBIIT .
FROM centos:8.3.2011

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf config-manager --set-enabled powertools \
 && dnf -y module enable nodejs:13 \
 && dnf -y install \
    nodejs \
    R \
    gdal-devel \
    geos \
    geos-devel \
    libcurl-devel \
    proj-devel \
    protobuf-devel \
    sqlite-devel \
    udunits2-devel \
    v8-devel \
    https://download.fedoraproject.org/pub/epel/7/x86_64/Packages/j/jq-1.6-2.el7.x86_64.rpm \
    https://download.fedoraproject.org/pub/epel/7/x86_64/Packages/j/jq-devel-1.6-2.el7.x86_64.rpm \
 && dnf clean all

ENV R_REMOTES_NO_ERRORS_FROM_WARNINGS="true"

# install sparrpowR dependencies
RUN Rscript -e "install.packages(c(\
    'geojsonio', \
    'jsonlite', \
    'remotes', \
    'rgdal', \
    'spatstat.data', \
    'spatstat.geom', \
    'spatstat.utils', \
    'spatstat.core', \
    'tibble'\
), repos='https://cloud.r-project.org/')"

# do not remove this line: this is to ensure that all sparrpowR dependencies are installed and cached at the time of the initial build
# this should rarely change, as the ref should be set to the tag associated with the latest production release
RUN Rscript -e "remotes::install_github('machiela-lab/sparrpowR', ref='SpatialPower-0.0.0')" 

# install version of sparrpowR specified by tag or commmit id (preferred)
ARG SPARRPOWR_TAG=CBIIT

# although SPARRPOWR_TAG is assigned a tag name by default, it should be passed in as a specific commit hash
# to avoid erroneous build cache hits due to reusing the same command string
RUN Rscript -e "remotes::install_github('machiela-lab/sparrpowR', ref='$SPARRPOWR_TAG')"

RUN mkdir /deploy

COPY package*.json /deploy

WORKDIR /deploy

RUN npm install

COPY . /deploy

CMD npm start




