# Documentación de la API

## Introducción

Esta API proporciona información meteorológica detallada, incluyendo datos diarios y horarios para fechas específicas. También permite la creación y gestión de claves API para acceder a los datos.

## Tabla de Contenidos

- [Introducción](#introducción)
- [Rate Limit](#rate-Limit)
- [Caché de respuestas](#caché-de-respuestas)
- [Simplificación de los datos](#simplificación-de-los-datos)
- [Endpoints](#endpoints)
- [Autenticación](#autenticación)


## Rate Limit
El rate limiter ayuda a evitar que los usuarios hagan demasiadas solicitudes en un corto período de tiempo, protegiendo así el servicio contra abusos. En esta implementación, se está utilizando Redis para llevar un control sobre la cantidad de solicitudes realizadas por una clave API o la IP del usuario. 
En este caso se Utiliza Redis para contar y limitar el número de solicitudes de un cliente. Si el número de intentos supera un límite específico por segundo (dos en este caso), se bloquea al cliente.


## Caché de respuestas
El caché se utiliza para almacenar y recuperar datos para evitar solicitudes repetidas a la API y mejorar el rendimiento de la aplicación. Se está utilizando tanto Redis para almacenar los datos en caché como una base de datos SQL para guardar las solicitudes de clima y sus respuestas.
En este caso se guarda las respuestas del API en una base de datos para reducir las solicitudes repetidas. Si los datos están en caché y no han expirado, se devuelven los datos en lugar de realizar una nueva solicitud a la API externa.

## Simplificación de los datos
La API realizada simplifica los datos recibidos de la siguiente manera:
Se recibe del API externo datos con la siguiente estructura:
```json
export interface WeatherData {
    latitude: number;
    longitude: number;
    generationtime_ms: number;
    utc_offset_seconds: number;
    timezone: string;
    timezone_abbreviation: string;
    elevation: number;
    hourly_units: {
        time: string;
        temperature_2m: string;
        precipitation_probability: string;
        wind_speed_10m: string;
        soil_moisture_1_to_3cm: string;
    };
    hourly: {
        time: string[];
        temperature_2m: number[];
        precipitation_probability: number[];
        wind_speed_10m: number[];
        soil_moisture_1_to_3cm: number[];
    };
    daily_units: {
        time: string;
        temperature_2m_max: string;
        temperature_2m_min: string;
        daylight_duration: string;
    };
    daily: {
        time: string[];
        temperature_2m_max: number[];
        temperature_2m_min: number[];
        daylight_duration: number[];
    };
}
```
En donde se puede observar que los datos de temperatura; por ejemplo, están todos en un array, distinto del array que muestra la hora a la que hace referencia. Además, no se hace distinción por día; es decir, en **time** se coloca tanto la hora como el día.

La simplificación se realiza al discriminar los datos por día y también por hora, de la siguiente manera:

```json
export interface WeatherResult {
    [date: string]: {
        daily: {
            temperature_2m_max: number;
            temperature_2m_min: number;
            daylight_duration: number;
        };
        hourly: {
            [hour: string]: {
                temperature_2m: number;
                precipitation_probability: number;
                wind_speed_10m: number;
                soil_moisture_1_to_3cm: number;
            };
        };
    };
}
```
De esta manera se obtiene un json, en donde visualmente, de manera sencilla e intuitiva se puede distinguir los datos especificos de un día y una hora.

## Endpoints
### 1. Obtener datos meteorológicos
#### *`GET /weather`*
#### Descripción

Obtiene datos meteorológicos actuales, diarios y horarios para una ubicación específica.

#### Parámetros de Consulta

- **latitude**: Latitud de la ubicación.
- **longitude**: Longitud de la ubicación.



De no ser especificados tomaran el 0 como valor predeterminado.

#### Respuesta Exitosa (200 OK)

```json
    {
    "2024-09-06": {
        "daily": {
        "temperature_2m_max": 25.4,
        "temperature_2m_min": 10.9,
        "daylight_duration": 41826.4
        },
        "hourly": {
        "00:00": {
            "temperature_2m": 14.6,
            "precipitation_probability": 0,
            "wind_speed_10m": 13.3,
            "soil_moisture_1_to_3cm": 0.292
        },
        "01:00": {
            "temperature_2m": 14,
            "precipitation_probability": 0,
            "wind_speed_10m": 16.1,
            "soil_moisture_1_to_3cm": 0.292
        },
        "02:00": {
            "temperature_2m": 13.5,
            "precipitation_probability": 0,
            "wind_speed_10m": 17.7,
            "soil_moisture_1_to_3cm": 0.292
        },
        // Más datos por hora...
        }
    },
    // Más datos por los siguientes 7 días...
    }
```

#### Respuesta de Error (400 Bad Request)

```json
    { "message": "Latitude and longitude must be valid numbers within the allowed range." }
```

### 2. Registrar Clave API
#### *`GET /register`*
#### Descripción
Crea una nueva clave API para acceder a los datos.
#### Cuerpo de la solicitud
No es necesario incluir datos en el cuerpo de la solicitud.

#### Respuesta Exitosa (200 OK)

```json
    {
    "message": "API successfully created.",
    "apiKey": "kThEJg7TfDj12_ovhXuk8"
    }
```

#### Respuesta de Error (500)

```json
    {
        "message": "Unknown error processing the request."
    }
```

## Autenticación
### Headers
+ `API-KEY` : Clave API para acceder a los datos. Si no se proporciona, los datos pueden no estar disponibles.
