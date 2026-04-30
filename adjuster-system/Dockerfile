# 빌드 단계
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Gradle wrapper와 빌드 스크립트 먼저 복사 (의존성 캐시 효율 ↑)
COPY gradlew .
COPY gradle gradle
COPY settings.gradle build.gradle ./
RUN chmod +x gradlew && ./gradlew --version --no-daemon

# 소스 복사 후 빌드
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# 실행 단계
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Railway는 PORT 환경변수를 주입하므로 8080은 기본값
EXPOSE 8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
