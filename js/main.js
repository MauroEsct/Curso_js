// --- Declaración de Constantes y Variables Globales ---
const MENU_PRINCIPAL_TEXTO = "¡Hola! Soy CoffeeBot Asistente de Granja El Paraíso. ¿En qué te ayudo hoy?\n\n" +
                             "Por favor, elige una opción ingresando el número:\n" +
                             "1. Hacer un pedido de café\n" +
                             "2. ¿Dónde nos encontramos?\n" +
                             "3. Plazos de entrega\n" +
                             "4. Ver carrito y finalizar compra\n" +
                             "5. Ver historial de pedidos\n" +
                             "6. Salir";

const MENU_CAFE_TEXTO_BASE = "¡Claro! ¿Qué tipo de café te interesa?\n" +
                             "Ingresa el número del café:\n";

const MENSAJE_ERROR_OPCION_INVALIDA = "Opción inválida. Por favor, ingresa un número válido del menú.";
const MENSAJE_DESPEDIDA = "¡Gracias por visitar Granja El Paraíso! ¡Vuelve pronto!";
const MENSAJE_NO_HAY_PEDIDOS = "Aún no nos has hecho un pedido.";
const MENSAJE_CARRITO_VACIO = "Tu carrito está vacío. Puedes agregar productos desde la opción 1.";

const INFO_UBICACION_TEXTO = "¡Estamos en: calle falsa 123, Buenos Aires, Argentina!\n¡Te esperamos de Lunes a Viernes de 9 a 15 hs!";
const INFO_ENTREGA_TEXTO = "Nuestros plazos de entrega habituales son:\n" +
                           "- Dentro de Buenos Aires: 24 a 48 horas hábiles.\n" +
                           "- Fuera de Buenos Aires: 3 a 7 días hábiles.\n" +
                           "Recordá que los tiempos pueden variar.";

// --- Referencias a los elementos del DOM ---
const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// --- Variables de Estado de la Conversación y DATOS DINÁMICOS ---
let estadoConversacion = 'inicio';
let carrito = [];
let pedidoTemporal = {};
let productosCafe = [];

// --- Funciones Auxiliares del Chat ---
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = text; 
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getMenuCafeTexto() {
    let menu = MENU_CAFE_TEXTO_BASE;
    productosCafe.forEach(cafe => {
        menu += `${cafe.id}. ${cafe.nombre} ($${cafe.precio}/saco)\n`;
    });
    return menu;
}

function calcular_subtotal(cantidad, precio_unitario) {
    return cantidad * precio_unitario;
}

function guardarPedidoEnLocalStorage(pedido) {
    let pedidosGuardados = JSON.parse(localStorage.getItem('historialPedidos')) || [];
    pedidosGuardados.push(pedido);
    localStorage.setItem('historialPedidos', JSON.stringify(pedidosGuardados));
}

function mostrarCarrito() {
    if (carrito.length === 0) {
        addMessage(MENSAJE_CARRITO_VACIO, 'bot');
        setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 1000);
        return;
    }

    let carritoTexto = "--- Tu Carrito ---\n\n";
    let totalGeneral = 0;

    carrito.forEach((item, index) => {
        const subtotal = calcular_subtotal(item.cantidad, item.cafe.precio);
        carritoTexto += `Ítem ${index + 1}: ${item.cafe.nombre} | Cantidad: ${item.cantidad} | Subtotal: $${subtotal.toFixed(2)}\n`;
        totalGeneral += subtotal;
    });

    carritoTexto += `\n-------------------------\n`;
    carritoTexto += `Total General: $${totalGeneral.toFixed(2)}\n\n`;
    carritoTexto += "¿Deseas finalizar la compra? (1. Sí / 2. No)";
    
    addMessage(carritoTexto.replace(/\n/g, '<br>'), 'bot');
    estadoConversacion = 'finalizando_compra';
}


function mostrarHistorialPedidos() {
    const pedidosGuardados = JSON.parse(localStorage.getItem('historialPedidos')) || [];
    let historialTexto = "";

    if (pedidosGuardados.length === 0) {
        historialTexto = MENSAJE_NO_HAY_PEDIDOS;
    } else {
        historialTexto = "--- Tu Historial de Pedidos ---\n\n";
        pedidosGuardados.forEach((pedido, index) => {
            historialTexto += `Pedido #${index + 1}:\n`;
            let totalPedido = 0;
            pedido.forEach(item => {
                const subtotal = calcular_subtotal(item.cantidad, item.cafe.precio);
                historialTexto += `  Tipo: ${item.cafe.nombre} | Cantidad: ${item.cantidad} | Subtotal: $${subtotal.toFixed(2)}\n`;
                totalPedido += subtotal;
            });
            historialTexto += `  Total del pedido: $${totalPedido.toFixed(2)}\n`;
            historialTexto += `------------------------------\n`;
        });
        historialTexto += "\n--- Fin del Historial ---";
    }
    addMessage(historialTexto.replace(/\n/g, '<br>'), 'bot');
    
    setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 1000);
}

