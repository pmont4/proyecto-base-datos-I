FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

COPY pom.xml .
RUN mvn dependency:go-offline -B

COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:21-jre-jammy

WORKDIR /deployments

RUN adduser --system --group quarkus
USER quarkus

COPY --from=builder --chown=quarkus:quarkus /app/target/quarkus-app/lib/ /deployments/lib/
COPY --from=builder --chown=quarkus:quarkus /app/target/quarkus-app/*.jar /deployments/
COPY --from=builder --chown=quarkus:quarkus /app/target/quarkus-app/app/ /deployments/app/
COPY --from=builder --chown=quarkus:quarkus /app/target/quarkus-app/quarkus/ /deployments/quarkus/

ENV JAVA_OPTS="-Djava.util.logging.manager=org.jboss.logmanager.LogManager"

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "quarkus-run.jar"]