# Documentación de la API

## Introducción

Esta API proporciona información meteorológica detallada, incluyendo datos diarios y horarios para fechas específicas. También permite la creación y gestión de claves API para acceder a los datos.

## Endpoints
### 1. Obtener datos meteorológicos
#### *`GET /weather`*
#### Descripción

Obtiene datos meteorológicos actuales, diarios y horarios para una ubicación específica.

#### Parámetros de Consulta

- **latitude** (requerido): Latitud de la ubicación.
- **longitude** (requerido): Longitud de la ubicación.

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
    ctx.response.body = { error: "Latitud y longitud deben ser números válidos dentro del rango permitido." }
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
    "message": "API key creada    exitosamente.",
    "apiKey": "kThEJg7TfDj12_ovhXuk8"
    }
```

#### Respuesta de Error (500)

```json
    {
        "message": "Error desconocido al procesar la solicitud."
    }
```

## Autenticación
### Headers
+ `API-KEY` : Clave API para acceder a los datos. Si no se proporciona, los datos pueden no estar disponibles.
