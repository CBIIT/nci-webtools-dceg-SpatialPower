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
    && rm -f R-${R_VER}-1-1.${ARCH}.rpm \
    && dnf clean all \
    && echo 'options(repos = c(CRAN = sprintf("https://packagemanager.posit.co/cran/'"${R_PKG_SNAPSHOT}"'/bin/linux/rhel9-%s/%s", R.version["arch"], substr(getRversion(), 1, 3))))' \
    >> /opt/R/${R_VER}/lib/R/etc/Rprofile.site

COPY server/install.R /tmp/install.R
RUN Rscript /tmp/install.R


FROM public.ecr.aws/amazonlinux/amazonlinux:2023

ARG R_VER="4.5.3"
ENV R_VER="${R_VER}"
ENV PATH="/opt/R/${R_VER}/bin:${PATH}"

# shadow-utils provides groupadd/useradd for the non-root user created below; the minimal
# AL2023 image does not ship it.
RUN dnf -y update \
    && dnf -y install \
    nodejs24 \
    nodejs24-npm \
    shadow-utils \
    tar \
    gzip \
    geos \
    proj \
    gdal310 \
    udunits2 \
    && dnf clean all

# npm is build tooling only: it runs `npm ci` below and is then removed from the image (see the
# CACHEBUST layer), because the npm shipped with the nodejs24 RPM bundles its own dependency tree
# (undici, ip-address, tar, brace-expansion, ...) that no lockfile in this repo controls and that
# image scanners report against the runtime image. The container runs `node app.js` /
# `node queue-worker.js` directly (CMD below, .github/aws/web.yml, docker-compose.deploy.yml)
# and never needs npm after the build.
# The version used for `npm ci` is still pinned (not @latest) so two builds of the same commit
# resolve the lockfile with the same npm; npm's global root is /usr/lib/nodejs24/lib/node_modules,
# the same path the RPM installs to, so this replaces that copy in place.
ARG NPM_VERSION="12.2.1"
ENV NPM_VERSION="${NPM_VERSION}"
RUN npm install -g "npm@${NPM_VERSION}"

RUN ARCH=$(uname -m) \
    && curl -O https://cdn.posit.co/r/rhel-9/pkgs/R-${R_VER}-1-1.${ARCH}.rpm \
    && dnf install -y R-${R_VER}-1-1.${ARCH}.rpm \
    && rm -f R-${R_VER}-1-1.${ARCH}.rpm \
    && dnf clean all

# The R packages built in the stage above, including the locally compiled sf. This replaces the
# library shipped with the R RPM, so it must also carry R's own base and recommended packages --
# which it does, because the builder stage installed on top of the same RPM.
COPY --from=r-builder /opt/R/${R_VER}/lib/R/library /opt/R/${R_VER}/lib/R/library
# sf ships a directory of example Dockerfiles for building sf on other distributions. They are
# documentation, never executed here, but image scanners lint every Dockerfile they find in the
# image and report ~150 findings against them. Remove them from the runtime image.
RUN rm -rf /opt/R/${R_VER}/lib/R/library/sf/docker

RUN projsync --system-directory --all

RUN mkdir /server

WORKDIR /server

COPY server/package*.json .

# npm ci installs exactly the committed lockfile (and fails if package.json drifted from it),
# so the dependency tree scanned in the repo is the one shipped in the image.
RUN npm ci

# Re-runs the base OS package upgrade from the top of this file, so that any fixes published since
# the cached layers above were built are actually applied. (`dnf upgrade` is the same operation as
# `dnf update`; the verb is chosen so Dockerfile linters do not mistake it for an apt-style
# index refresh that needs an install in the same step.)
# The deploy workflow passes a unique CACHEBUST value per run attempt, so this layer -- and only
# this layer -- is rebuilt every deploy; the expensive R and geospatial layers above stay cached
# and the application dependency tree installed above stays frozen.
# npm is removed here, after the upgrade, because an upgrade of the nodejs24-npm RPM would
# otherwise restore npm's files; the RPM is removed (nothing else requires it) and any remaining
# globally-installed copy is deleted. The final `! command -v npm` fails the build if npm is
# still reachable. Python 3.9 (present only because dnf is written in it; the app never runs it,
# and the AL2023 build carries unfixed CVEs such as CVE-2025-12781) is restricted to root here,
# after the upgrade, so an upgraded python3 RPM cannot restore the default 0755 mode. This is the
# Analysis Tools standard mitigation (same line in the pimixture, FORGE2-TF, icdgenie, APC and
# linkage images); the container runs as the non-root app user, so python is unreachable at runtime.
# The R libraries are loaded afterwards so that a soname change in geos/proj/gdal/udunits2 fails the
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
    && dnf -y upgrade \
    && dnf -y remove nodejs24-npm \
    && dnf clean all \
    && rm -rf /usr/lib/nodejs24/lib/node_modules/npm \
              /usr/lib/node_modules/npm \
              /usr/bin/npm /usr/bin/npx /usr/bin/npm-24 /usr/bin/npx-24 \
              /etc/alternatives/npm /etc/alternatives/npx \
    && chmod 700 /usr/bin/python3.9 \
    && ! command -v npm \
    && node -v | grep -qE '^v24\.' \
    && Rscript -e 'library(sf); library(terra); library(sparrpowR); library(spatstat.geom); library(jsonlite); library(testthat)'

COPY server .

COPY docker/backend-entrypoint.sh /usr/local/bin/backend-entrypoint.sh
RUN chmod +x /usr/local/bin/backend-entrypoint.sh

# Run as a non-root user. The entrypoint renders /server/config.json and creates the results
# folder, and app.js / queue-worker.js write job output under /server/results and logs under
# /server/logs, so the app user owns /server. R writes its session temp files to /tmp, which
# stays world-writable. Nothing else on the image is written at runtime.
RUN groupadd -g 1000 app && useradd -u 1000 -g 1000 -m -s /sbin/nologin app \
    && chown -R app:app /server
USER app

# Prove the python restriction holds for the runtime user: this fails the build if the app user
# can execute the system python.
RUN ! python3.9 -c 1 2>/dev/null

EXPOSE 8000

# The same image runs the web server (CMD below) and the queue worker
# (`node queue-worker.js`, see .github/aws/web.yml and docker-compose.deploy.yml). The health
# check accepts either: an answering /api/ping, or PID 1 being the queue worker (the entrypoint
# execs the command, so the node process is PID 1). ECS ignores image HEALTHCHECKs; this is for
# docker / compose, where it shows up in `docker ps`.
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD sh -c 'curl -fsS "http://localhost:${SERVER_PORT:-8000}/api/ping" >/dev/null || grep -qa queue-worker /proc/1/cmdline' || exit 1

ENTRYPOINT ["/usr/local/bin/backend-entrypoint.sh"]
CMD ["node", "app.js"]
