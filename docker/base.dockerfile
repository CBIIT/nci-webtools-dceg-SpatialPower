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

RUN Rscript -e "install.packages('remotes', lib = .Library, repos='https://cloud.r-project.org')"

RUN Rscript -e "remotes::install_github(c('spatstat/spatstat.core', 'machiela-lab/sparrpowR'))"
