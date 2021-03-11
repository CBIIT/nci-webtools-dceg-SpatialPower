# Stage 1 - Copy static assets
FROM centos:latest

RUN dnf -y update \
 && dnf -y install \
    dnf-plugins-core \
    epel-release \
    glibc-langpack-en \
 && dnf -y module enable nodejs:14 \
 && dnf -y install \
    gcc-c++ \
    httpd \
    make \
    nodejs \
 && dnf clean all

# Add custom httpd configuration
COPY docker/spatial-power.conf /etc/httpd/conf.d/spatial-power.conf

RUN mkdir /client

WORKDIR /client

COPY client/package*.json /client/

RUN npm install

COPY client /client/

RUN npm run build \
 && mv /client/build /var/www/html/spatial-power

WORKDIR /var/www/html

RUN touch index.html && chown apache:apache index.html

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/apachectl -DFOREGROUND