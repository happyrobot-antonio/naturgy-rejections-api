# Naturgy Rejections Backend API

Backend API para la gestión de casos de rechazo de Naturgy.

## 📚 Documentación Interactiva

**Swagger UI disponible en**: `http://localhost:4000/docs/`

La documentación interactiva incluye:
- Todos los endpoints con ejemplos
- Modelos de datos completos
- Posibilidad de probar la API directamente desde el navegador
- Validaciones y tipos de datos

## Stack Tecnológico

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Database Driver**: pg (native PostgreSQL)
- **Base de Datos**: PostgreSQL (Cloud)
- **Validación**: Zod
- **Lenguaje**: TypeScript
- **Documentación**: Swagger UI + OpenAPI 3.0

## Instalación

```bash
npm install
```

## Configuración

Crear archivo `.env` con las siguientes variables:

```bash
DATABASE_URL="postgresql://postgres:PASSWORD@34.170.4.253:5432/happyrobot"
PORT=4000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
HAPPYROBOT_WEBHOOK_URL=https://workflows.platform.happyrobot.ai/hooks/8w6vk54dcqbg
```

**Nota sobre HappyRobot**: Cuando se crea un nuevo caso, automáticamente se envía la información al webhook de HappyRobot para iniciar el flujo de automatización. Si el webhook falla, el caso se crea de todas formas y el error se registra en los logs.

## Inicialización de Base de Datos

```bash
# Inicializar schema de la base de datos
npm run db:init
```

Este comando crea las tablas `rejection_cases` y `case_events` en PostgreSQL.

## Ejecución

### Desarrollo

```bash
npm run dev
```

### Producción

```bash
npm run build
npm start
```

### Docker

```bash
# Construir y ejecutar
docker compose up --build

# Solo ejecutar
docker compose up

# Detener
docker compose down
```

## API Endpoints

### Health Check

```
GET /health
```

Respuesta:
```json
{
  "status": "ok",
  "timestamp": "2026-01-18T22:00:00.000Z"
}
```

### Cases Endpoints

#### Obtener estadísticas

```
GET /api/cases/stats
```

Respuesta:
```json
{
  "total": 10,
  "inProgress": 5,
  "pendingAction": 5,
  "byStatus": [
    { "status": "In progress", "count": 5 },
    { "status": "Revisar gestor", "count": 3 },
    { "status": "Cancelar SC", "count": 2 }
  ]
}
```

#### Listar todos los casos

```
GET /api/cases?status=In progress&search=SC-001&limit=10&offset=0
```

Query Parameters:
- `status` (opcional): Filtrar por estado
- `search` (opcional): Búsqueda por código SC, nombre, CUPS o proceso
- `limit` (opcional): Número de resultados por página
- `offset` (opcional): Offset para paginación

Respuesta:
```json
{
  "cases": [...],
  "total": 10
}
```

#### Obtener un caso específico

```
GET /api/cases/:codigoSC
```

Respuesta:
```json
{
  "id": 1,
  "codigoSC": "SC-2024-001",
  "dniCif": "12345678A",
  "nombreApellidos": "Juan Pérez",
  "cups": "ES0021000000000001AB",
  "contratoNC": "NC-001",
  "lineaNegocio": "Electricidad",
  "direccionCompleta": "Calle Mayor 1",
  "codigoPostal": "28001",
  "municipio": "Madrid",
  "provincia": "Madrid",
  "ccaa": "Madrid",
  "distribuidora": "UFD",
  "grupoDistribuidora": "Naturgy",
  "emailContacto": "juan@example.com",
  "telefonoContacto": "600000000",
  "proceso": "Alta",
  "potenciaActual": "3.3",
  "potenciaSolicitada": "5.5",
  "status": "In progress",
  "emailThreadId": null,
  "fechaPrimerContacto": "2024-01-01T00:00:00.000Z",
  "events": [...],
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Crear un nuevo caso

```
POST /api/cases
Content-Type: application/json

{
  "codigoSC": "SC-2024-001",
  "dniCif": "12345678A",
  "nombreApellidos": "Juan Pérez",
  "cups": "ES0021000000000001AB",
  "contratoNC": "NC-001",
  "lineaNegocio": "Electricidad",
  "direccionCompleta": "Calle Mayor 1",
  "codigoPostal": "28001",
  "municipio": "Madrid",
  "provincia": "Madrid",
  "ccaa": "Madrid",
  "distribuidora": "UFD",
  "grupoDistribuidora": "Naturgy",
  "emailContacto": "juan@example.com",
  "telefonoContacto": "600000000",
  "proceso": "Alta",
  "potenciaActual": "3.3",
  "potenciaSolicitada": "5.5",
  "status": "In progress",
  "fechaPrimerContacto": "2024-01-01"
}
```

**Integración con HappyRobot**: Al crear un caso, automáticamente se envía al webhook de HappyRobot con 18 campos (excluyendo status, emailThreadId y fechaPrimerContacto). El caso se crea aunque el webhook falle.

#### Actualizar un caso

```
PUT /api/cases/:codigoSC
Content-Type: application/json

