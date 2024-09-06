# Weather API Intermediary

## Descripción del Proyecto

Este proyecto es una API web desarrollada en typescript que actúa como un intermediario entre los clientes y la API de Open-Meteo. La API proporciona datos meteorológicos simplificados y ofrece funcionalidades como almacenamiento en base de datos SQL (MariaDB), generación de claves API, rate limiting y caché, todo ello contenerizado utilizando Docker.

## Tabla de Contenidos

- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Estructura de la Base de Datos](#estructura-de-la-base-de-datos)
- [Uso](#uso)
- [Documentación de la API](#documentación-de-la-api)
- [Consideraciones Técnicas](#consideraciones-técnicas)

## Requisitos

- Docker y Docker Compose
- Node.js
- Prisma ORM
- Redis
- Open-Meteo API Key

## Instalación

1. **Clonar el Repositorio:**

   ```bash
   git clone https://github.com/MorgensternMA/ClimaApp.git
   
2. **Clonar el Repositorio:**

   ```bash
   npm i

3. **Configura el entorno**

   ```.env
   DATABASE_URL="mysql://root:bdSe098x7I@localhost:3306/weather_db"

4. **Construir y ejecutar los contenedores**

   ```bash
   docker-compose up --build -d


## Configuración

Debes asegurarte de que los servicios de Docker están funcionando correctamente. La configuración se realiza a través del archivo .env para especificar las credenciales y configuraciones necesarias para la base de datos.

## Estructura de la base de datos

La base de datos se compone de los siguientes modelos:

+ **api_key**: Almacena las claves API.
+ **weather_request**: Almacena las solicitudes realizadas con claves API o IP, incluyendo detalles de solicitud y respuesta.
+ **log**: Registra los logs de las interacciones.
+ **cache**: Almacena respuestas en caché con tiempos de expiración.

## Uso

Una vez la API esté en funcionamiento podes realizar solicitudes a la API para obtener datos meteorológicos simplificados.

## Documentación de la API

La documentación completa de la API está disponible en docs/api.md. Ahí vas a encontrar detalles sobre los endpoints, parámetros y ejemplos de solicitudes y respuestas.

## Consideraciones técnicas

+ **Rate Limiting**: La API cuenta con limitación de velocidad para evitar abuso de ella.
+ **Caching**: Respuestas de la API se almacenan en caché para optimizar el rendimiento.