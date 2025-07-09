// --- Declaración de Constantes y Variables Globales ---
const MENU_PRINCIPAL_TEXTO = "¡Hola! Soy CoffeeBot Asistente de Granja El Paraíso. ¿En qué te ayudo hoy?\n\n" +
                             "Por favor, elige una opción ingresando el número:\n" +
                             "1. Hacer un pedido de café\n" +
                             "2. ¿Dónde nos encontramos?\n" +
                             "3. Plazos de entrega\n" +
                             "4. Ver historial de pedidos\n" +
                             "5. Salir";

const MENU_CAFE_TEXTO_BASE = "¡Claro! ¿Qué tipo de café te interesa?\n" +
                             "Ingresa el número del café:\n";

const MENSAJE_ERROR_OPCION_INVALIDA = "Opción inválida. Por favor, ingresa un número válido del menú.";
const MENSAJE_DESPEDIDA = "¡Gracias por visitar Granja El Paraíso! ¡Vuelve pronto!";
const MENSAJE_NO_HAY_PEDIDOS = "Aún no nos has hecho un pedido.";

const INFO_UBICACION_TEXTO = "¡Estamos en: calle falsa 123, Buenos Aires, Argentina!\n¡Te esperamos de Lunes a Viernes de 9 a 15 hs!";
const INFO_ENTREGA_TEXTO = "Nuestros plazos de entrega habituales son:\n" +
                           "- Dentro de Buenos Aires: 24 a 48 horas hábiles.\n" +
                           "- Fuera de Buenos Aires: 3 a 7 días hábiles.\n" +
                           "Recordá que los tiempos pueden variar.";

const PRODUCTOS_CAFE = [
    { id: 1, nombre: "Arábica", precio: 25 },
    { id: 2, nombre: "Robusta", precio: 20 },
    { id: 3, nombre: "Typica", precio: 28 },
    { id: 4, nombre: "Catuaí", precio: 23 }
];

const chatBox = document.getElementById('chatBox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

//

let estadoConversacion = 'inicio';
let pedidoActual = {};

//
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = text; 
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

function getMenuCafeTexto() {
    let menu = MENU_CAFE_TEXTO_BASE;
    PRODUCTOS_CAFE.forEach(cafe => {
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

function mostrarHistorialPedidos() {
    const pedidosGuardados = JSON.parse(localStorage.getItem('historialPedidos')) || [];
    let historialTexto = "";

    if (pedidosGuardados.length === 0) {
        historialTexto = MENSAJE_NO_HAY_PEDIDOS;
    } else {
        historialTexto = "--- Tu Historial de Pedidos ---\n\n";
        pedidosGuardados.forEach((pedido, index) => {
            historialTexto += `Pedido #${index + 1}:\n`;
            historialTexto += `  Tipo: ${pedido.cafe.nombre}\n`;
            historialTexto += `  Cantidad: ${pedido.cantidad} sacos\n`;
            historialTexto += `  Subtotal: $${pedido.subtotal.toFixed(2)}\n`;
            historialTexto += `------------------------------\n`;
        });
        historialTexto += "\n--- Fin del Historial ---";
    }
    addMessage(historialTexto.replace(/\n/g, '<br>'), 'bot');
    
    setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 1000);
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
                    mostrarHistorialPedidos();
                    estadoConversacion = 'inicio';
                    break;
                case 5:
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
            const cafe_encontrado = PRODUCTOS_CAFE.find(cafe => cafe.id === opcionNumerica);

            if (cafe_encontrado) {
                pedidoActual.cafe = cafe_encontrado;
                botResponse = `Elegiste ${cafe_encontrado.nombre}. ¿Cuántos sacos quieres?`;
                estadoConversacion = 'pidiendo_cantidad';
            } else {
                botResponse = MENSAJE_ERROR_OPCION_INVALIDA + "\n\n" + getMenuCafeTexto();
            }
            break;

        case 'pidiendo_cantidad':
            const cantidad = opcionNumerica;

            if (!isNaN(cantidad) && cantidad > 0) {
                pedidoActual.cantidad = cantidad;
                const subtotal = calcular_subtotal(pedidoActual.cantidad, pedidoActual.cafe.precio);
                pedidoActual.subtotal = subtotal;

                let resumen = `Confirmando tu pedido:\n\n` +
                              `Tipo: ${pedidoActual.cafe.nombre}\n` +
                              `Cantidad: ${pedidoActual.cantidad} sacos\n` +
                              `Precio Unitario: $${pedidoActual.cafe.precio.toFixed(2)}\n` +
                              `----------------------------\n` +
                              `Subtotal: $${subtotal.toFixed(2)}\n\n` +
                              `¿Confirmas el pedido? (1. Sí / 2. No)`;
                botResponse = resumen;
                estadoConversacion = 'confirmando_pedido';
            } else {
                botResponse = "Por favor, ingresa una cantidad NUMÉRICA válida (mayor a cero).";
            }
            break;

        case 'confirmando_pedido':
            if (opcionNumerica === 1) {
                botResponse = "¡Pedido CONFIRMADO! Gracias por elegirnos. ¡Pronto nos contactaremos para coordinar la entrega!";
                guardarPedidoEnLocalStorage(pedidoActual); 
                estadoConversacion = 'inicio';
                pedidoActual = {};
                setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 500);
            } else if (opcionNumerica === 2) {
                botResponse = "Pedido CANCELADO. Puedes iniciar uno nuevo cuando quieras.";
                estadoConversacion = 'inicio';
                pedidoActual = {};
                setTimeout(() => addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot'), 500);
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


// 
addMessage(MENU_PRINCIPAL_TEXTO.replace(/\n/g, '<br>'), 'bot');

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