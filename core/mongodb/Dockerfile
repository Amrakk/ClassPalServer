FROM mongo:noble

COPY init-mongo.js /init-mongo.js
COPY init-mongo.sh /init-mongo.sh

RUN tr -d '\r' < /init-mongo.sh > /init-mongo.temp.sh && \
    mv /init-mongo.temp.sh /init-mongo.sh && \
    chmod +x /init-mongo.sh

CMD ["/bin/sh", "-c", "/init-mongo.sh"]
