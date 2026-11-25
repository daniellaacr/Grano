# Verificación local antes de entregar
1. `npm install` y `npm run build`. Después `npm run dev`. Abre / y /barra en dos pestañas.
2. En DevTools verifica el menú a 375 px y 1280 px; no debe haber scroll horizontal fuera del carrusel.
3. Agrega un producto disponible con +, revisa cantidades y total. Personaliza Iced Latte; cambia leche, shots, hielo y topping.
4. Desde barra → Disponibilidad, agota un producto que ya esté en el carrito. En la vista cliente debe marcarse agotado y bloquear el envío. Retíralo y restablece el producto.
5. Envía un pedido con tu nombre y notas. Comprueba que aparece en la cola de barra y que el seguimiento cambia al avanzar sus estados.
6. Usa Deshacer dentro de 10 s y verifica que el pedido vuelve a su estado previo. Prueba nombres y notas largos.
7. Detén el mock o usa DevTools Offline y recarga: revisa error y reintento. Reactiva el servidor. Prueba navegación con teclado y reducción de movimiento.
8. Registra las correcciones manuales en AI.md y el tiempo real en README.md. Comprueba desde un clon limpio antes de compartir el repo.

## Revisión v1.1
- Comprobación estática: transpilación TS/TSX y script de datos/recursos correctos.
- Chromium: se verificó el layout del personalizador a 1280×800, 832×638, 375×667 y 375×812 con HTML generado desde el componente y CSS real (sin dependencias React ni fuentes instaladas). El vaso y el botón inferior permanecen visibles al desplazar opciones, sin desbordamiento horizontal ni scroll del diálogo.
- Pendiente: ejecutar `npm run build` y probar la interacción completa en la app con sus dependencias; el registro npm no es accesible desde el entorno de generación.
