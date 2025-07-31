# Google Cloud Platform Cloud Logging Setup

Este documento explica cómo configurar Google Cloud Platform Cloud Logging para el proyecto Node.js Express.

## 📋 Prerrequisitos

1. **Cuenta de Google Cloud Platform** activa
2. **Proyecto de GCP** creado
3. **API de Cloud Logging** habilitada
4. **Service Account** con permisos de logging

## 🔧 Configuración

### 1. Habilitar Cloud Logging API

```bash
gcloud services enable logging.googleapis.com
```

### 2. Crear Service Account

```bash
# Crear service account
gcloud iam service-accounts create node-express-logger \
    --display-name="Node Express Logger"

# Obtener el email del service account
gcloud iam service-accounts list --filter="displayName:Node Express Logger"
```

### 3. Asignar Permisos

```bash
# Asignar rol de Logs Writer
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:node-express-logger@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.logWriter"

# Asignar rol de Logs Viewer (opcional, para debugging)
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
    --member="serviceAccount:node-express-logger@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
    --role="roles/logging.viewer"
```

### 4. Crear y Descargar Key

```bash
# Crear key JSON
gcloud iam service-accounts keys create service-account-key.json \
    --iam-account=node-express-logger@YOUR_PROJECT_ID.iam.gserviceaccount.com
```

### 5. Configurar Variables de Entorno

Agregar las siguientes variables a tu archivo `.env`:

```env
# GCP Configuration
GOOGLE_APPLICATION_CREDENTIALS=/path/to/your/service-account-key.json
GOOGLE_CLOUD_PROJECT_ID=your-gcp-project-id
GOOGLE_CLOUD_LOG_NAME=node-express-api
GOOGLE_CLOUD_SERVICE_NAME=node-express-api
APP_VERSION=1.0.0

# Environment
NODE_ENV=production
LOG_LEVEL=info
```

## 🚀 Uso

### Desarrollo Local

En desarrollo, el logger funcionará solo con console output:

```bash
NODE_ENV=development npm run dev
```

### Producción con GCP

En producción, los logs se enviarán automáticamente a Cloud Logging:

```bash
NODE_ENV=production npm start
```

### Logs Locales (Opcional)

Para guardar logs en archivos locales durante desarrollo:

```env
LOG_TO_FILE=true
```

Esto creará archivos en el directorio `logs/`:
- `logs/error.log` - Solo errores
- `logs/combined.log` - Todos los logs

## 📊 Ver Logs en GCP Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com)
2. Seleccionar tu proyecto
3. Ir a **Logging** > **Logs Explorer**
4. Filtrar por:
   - `resource.type="gce_instance"` (si usas Compute Engine)
   - `logName="projects/YOUR_PROJECT_ID/logs/node-express-api"`

## 🔍 Consultas Útiles

### Ver todos los logs de la aplicación:
```
resource.type="gce_instance"
logName="projects/YOUR_PROJECT_ID/logs/node-express-api"
```

### Ver solo errores:
```
resource.type="gce_instance"
logName="projects/YOUR_PROJECT_ID/logs/node-express-api"
severity>=ERROR
```

### Ver logs de una versión específica:
```
resource.type="gce_instance"
logName="projects/YOUR_PROJECT_ID/logs/node-express-api"
labels.version="1.0.0"
```

## 🛠️ Troubleshooting

### Error: "Could not load the default credentials"

1. Verificar que `GOOGLE_APPLICATION_CREDENTIALS` apunte al archivo correcto
2. Verificar que el archivo de credenciales tenga permisos de lectura
3. Verificar que el service account tenga los permisos necesarios

### Error: "Permission denied"

1. Verificar que el service account tenga el rol `roles/logging.logWriter`
2. Verificar que la API de Cloud Logging esté habilitada
3. Verificar que el proyecto ID sea correcto

### Logs no aparecen en GCP Console

1. Verificar que `NODE_ENV=production`
2. Verificar que todas las variables de entorno estén configuradas
3. Esperar unos minutos (los logs pueden tardar en aparecer)
4. Verificar que no haya errores en la inicialización del logger

## 📝 Niveles de Log

- **ERROR**: Errores críticos que requieren atención inmediata
- **WARN**: Advertencias que no son críticas pero deben monitorearse
- **INFO**: Información general del sistema
- **DEBUG**: Información detallada para debugging

## 🔒 Seguridad

- **Nunca** subir el archivo `service-account-key.json` al repositorio
- Agregar `*.json` al `.gitignore` si contiene credenciales
- Usar **Workload Identity** en GKE para mayor seguridad
- Rotar las credenciales regularmente
