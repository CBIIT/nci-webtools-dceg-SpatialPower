# Stage 0 - Build Client
FROM centos:latest

RUN dnf -y update \
 && dnf -y install glibc-langpack-en \
 && dnf -y module enable nodejs:12 \
 && dnf -y install nodejs \
 && dnf clean all

COPY client /client

WORKDIR /client

RUN npm install \
 && npm run build

# Stage 1 - Copy static assets
FROM centos:latest

RUN dnf -y --setopt=tsflags=nodocs update && \
    dnf -y --setopt=tsflags=nodocs install httpd && \
    dnf clean all

COPY --from=0 /client/build /var/www/html/spatial-power

RUN chmod 644 -R /var/www/html/spatial-power

# Simple startup script to avoid some issues observed with container restart
RUN echo -e '#!/bin/bash \n\
rm -rf /run/httpd/* /tmp/httpd* \n\
exec /usr/sbin/apachectl -DFOREGROUND' > /run-httpd.sh
RUN chmod +x /run-httpd.sh

# Add custom httpd configuration
ADD docker/frontend.conf /etc/httpd/conf.d/frontend.conf

EXPOSE 80
EXPOSE 443

CMD ["/run-httpd.sh"]