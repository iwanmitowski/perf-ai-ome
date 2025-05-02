FROM maven:3.9.9-eclipse-temurin-21 AS builder
WORKDIR /app

COPY pom.xml .

COPY src/main/java/com/example/perf_agent_backend/agents/lib /app/lib

RUN for f in lib/*.jar; do \
        mvn install:install-file \
        -Dfile="$f" \
        -DgroupId=com.example.perf_agent_backend.lib \
        -DartifactId="$(basename "$f" .jar)" \
        -Dversion=1.0 \
        -Dpackaging=jar; \
    done

# now go offline (all dependencies & local‐installed jars are cached)
RUN mvn dependency:go-offline -B

COPY src ./src

RUN mvn clean package -DskipTests -B

FROM openjdk:21-slim
WORKDIR /app
COPY --from=builder /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java","-jar","app.jar"]

    