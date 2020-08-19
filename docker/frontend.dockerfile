FROM centos:latest

RUN yum -y --setopt=tsflags=nodocs update && \
    yum -y --setopt=tsflags=nodocs install httpd && \
    yum clean all

EXPOSE 80
EXPOSE 443

# Simple startup script to avoid some issues observed with container restart
ADD docker/run-httpd.sh /run-httpd.sh
RUN chmod -v +x /run-httpd.sh

# Add custom httpd configuration
ADD docker/spatial-power.conf /etc/httpd/conf.d/spatial-power.conf

CMD ["/run-httpd.sh"]