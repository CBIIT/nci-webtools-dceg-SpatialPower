# ---- build stage: compile the React app (build-only deps stay here) ----
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS build

RUN dnf -y update \
 && dnf -y install \
    nodejs24 \
    nodejs24-npm \
 && dnf clean all

WORKDIR /client

COPY client/package*.json /client/

RUN npm install

COPY client /client/

RUN npm run build

# ---- runtime stage: httpd serving the static build only (no node_modules/npm) ----
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

RUN dnf -y update \
 && dnf -y install httpd \
 && dnf clean all

# Copy only the compiled static assets — build tooling never reaches the runtime
# image, removing every build-time npm CVE (rollup, webpack, babel, etc.).
COPY --from=build /client/build /var/www/html/spatial-power

WORKDIR /var/www/html

# Add custom httpd configuration
COPY docker/httpd-spatial-power.conf /etc/httpd/conf.d/httpd-spatial-power.conf

RUN touch index.html && chown apache:apache index.html

EXPOSE 80
EXPOSE 443

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND
