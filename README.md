
# Frontend — Sistema de Gestión de Incidencias Técnicas

Una institución educativa necesita registrar y realizar el seguimiento de los problemas técnicos
informados por sus usuarios. Actualmente estos problemas se comunican verbalmente, por correo
electrónico o mediante mensajería, lo que dificulta conocer cuáles continúan pendientes, quién los
informó, qué técnico se encuentra trabajando sobre cada caso y cuáles ya fueron solucionados.

## reglas de negocio

1. Un usuario solamente puede consultar sus propias incidencias.
2. Un técnico puede consultar todas las incidencias.
3. Solamente un técnico puede tomar una incidencia.
4. Solo una incidencia ABIERTA puede pasar a EN PROCESO.
5. Solamente el técnico asignado puede resolver una incidencia.
6. Una incidencia no puede pasar a RESUELTA sin una descripción de resolución.
7. Título, descripción y categoría deberán validarse en Laravel.
8. Los permisos deberán verificarse en el backend. Ocultar un botón con JavaScript no se considera
un mecanismo de seguridad.

## Requisitos

- Navegador actualizado.
- Backend Laravel levantado en `http://127.0.0.1:8000`.
- Conexión a Internet para cargar Bootstrap, jQuery y la tipografía desde CDN.

## Configuración

Abrir `assets/js/config.js` y revisar la dirección de la API:

```js
window.TIF_CONFIG = {
  API_BASE_URL: 'http://127.0.0.1:8000/api'
};
```

Si el backend utiliza otro host o puerto, modificar ese valor. La API incluye configuración CORS para permitir las solicitudes desde el frontend local.

## Ejecución en Windows

1. Primero iniciar la API desde la carpeta del backend:

   ```bash
   C:\php84\php.exe artisan serve --host=127.0.0.1 --port=8000
   ```

2. Abrir otra terminal dentro de la carpeta del frontend.
3. Iniciar un servidor estático local, por ejemplo:

   ```bash
   C:\php84\php.exe -S 127.0.0.1:5500
   ```

4. Abrir `http://127.0.0.1:5500` en el navegador.

También se puede utilizar la extensión Live Server de Visual Studio Code. No es recomendable abrir `index.html` directamente con `file://`.

## Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Usuario | `usuario@tif.com` | `password123` |
| Técnico | `tecnico@tif.com` | `password123` |

## Funcionalidades

- Inicio y cierre de sesión con token Laravel Sanctum.
- Listado de incidencias según el rol autenticado.
- Filtros por estado y categoría, resueltos mediante la API.
- Registro de incidencias para el rol usuario.
- Vista de detalle, información del creador/técnico, estado, resolución y comentarios.
- Toma de incidencias y resolución por parte del técnico asignado.
- Comentarios cronológicos.
- Diseño adaptable a escritorio, tablet y móvil con identidad visual negro, blanco y amarillo.

## Flujo de trabajo esperado

1. Ingresar como `usuario@tif.com` y registrar una incidencia.
2. Cerrar sesión e ingresar como `tecnico@tif.com`.
3. Abrir el caso y seleccionar **Tomar incidencia**. El estado cambia a `EN PROCESO`.
4. Agregar comentarios durante el seguimiento.
5. Registrar la resolución. El estado cambia a `RESUELTA`.
6. Volver a ingresar como usuario para consultar el estado final y los comentarios.
