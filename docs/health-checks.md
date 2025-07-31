# Health Checks Implementation

Este documento describe la implementación de health checks minimalistas en el proyecto Node.js Express.

## 🏥 Endpoints Disponibles

### 1. Health Check General
- **URL**: `GET /api/health`
- **Descripción**: Verificación básica del estado de la aplicación y base de datos
- **Respuesta**: Estado general y estado de la base de datos

### 2. Liveness Probe
- **URL**: `GET /api/health/live`
- **Descripción**: Verifica si la aplicación está viva y ejecutándose
- **Uso**: Kubernetes liveness probe, load balancers
- **Respuesta**: Estado de vida básico

### 3. Readiness Probe
- **URL**: `GET /api/health/ready`
- **Descripción**: Verifica si la aplicación está lista para recibir tráfico
- **Uso**: Kubernetes readiness probe, verificaciones de dependencias
- **Respuesta**: Estado de preparación y conexión a base de datos

## 📊 Métricas Monitoreadas

### Base de Datos (Principal)
- **Estado de conexión**: ReadyState de MongoDB
- **Verificación de conectividad**: Conexión activa vs desconectada

### Aplicación (Básico)
- **Estado general**: Healthy/Unhealthy basado en DB
- **Timestamp**: Momento de la verificación

## 🔧 Configuración

### Middleware
El middleware de health check se aplica automáticamente a todas las rutas:
```typescript
// Track basic metrics for all requests
app.use(HealthCheckMiddleware.trackMetrics);
```

## 🚀 Uso en Kubernetes

### Liveness Probe
```yaml
livenessProbe:
  httpGet:
    path: /api/health/live
    port: 3000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3
```

### Readiness Probe
```yaml
readinessProbe:
  httpGet:
    path: /api/health/ready
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 3
```

## 📈 Monitoreo y Alertas

### Métricas Clave
1. **Database Connection**: Connected (readyState = 1)
2. **Application Status**: Healthy/Unhealthy

### Alertas Recomendadas
- Database disconnected
- Application not responding

## 🧪 Testing

### Script de Pruebas
```bash
# Probar todos los health checks
npm run health

# Probar endpoint específico
npm run health:check
npm run health:ready
```

### Ejemplo de Respuesta
```json
{
  "status": "healthy",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 🔍 Troubleshooting

### Health Check Falla
1. **Verificar servidor**: `curl http://localhost:3000/api/health/live`
2. **Verificar base de datos**: `curl http://localhost:3000/api/health/ready`
3. **Revisar logs**: Buscar errores en los logs de la aplicación

### Readiness Check Falla
1. **Verificar conexión MongoDB**: Variables de entorno, red
2. **Verificar configuración**: MONGO_URI, credenciales
3. **Revisar logs de MongoDB**: Conexión, autenticación

### Liveness Check Falla
1. **Verificar proceso**: PID, uptime
2. **Revisar logs**: Errores críticos, crashes

## 📝 Logging

### Niveles de Log
- **INFO**: Health checks exitosos
- **WARN**: Health checks con advertencias (DB desconectada)
- **ERROR**: Health checks fallidos

### Ejemplo de Logs
```
23:24:28 [INFO] Health check passed { status: 'healthy' }
23:24:28 [WARN] Health check failed - Database disconnected { dbStatus: 0 }
23:24:28 [ERROR] Health check failed { error: 'Database connection failed' }
```

## 🔒 Seguridad

### Consideraciones
- Los health checks no requieren autenticación
- No exponen información sensible
- Respuestas minimalistas para reducir overhead

### Recomendaciones
- Usar HTTPS en producción
- Monitorear acceso a health checks
- Logs de health checks para debugging

## 🚀 Integración con Monitoreo

### Load Balancers
- Health check en `/api/health/ready`
- Monitoreo de disponibilidad

### Kubernetes
- Liveness probe en `/api/health/live`
- Readiness probe en `/api/health/ready`

### Monitoreo Básico
- Verificación de estado en `/api/health`
- Estado de base de datos como indicador principal