{
  "status": "Revisar gestor",
  "potenciaSolicitada": "6.6"
}
```

#### Eliminar un caso

```
DELETE /api/cases/:codigoSC
```

### Events Endpoints

#### Obtener eventos de un caso

```
GET /api/cases/:codigoSC/events
```

Respuesta:
```json
[
  {
    "id": "uuid",
    "caseId": "SC-2024-001",
    "type": "email_sent",
    "description": "Email enviado al cliente",
    "metadata": {
      "recipient": "juan@example.com",
      "subject": "Solicitud de documentación"
    },
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
]
```

#### Crear un evento

```
POST /api/cases/:codigoSC/events
Content-Type: application/json

{
  "type": "email_sent",
  "description": "Email enviado al cliente",
  "metadata": {
    "recipient": "juan@example.com",
    "subject": "Solicitud de documentación"
  }
}
```

Tipos de evento válidos:
- `email_sent`: Email enviado
- `call_initiated`: Llamada iniciada
- `email_received_with_attachment`: Email recibido con adjunto
- `email_received_no_attachment`: Email recibido sin adjunto

#### Obtener un evento específico

```
GET /api/events/:eventId
```

#### Eliminar un evento

```
DELETE /api/events/:eventId
```

## Estructura del Proyecto

```
backend/
├── prisma/
│   ├── schema.prisma          # Definición del modelo de datos
│   └── migrations/            # Migraciones de DB
├── src/
│   ├── index.ts              # Entry point
│   ├── routes/
│   │   ├── cases.ts          # CRUD de casos
│   │   └── events.ts         # CRUD de eventos
│   ├── controllers/
│   │   ├── casesController.ts
│   │   └── eventsController.ts
│   ├── services/
│   │   ├── caseService.ts
│   │   └── eventService.ts
│   └── lib/
│       └── prisma.ts         # Prisma client instance
├── Dockerfile
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

## Modelo de Datos

### RejectionCase

- `id`: ID autoincremental
- `codigoSC`: Código SC (Primary Key único)
- `dniCif`: DNI/CIF del cliente
- `nombreApellidos`: Nombre completo
- `cups`: CUPS
- `contratoNC`: Contrato NC
- `lineaNegocio`: Línea de negocio
- `direccionCompleta`: Dirección completa
- `codigoPostal`: Código postal
- `municipio`: Municipio
- `provincia`: Provincia
- `ccaa`: Comunidad Autónoma
- `distribuidora`: Distribuidora
- `grupoDistribuidora`: Grupo distribuidora
- `emailContacto`: Email de contacto
- `telefonoContacto`: Teléfono de contacto
- `proceso`: Proceso
- `potenciaActual`: Potencia actual (opcional)
- `potenciaSolicitada`: Potencia solicitada (opcional)
- `status`: Estado (In progress, Revisar gestor, Cancelar SC)
- `emailThreadId`: ID del hilo de email (opcional)
- `fechaPrimerContacto`: Fecha del primer contacto
- `events`: Relación con eventos
- `createdAt`: Fecha de creación
- `updatedAt`: Fecha de actualización

### CaseEvent

- `id`: UUID
- `caseId`: Código SC del caso (FK)
- `type`: Tipo de evento
- `description`: Descripción
- `metadata`: Metadatos adicionales (JSON)
- `timestamp`: Fecha y hora del evento

## Error Handling

Todos los errores devuelven un objeto JSON con el siguiente formato:

```json
{
  "error": {
    "message": "Error message",
    "stack": "..." // Solo en desarrollo
  }
}
```

Códigos de estado HTTP:
- `200`: Success
- `201`: Created
- `204`: No Content (Delete success)
- `400`: Bad Request (Validation error)
- `404`: Not Found
- `500`: Internal Server Error

## CORS

El backend está configurado para aceptar peticiones desde:
- `http://localhost:3000` (Frontend en desarrollo)

Para cambiar el origen permitido, modifica la variable `CORS_ORIGIN` en el archivo `.env`.

## Licencia

ISC
