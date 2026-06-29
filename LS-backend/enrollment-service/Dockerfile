FROM maven:3.9.9-eclipse-temurin-21-jammy AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn package -DskipTests -B

FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    useradd --system --uid 10001 --create-home app
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
USER 10001
EXPOSE 9092
ENTRYPOINT ["java", "-jar", "app.jar"]
