FROM centos:latest

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf config-manager --enable PowerTools \
 && dnf -y module enable nodejs:12 \
 && dnf -y install \
    nodejs \
    R \
 && dnf clean all

RUN Rscript -e "install.packages( \
    c( \
        'abind', \
        'deldir', \
        'doParallel', \
        'dotCall64', \
        'fields', \
        'foreach', \
        'goftest', \
        'iterators', \
        'jsonlite', \
        'maps', \
        'misc3d', \
        'polyclip', \
        'raster', \
        'Rcpp', \
        'sp', \
        'spam', \
        'sparr', \
        'sparrpowR', \
        'spatstat', \
        'spatstat.data', \
        'spatstat.utils', \
        'tensor' \
    ), \
    lib = .Library, \
    repos='https://cloud.r-project.org/' \
)"
