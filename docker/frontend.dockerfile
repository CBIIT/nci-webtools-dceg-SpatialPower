FROM public.ecr.aws/amazonlinux/amazonlinux:2022

RUN dnf -y update \
 && dnf -y install \
    gcc-c++ \
    httpd \
    make \
    nodejs \
    npm \
 && dnf clean all

RUN mkdir /client

WORKDIR /client

COPY client/package*.json /client/

RUN npm install

COPY client /client/

RUN npm run build \
 && mv /client/build /var/www/html/spatial-power

WORKDIR /var/www/html

# Add custom httpd configuration
COPY docker/httpd-spatial-power.conf /etc/httpd/conf.d/httpd-spatial-power.conf

RUN touch index.html && chown apache:apache index.html

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND