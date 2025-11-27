# Web Store MVP con Payment Gateway

Este proyecto es un MVP (Minimum Viable Product) que demuestra la integración entre una tienda web desarrollada en Next.js y una pasarela de pagos independiente usando submódulos Git.

## Arquitectura

```
Repositorios GitHub:
├── web-store-mvp/             (https://github.com/lalofigo/web-store-mvp)
│   ├── payment-gateway/       (Submódulo → payment-gateway-mvp)
│   ├── src/
│   │   ├── app/
│   │   │   ├── api/checkout/  (API que comunica con el gateway)
│   │   │   ├── success/       (Página de pago exitoso)
│   │   │   ├── failed/        (Página de pago fallido)
│   │   │   └── page.tsx       (Homepage con carrito)
│   │   └── ...
│   └── ...
└── payment-gateway-mvp/       (https://github.com/lalofigo/payment-gateway-mvp)
    ├── server.js              (API REST del gateway)
    └── ...
```

## Flujo de Pago

1. 🛒 **Cliente interactúa** con la UI de Next.js (agrega productos al carrito)
2. 💳 **Next.js llama** a `/api/checkout` internamente
3. 🔗 **API checkout** se comunica con el gateway para crear y confirmar el pago
4. 🏦 **Gateway simula** la interacción con el banco (70% éxito, 30% fallo)
5. ✅/❌ **Web Store muestra** `/success` o `/failed` según el resultado

## Instalación y Ejecución

### Prerequisitos
- Node.js 18+ 
- Git

### 1. Clonar el repositorio con submódulos

```bash
# Clonar el repositorio principal
git clone https://github.com/lalofigo/web-store-mvp.git
cd web-store-mvp

# Inicializar y actualizar submódulos
git submodule init
git submodule update
```

**O clonar directamente con submódulos:**
```bash
git clone --recurse-submodules https://github.com/lalofigo/web-store-mvp.git
cd web-store-mvp
```

### 2. Levantar Payment Gateway (Terminal 1)

```bash
# Navegar al submódulo
cd payment-gateway

# Instalar dependencias
npm install

# Ejecutar el gateway
npm run dev
```

El gateway estará disponible en: `http://localhost:3001`

### 3. Levantar Web Store (Terminal 2)

```bash
# Desde el directorio principal de web-store-mvp
npm install

# Ejecutar la tienda web
npm run dev
```

La tienda estará disponible en: `http://localhost:3000`

## Uso

1. **Abrir** `http://localhost:3000` en tu navegador
2. **Agregar productos** al carrito haciendo click en "Agregar al carrito"
3. **Hacer click** en "Proceder al pago" cuando tengas productos en el carrito
4. **Esperar** a que el sistema procese el pago (1-3 segundos)
5. **Ver el resultado** - serás redirigido a `/success` o `/failed`

## API del Payment Gateway

### Endpoints disponibles:

- `POST /api/payments` - Crear un nuevo pago
- `POST /api/payments/:id/confirm` - Confirmar un pago
- `GET /api/payments/:id` - Obtener información de un pago
- `GET /api/payments` - Listar todos los pagos
- `GET /health` - Health check

### Ejemplo de uso directo:

```bash
# Crear pago
curl -X POST http://localhost:3001/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100.00,
    "currency": "USD", 
    "description": "Test payment",
    "customer": {"name": "Test", "email": "test@example.com"}
  }'

# Confirmar pago (reemplazar :id)
curl -X POST http://localhost:3001/api/payments/1/confirm
```

## Ventajas del Submódulo Git

✅ **Reutilización**: El payment-gateway puede ser usado en otros proyectos  
✅ **Desarrollo independiente**: Cada repo se desarrolla por separado  
✅ **Versionado**: Cada release de la tienda sabe exactamente qué versión del gateway usa  
✅ **Equipos separados**: Frontend y backend pueden trabajar independientemente  

## Comandos útiles para submódulos

```bash
# Ver estado de submódulos
git submodule status

# Actualizar submódulo a la versión más reciente
cd payment-gateway
git pull origin master
cd ..
git add payment-gateway
git commit -m "Update payment-gateway to latest version"

# Cambiar a una versión específica del submódulo
cd payment-gateway
git checkout v1.2.0
cd ..
git add payment-gateway
git commit -m "Use payment-gateway v1.2.0"
```

## Desarrollo

### Modificar el Payment Gateway
1. Hacer cambios en `payment-gateway/`
2. Commit en el repositorio del gateway
3. Actualizar el submódulo en web-store (comandos arriba)

### Modificar la Web Store
1. Hacer cambios en `web-store/src/`
2. Commit directamente en el repositorio principal

## Simulación Bancaria

El payment gateway simula respuestas bancarias con:
- **70% de éxito** (`succeeded`)  
- **30% de fallo** (`failed`)
- **Delay de 1-3 segundos** para simular procesamiento real

## Troubleshooting

### Payment Gateway no responde
- Verificar que esté corriendo en `http://localhost:3001`
- Revisar logs en la consola del terminal
- Verificar la variable `PAYMENT_GATEWAY_URL` en `.env.local`

### Submódulo no actualiza
```bash
git submodule update --remote payment-gateway
```

### Error de CORS
- El gateway ya incluye configuración de CORS
- Verificar que ambos servicios estén corriendo

---

**🎯 ¡Tu MVP está listo!** Ahora tienes una tienda web completamente funcional con su propia pasarela de pagos como submódulo Git.
