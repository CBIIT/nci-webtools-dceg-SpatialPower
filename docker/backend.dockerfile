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
# for most of the image scan findings. npm's global root is /usr/lib/nodejs24/lib/node_modules,
# the same path the RPM installs to, so this replaces that copy in place. It clears the tar and
# brace-expansion findings; the remaining ip-address and undici ones are still unpatched in the
# latest npm and are covered by a scan waiver.
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

COPY server .

COPY docker/backend-entrypoint.sh /usr/local/bin/backend-entrypoint.sh
RUN chmod +x /usr/local/bin/backend-entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/usr/local/bin/backend-entrypoint.sh"]
CMD ["npm", "start"]
