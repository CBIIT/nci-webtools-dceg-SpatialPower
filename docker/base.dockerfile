FROM centos:latest

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
&& dnf config-manager --enable PowerTools \
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

RUN Rscript -e "install.packages('remotes', lib = .Library, repos='https://cloud.r-project.org')"

RUN Rscript -e "remotes::install_github(c('spatstat/spatstat.core', 'machiela-lab/sparrpowR'))"

RUN Rscript -e "install.packages(c('geojsonio', 'jsonlite', 'rgdal', 'tibble'), repos='https://cloud.r-project.org/')"
