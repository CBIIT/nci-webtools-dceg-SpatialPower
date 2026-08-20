# The R library is built in a separate stage so that the -devel headers required to compile sf
# from source stay out of the runtime image and off its vulnerability scan surface. This keeps
# the runtime image's OS package set identical to what it was before sf was built from source
# (gcc, gcc-c++ and make are unavoidable there either way -- they are dependencies of the Posit
# R RPM). Only the finished R library directory is copied forward; it needs nothing but the
# geospatial runtime libraries, which the final stage installs.
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS r-builder

ARG R_VER="4.5.3"
# Pin the Posit Package Manager snapshot. The URL previously used PPM's rolling "latest" alias,
# which meant the installed R package versions were determined by the date this layer happened
# to be rebuilt, and were held stable only by the Docker layer cache. Any edit to a layer above
# invalidated that cache and silently swapped the whole R tree -- which is exactly how an sf
# binary linked against a GDAL this image does not ship got installed, breaking every GIS
# request. Bump this date deliberately to take R package updates.
ARG R_PKG_SNAPSHOT="2026-08-19"
ENV R_PKG_SNAPSHOT="${R_PKG_SNAPSHOT}"
ENV PATH="/opt/R/${R_VER}/bin:${PATH}"

RUN dnf -y update \
    && dnf -y install \
    tar \
    gzip \
    geos \
    proj \
    gdal310 \
    udunits2 \
    gcc \
    gcc-c++ \
    make \
    geos-devel \
    proj-devel \
    gdal310-devel \
    sqlite-devel \
    udunits2-devel \
    && dnf clean all

# Amazon Linux 2023 installs GDAL's config script as gdal310-config, and on biarch systems that
# name is a multilib wrapper which invokes a gdal-config-64 that the distribution never ships, so
# it always exits 127. sf's configure script only looks for a plain "gdal-config", so point that
# name at whichever of the two actually works.
RUN if /usr/bin/gdal310-config-64 --version > /dev/null 2>&1; then \
        ln -sf /usr/bin/gdal310-config-64 /usr/local/bin/gdal-config; \
    else \
        ln -sf /usr/bin/gdal310-config /usr/local/bin/gdal-config; \
    fi \
    && gdal-config --version

RUN ARCH=$(uname -m) \
    && curl -O https://cdn.posit.co/r/rhel-9/pkgs/R-${R_VER}-1-1.${ARCH}.rpm \
    && dnf install -y R-${R_VER}-1-1.${ARCH}.rpm \
    && echo 'options(repos = c(CRAN = sprintf("https://packagemanager.posit.co/cran/'"${R_PKG_SNAPSHOT}"'/bin/linux/rhel9-%s/%s", R.version["arch"], substr(getRversion(), 1, 3))))' \
    >> /opt/R/${R_VER}/lib/R/etc/Rprofile.site

COPY server/install.R /tmp/install.R
RUN Rscript /tmp/install.R


FROM public.ecr.aws/amazonlinux/amazonlinux:2023

ARG R_VER="4.5.3"
ENV R_VER="${R_VER}"
ENV PATH="/opt/R/${R_VER}/bin:${PATH}"

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

RUN ARCH=$(uname -m) \
    && curl -O https://cdn.posit.co/r/rhel-9/pkgs/R-${R_VER}-1-1.${ARCH}.rpm \
    && dnf install -y R-${R_VER}-1-1.${ARCH}.rpm \
    && rm -f R-${R_VER}-1-1.${ARCH}.rpm

# The R packages built in the stage above, including the locally compiled sf. This replaces the
# library shipped with the R RPM, so it must also carry R's own base and recommended packages --
# which it does, because the builder stage installed on top of the same RPM.
COPY --from=r-builder /opt/R/${R_VER}/lib/R/library /opt/R/${R_VER}/lib/R/library

RUN projsync --system-directory --all

RUN mkdir /server

WORKDIR /server

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
# This check also guards the stage boundary: it is what proves the library copied out of the
# builder can actually load against the runtime image's geospatial libraries.
# sf is included on purpose: it is the package most sensitive to a GDAL soname change, and
# omitting it previously allowed an image whose sf could not load to build and deploy
# successfully, with the failure only surfacing when a user ran a GIS job. jsonlite and testthat
# are checked because they are used on the request path but link nothing, so nothing else would
# catch them going missing.
ARG CACHEBUST=0
RUN echo "cachebust=${CACHEBUST}" \
    && dnf -y update \
    && dnf clean all \
    && npm install -g npm@latest \
    && npm update -g \
    && Rscript -e 'library(sf); library(terra); library(sparrpowR); library(spatstat.geom); library(jsonlite); library(testthat)'

COPY server .

COPY docker/backend-entrypoint.sh /usr/local/bin/backend-entrypoint.sh
RUN chmod +x /usr/local/bin/backend-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/backend-entrypoint.sh"]
CMD ["npm", "start"]
