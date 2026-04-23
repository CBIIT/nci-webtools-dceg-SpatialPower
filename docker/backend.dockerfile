FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
    && dnf -y install \
    nodejs \
    npm \
    tar \
    gzip \
    geos \
    proj \
    gdal310 \
    udunits2 \
    && dnf clean all

ENV R_VER="4.5.3"
ENV PATH="/opt/R/${R_VER}/bin:${PATH}"
RUN ARCH=$(uname -m) \
    && curl -O https://cdn.posit.co/r/rhel-9/pkgs/R-${R_VER}-1-1.${ARCH}.rpm \
    && dnf install -y R-${R_VER}-1-1.${ARCH}.rpm \
    && echo 'options(repos = c(CRAN = sprintf("https://packagemanager.posit.co/cran/latest/bin/linux/rhel9-%s/%s", R.version["arch"], substr(getRversion(), 1, 3))))' \
    >> /opt/R/${R_VER}/lib/R/etc/Rprofile.site

RUN projsync --system-directory --all

RUN mkdir /server

WORKDIR /server

COPY server/install.R .
RUN Rscript install.R

COPY server/package*.json .

RUN npm install

COPY server .

CMD npm start