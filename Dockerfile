FROM postgres:15
ENV POSTGRES_USER=postgres
ENV POSTGRES_PASSWORD=password
ENV POSTGRES_DB=project_db
COPY init.sql /docker-entrypoint-initdb.d/
EXPOSE 5432