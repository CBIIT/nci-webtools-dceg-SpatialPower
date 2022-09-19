FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    bzip2 \
    cmake \
    diffutils \
    gcc-c++ \
    httpd \
    jq \
    jq-devel \
    libcurl-devel \
    libtiff-devel \
    make \
    nodejs \
    npm \
    protobuf-devel \
    python3 \
    python3-devel \
    python3-setuptools \
    R \
    sqlite \
    sqlite-devel \
    tar \
    v8-devel \
    wget \
    expat-devel \
 && dnf clean all

ENV GEOS_VERSION=3.11.0
RUN cd /tmp \
 && curl -L https://github.com/libgeos/geos/releases/download/$GEOS_VERSION/geos-$GEOS_VERSION.tar.bz2 | tar xj \
 && cd geos-$GEOS_VERSION \
 && mkdir -p build \
 && cd build \
 && cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr .. \
 && cmake --build . --target install

ENV PROJ_VERSION=9.1.0
RUN cd /tmp \
 && curl -L https://github.com/OSGeo/PROJ/releases/download/$PROJ_VERSION/proj-$PROJ_VERSION.tar.gz | tar xz \
 && cd proj-$PROJ_VERSION \
 && mkdir -p build \
 && cd build \
 && cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr .. \
 && cmake --build . --target install
 
ENV GDAL_VERSION=3.5.2
RUN cd /tmp \
 && curl -L https://github.com/OSGeo/gdal/releases/download/v$GDAL_VERSION/gdal-$GDAL_VERSION.tar.gz | tar xz \
 && cd gdal-$GDAL_VERSION \
 && mkdir -p build \
 && cd build \
 && cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr .. \
 && cmake --build . --target install

ENV UDUNITS2_VERION=2.2.28
RUN cd /tmp \
 && curl -L https://artifacts.unidata.ucar.edu/repository/downloads-udunits/${UDUNITS2_VERION}/udunits-${UDUNITS2_VERION}.tar.gz | tar xz \
 && cd udunits-${UDUNITS2_VERION} \
 && ./configure --prefix=/usr \
 && make install

RUN projsync --system-directory --all

RUN mkdir /server

WORKDIR /server

COPY server/renv.lock .

ENV R_REMOTES_NO_ERRORS_FROM_WARNINGS="true"

ENV DOWNLOAD_STATIC_LIBV8=1

RUN R -e "\
    options(Ncpus=parallel::detectCores()); \
    install.packages('renv', repos = 'https://cloud.r-project.org/'); \
    renv::restore();"

# install version of sparrpowR specified by tag or commmit id (preferred, to avoid build cache)
ARG SPARRPOWR_TAG=master

RUN Rscript -e "remotes::install_github('machiela-lab/sparrpowR', ref='$SPARRPOWR_TAG')"

COPY server/package*.json .

RUN npm install

COPY server .

CMD npm start