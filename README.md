# Grano · Tu café, a tu manera
Aplicación de cafetería: menú móvil con compra rápida y personalización visual; barra con cola por estados y disponibilidad.
Requisitos: Node.js 22 LTS (probado para herramientas estáticas con 22.16) y npm.
Instala: `npm install`.
Inicia frontend y mock: `npm run dev`.
Cliente: http://localhost:5173/ · Barra: http://localhost:5173/barra (abre ambas pestañas).
Compilación: `npm run build`. Datos: JSON Server 0.17.4, latencia 600 ms, cambios persistentes en db.json.
Decisiones: imágenes WebP recortadas, SVG para ingredientes, CSS personalizado, polling cada 2.5–3.5 s y deshacer durante 10 s.
Supuestos: recoger en barra, precios MXN, sin pago ni autenticación; extras y producto Iced Latte añadidos para demostrar personalización.
El mock no ofrece transacciones; comprobamos disponibilidad justo antes de enviar, pero existe una ventana de concurrencia.
Con más tiempo: refinamiento del vaso, pruebas automatizadas E2E, accesibilidad con lector de pantalla y control de concurrencia.
Tiempo real dedicado: PENDIENTE (completar por la candidata antes de entregar).
