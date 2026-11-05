# ---- build stage: compile the React app (build-only deps stay here) ----
FROM public.ecr.aws/amazonlinux/amazonlinux:2023 AS build

RUN dnf -y update \
 && dnf -y install \
    nodejs24 \
    nodejs24-npm \
 && dnf clean all

WORKDIR /client

COPY client/package*.json /client/

RUN npm ci

COPY client /client/

RUN npm run build

# ---- runtime stage: httpd serving the static build only (no node_modules/npm) ----
FROM public.ecr.aws/amazonlinux/amazonlinux:2023

# Python 3.9 is present only because dnf is written in it; httpd never runs it, and the AL2023
# build carries unfixed CVEs such as CVE-2025-12781. Restrict it to root, the Analysis Tools
# standard mitigation (same line in the pimixture, FORGE2-TF, icdgenie, APC and linkage images).
RUN dnf -y update \
 && dnf -y install httpd \
 && dnf clean all \
 && chmod 700 /usr/bin/python3.9

# Copy only the compiled static assets — build tooling never reaches the runtime
# image, removing every build-time npm CVE (rollup, webpack, babel, etc.).
COPY --from=build /client/build /var/www/html/spatial-power

WORKDIR /var/www/html

# Add custom httpd configuration
COPY docker/httpd-spatial-power.conf /etc/httpd/conf.d/httpd-spatial-power.conf

RUN touch index.html && chown apache:apache index.html

EXPOSE 80
EXPOSE 443

# httpd must bind port 80 (the ALB target group and .github/aws/web.yml expose 80), so the master
# process stays root; httpd itself drops its worker processes to the 'apache' user. A non-root
# master would mean listening above 1024 and changing the task definition, which is a deployment
# change rather than an image one.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -fsS http://localhost/spatial-power/ >/dev/null || exit 1

CMD rm -rf /run/httpd/* /tmp/httpd* \
 && exec /usr/sbin/httpd -DFOREGROUND
