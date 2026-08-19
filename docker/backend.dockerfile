FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
    && dnf -y install \
    nodejs24 \
    nodejs24-npm \
    tar \
    gzip \
    geos \
    proj \
    gdal310 \
    udunits2 \
    && dnf clean all

# The npm shipped with the nodejs24 RPM bundles its own vulnerable dependencies, which account
# for most of the remaining image scan findings. npm's global root is
# /usr/lib/nodejs24/lib/node_modules, the same path the RPM installs to, so this replaces that
# copy in place. The ip-address, tar and brace-expansion findings that remain afterwards are
# still unpatched in the latest npm and are covered by a scan waiver.
RUN npm install -g npm@latest && npm update -g

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

# Re-runs the base OS package update from the top of this file, so that any fixes published since
# the cached layers above were built are actually applied.
# The deploy workflow passes a unique CACHEBUST value per run attempt, so this layer -- and only
# this layer -- is rebuilt every deploy; the expensive R and geospatial layers above stay cached
# and the application dependency tree installed above stays frozen. The global npm upgrade is
# repeated here because updating the nodejs24-npm RPM restores its own bundled npm over the
# global root, which would otherwise revert the upgrade performed earlier in this file. The R
# libraries are loaded afterwards so that a soname change in geos/proj/gdal/udunits2 fails the
# build here, rather than at container start, since the compiled R packages above are not rebuilt.
# sf is deliberately excluded from that check: its Posit binary build links libgdal.so.30 on both
# x86_64 and aarch64 while this image ships gdal310-libs (libgdal.so.36), so it cannot load on any
# architecture. That mismatch predates this change and is tracked separately -- do not add sf here
# until it is fixed.
ARG CACHEBUST=0
RUN echo "cachebust=${CACHEBUST}" \
    && dnf -y update \
    && dnf clean all \
    && npm install -g npm@latest \
    && npm update -g \
    && Rscript -e 'library(terra); library(sparrpowR); library(spatstat.geom)'

COPY server .

COPY docker/backend-entrypoint.sh /usr/local/bin/backend-entrypoint.sh
RUN chmod +x /usr/local/bin/backend-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/backend-entrypoint.sh"]
CMD ["npm", "start"]
