FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
    && dnf -y install \
    gcc-c++ \
    make \ 
    jq \
    jq-devel \
    libcurl-devel \
    libtiff-devel \
    nodejs \
    npm \
    protobuf-devel \
    # R-4.1.3 \
    tar \
    gzip \
    v8-devel \
    expat-devel \
    geos \
    geos-devel \
    proj \
    gdal310 \
    udunits2 \
    udunits2-devel \
    && dnf clean all

ENV R_VER="4.5.3"
ENV PATH="/opt/R/${R_VER}/bin:${PATH}"
RUN ARCH=$(uname -m) \
    && curl -O https://cdn.posit.co/r/rhel-9/pkgs/R-${R_VER}-1-1.${ARCH}.rpm \
    && dnf install -y R-${R_VER}-1-1.${ARCH}.rpm \
    && echo 'options(repos = c(CRAN = sprintf("https://packagemanager.posit.co/cran/latest/bin/linux/rhel9-%s/%s", R.version["arch"], substr(getRversion(), 1, 3))))' \
    >> /opt/R/${R_VER}/lib/R/etc/Rprofile.site

# ENV GEOS_VERSION=3.11.0
# RUN cd /tmp \
#  && curl -L https://github.com/libgeos/geos/releases/download/$GEOS_VERSION/geos-$GEOS_VERSION.tar.bz2 | tar xj \
#  && cd geos-$GEOS_VERSION \
#  && mkdir -p build \
#  && cd build \
#  && cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr .. \
#  && cmake --build . --target install

# ENV PROJ_VERSION=9.1.0
# RUN cd /tmp \
#  && curl -L https://github.com/OSGeo/PROJ/releases/download/$PROJ_VERSION/proj-$PROJ_VERSION.tar.gz | tar xz \
#  && cd proj-$PROJ_VERSION \
#  && mkdir -p build \
#  && cd build \
#  && cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr .. \
#  && cmake --build . --target install

# ENV GDAL_VERSION=3.5.2
# RUN cd /tmp \
#  && curl -L https://github.com/OSGeo/gdal/releases/download/v$GDAL_VERSION/gdal-$GDAL_VERSION.tar.gz | tar xz \
#  && cd gdal-$GDAL_VERSION \
#  && mkdir -p build \
#  && cd build \
#  && cmake -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/usr .. \
#  && cmake --build . --target install

# ENV UDUNITS2_VERSION=2.2.28
# RUN cd /tmp \
#  && curl -L -o udunits.tar.gz https://downloads.unidata.ucar.edu/udunits/${UDUNITS2_VERSION}/udunits-${UDUNITS2_VERSION}.tar.gz \
#  && tar xzf udunits.tar.gz \
#  && cd udunits-${UDUNITS2_VERSION} \
#  && ./configure --prefix=/usr \
#  && make install

RUN projsync --system-directory --all

RUN mkdir /server

WORKDIR /server


# COPY server/app.R .
# COPY server/renv.lock .
# COPY server/.Rprofile .
# COPY server/renv/activate.R ./renv/
# COPY server/renv/settings.dcf ./renv/

ENV R_REMOTES_NO_ERRORS_FROM_WARNINGS="true"

ENV DOWNLOAD_STATIC_LIBV8=1

COPY server/install.R .
RUN Rscript install.R

# CMD sleep infinity

# RUN R -e "\
#     options(Ncpus=parallel::detectCores()); \
#     renv.config.repos.override = 'https://packagemanager.posit.co/cran/__linux__/rhel9/latest', \
#     renv::restore();"

# # install version of sparrpowR specified by tag or commmit id (preferred, to avoid build cache)
# ARG SPARRPOWR_TAG=v0.2.5

# RUN Rscript -e "renv::install('machiela-lab/sparrpowR@$SPARRPOWR_TAG')"

COPY server/package*.json .

RUN npm install

COPY server .

CMD npm start