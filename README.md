
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

1. Ingresar como un usuario y registrar una incidencia.
2. Cerrar sesión e ingresar como tecnico
3. Abrir el caso y seleccionar **Tomar incidencia**. El estado cambia a `EN PROCESO`.
4. Agregar comentarios durante el seguimiento.
5. Registrar la resolución. El estado cambia a `RESUELTA`.
6. Volver a ingresar como usuario para consultar el estado final y los comentarios.
