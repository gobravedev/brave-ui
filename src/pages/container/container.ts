export const containerData = [
    {
        "name": "datascience-notebook",
        "image": "registry.cn-hangzhou.aliyuncs.com/wybioinfo/datascience-notebook:x86_64-ubuntu-22.04",
        "description": "biobakery/maaslin2:1.3.0",
        "envionment": {
            "NB_UID": "$USERID"
        },
        "command": "start.sh jupyter notebook --NotebookApp.password='' --NotebookApp.token=''  --notebook-dir=$SCRIPT_DIR --NotebookApp.base_url='/$URL_PREFIX' ",
        "labels": {
            "traefik.enable": "true",
            "traefik.http.routers.$CONTAINER_NAME.rule": "PathPrefix(`/$URL_PREFIX`)",
            "traefik.http.routers.$CONTAINER_NAME.entrypoints": "web",
            "traefik.http.services.$CONTAINER_NAME.loadbalancer.server.port": "8888"
        },
        "port": "8888",
        "change_uid": false
    }, {
        "name": "code-server",
        "image": "linuxserver/code-server:4.104.3",
        "description": null,
        "envionment": { "PUID": "$USERID", "PGID": "$DOCKER_GROUPID" },
        "command": null,
        "labels": {
            "traefik.enable": "true",
            "traefik.http.routers.$CONTAINER_NAME.rule": "PathPrefix(`/$URL_PREFIX`)",
            "traefik.http.routers.$CONTAINER_NAME.entrypoints": "web",
            "traefik.http.services.$CONTAINER_NAME.loadbalancer.server.port": "8443",
            "traefik.http.middlewares.$CONTAINER_NAME-strip.stripPrefix.prefixes": "/$URL_PREFIX",
            "traefik.http.routers.$CONTAINER_NAME.middlewares": "$CONTAINER_NAME-strip"
        },
        "port": "8443",
        "change_uid": false
    }, {
        "name": "rstudio",
        "image": "registry.cn-hangzhou.aliyuncs.com/wybioinfo/maaslin2:1.22",
        "description": "https://rocker-project.org/images/versioned/rstudio.html\nhttps://www.bioconductor.org/help/docker/\nhttps://hub.docker.com/r/bioconductor/tidyverse/tags",
        "envionment": {
            "DISABLE_AUTH": true,
            "USERID": "$USERID",
            "GROUPID": "$GROUPID",
            "R_USER_WORKDIR": "$OUTPUT_DIR",
            "R_SCRIPT": "$SCRIPT_FILE"
        },
        "command": "/init",
        "labels": {
            "traefik.enable": "true",
            "traefik.http.routers.$CONTAINER_NAME.rule": "PathPrefix(`/$URL_PREFIX`)",
            "traefik.http.routers.$CONTAINER_NAME.entrypoints": "web",
            "traefik.http.services.$CONTAINER_NAME.loadbalancer.server.port": "8787",
            "traefik.http.middlewares.$CONTAINER_NAME-strip.stripPrefix.prefixes": "/$URL_PREFIX",
            "traefik.http.middlewares.$CONTAINER_NAME-strip.stripPrefix.forceSlash": "false",
            "traefik.http.middlewares.$CONTAINER_NAME-server-root-path-header.headers.customrequestheaders.X-RStudio-Root-Path": "/$URL_PREFIX",
            "traefik.http.routers.$CONTAINER_NAME.middlewares": "$CONTAINER_NAME-strip,$CONTAINER_NAME-server-root-path-header"
        },
        "port": "8787",
        "change_uid": false
    } ,{
        "name": "code-server-nextflow",
        "image": "registry.cn-hangzhou.aliyuncs.com/wybioinfo/code-server-nextflow",
        "description": null,
        "envionment": { "PUID": "$USERID", "PGID": "$DOCKER_GROUPID" },
        "command": null,
        "labels": {
            "traefik.enable": "true",
            "traefik.http.routers.$CONTAINER_NAME.rule": "PathPrefix(`/$URL_PREFIX`)",
            "traefik.http.routers.$CONTAINER_NAME.entrypoints": "web",
            "traefik.http.services.$CONTAINER_NAME.loadbalancer.server.port": "8443",
            "traefik.http.middlewares.$CONTAINER_NAME-strip.stripPrefix.prefixes": "/$URL_PREFIX",
            "traefik.http.routers.$CONTAINER_NAME.middlewares": "$CONTAINER_NAME-strip"
        },
        "port": "8443",
        "change_uid": false
    }
]