// --- Lógica Asíncrona para cargar datos ---
async function cargarProductos() {
    try {
        addMessage("Cargando nuestro catálogo de productos...", 'bot');
        const response = await fetch('data/productos.json'); 
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        productosCafe = await response.json();
        addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot');
    } catch (error) {
        console.error('Error al cargar los productos:', error);
        addMessage('¡Lo sentimos! No se pudo cargar el catálogo de productos en este momento.', 'bot');
        userInput.disabled = true;
        sendButton.disabled = true;
    }
}


// --- Lógica Principal del Bot ---
function processUserInput(input) {
    const opcionNumerica = parseInt(input.trim());
    let botResponse = '';
    
    switch (estadoConversacion) {
        case 'inicio':
            switch (opcionNumerica) {
                case 1:
                    botResponse = getMenuCafeTexto();
                    estadoConversacion = 'pidiendo_cafe';
                    break;
                case 2:
                    botResponse = INFO_UBICACION_TEXTO;
                    estadoConversacion = 'inicio';
                    setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 500);
                    break;
                case 3:
                    botResponse = INFO_ENTREGA_TEXTO;
                    estadoConversacion = 'inicio';
                    setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 500);
                    break;
                case 4:
                    mostrarCarrito();
                    break;
                case 5:
                    mostrarHistorialPedidos();
                    estadoConversacion = 'inicio';
                    break;
                case 6:
                    botResponse = MENSAJE_DESPEDIDA;
                    userInput.disabled = true;
                    sendButton.disabled = true;
                    estadoConversacion = 'fin';
                    break;
                default:
                    botResponse = MENSAJE_ERROR_OPCION_INVALIDA + "\n\n" + MENU_PRINCIPAL_TEXTO;
                    break;
            }
            break;

        case 'pidiendo_cafe':
            const cafe_encontrado = productosCafe.find(cafe => cafe.id === opcionNumerica);

            if (cafe_encontrado) {
                pedidoTemporal.cafe = cafe_encontrado;
                botResponse = `Elegiste ${cafe_encontrado.nombre}. ¿Cuántos sacos quieres?`;
                estadoConversacion = 'pidiendo_cantidad';
            } else {
                botResponse = MENSAJE_ERROR_OPCION_INVALIDA + "\n\n" + getMenuCafeTexto();
            }
            break;

        case 'pidiendo_cantidad':
            const cantidad = opcionNumerica;

            if (!isNaN(cantidad) && cantidad > 0) {
                carrito.push({
                    cafe: pedidoTemporal.cafe,
                    cantidad: cantidad
                });

                botResponse = `¡${cantidad} sacos de ${pedidoTemporal.cafe.nombre} agregados al carrito!\n\n¿Qué quieres hacer ahora?\n1. Seguir comprando\n2. Ver carrito y finalizar compra`;
                estadoConversacion = 'gestionando_carrito';
                pedidoTemporal = {};
            } else {
                botResponse = "Por favor, ingresa una cantidad NUMÉRICA válida (mayor a cero).";
            }
            break;
        
        case 'gestionando_carrito':
            if (opcionNumerica === 1) {
                botResponse = getMenuCafeTexto();
                estadoConversacion = 'pidiendo_cafe';
            } else if (opcionNumerica === 2) {
                mostrarCarrito();
            } else {
                botResponse = "Opción inválida. Elige '1' para seguir comprando o '2' para ir al carrito.";
            }
            break;

        case 'finalizando_compra':
            if (opcionNumerica === 1) {
                guardarPedidoEnLocalStorage(carrito);
                
                Swal.fire({
                    title: '¡Compra confirmada!',
                    text: 'Gracias por elegirnos. ¡Pronto nos contactaremos!',
                    icon: 'success',
                    confirmButtonText: 'Aceptar'
                });

                carrito = [];
                estadoConversacion = 'inicio';
                setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 2000);

            } else if (opcionNumerica === 2) {
                Swal.fire({
                    title: 'Pedido cancelado',
                    text: 'Puedes iniciar uno nuevo cuando quieras.',
                    icon: 'error',
                    confirmButtonText: 'Aceptar'
                });

                carrito = [];
                estadoConversacion = 'inicio';
                setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 2000);
            } else {
                botResponse = "Por favor, responde con '1' para confirmar o '2' para cancelar.";
            }
            break;
        
        case 'fin':
            return;
            
        default:
            botResponse = MENSAJE_ERROR_OPCION_INVALIDA + "\n\n" + MENU_PRINCIPAL_TEXTO;
            estadoConversacion = 'inicio';
            break;
    }
    
    if (botResponse) {
        addMessage(botResponse.replace(/\n/g, '<br>'), 'bot');
    }
}


// --- Event Listeners y Lógica de Inicio ---
cargarProductos();

sendButton.addEventListener('click', () => {
    const input = userInput.value;
    if (input.trim() !== '') {
        addMessage(input, 'user');
        userInput.value = '';
        processUserInput(input);
    }
});

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendButton.click();
    }
});

userInput.focus();