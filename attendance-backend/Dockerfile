# ──────────────────────────────────────────────
# Stage 1: Build the JAR using Maven
# ──────────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml first to cache dependency downloads
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and build (skip tests for speed)
COPY src ./src
RUN mvn package -DskipTests -q

# ──────────────────────────────────────────────
# Stage 2: Run with a lightweight JRE image
# ──────────────────────────────────────────────
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
