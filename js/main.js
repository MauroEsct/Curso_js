// --- Declaración de Constantes y Variables Globales ---

const MENSAJE_BIENVENIDA = "¡Hola! Soy tu bot de Granja El Paraíso. ¿En qué te ayudo?";
const MENSAJE_DESPEDIDA = "¡Gracias por visitar Granja El Paraíso! Volvé cuando quieras.";

const MENU_PRINCIPAL_TEXTO = "Elegí una opción ingresando el número:\n" +
                             "1. Hacer un pedido\n" +
                             "2. ¿Dónde nos encontramos?\n" +
                             "3. Plazos de entrega\n" +
                             "4. Salir";

const MENSAJE_PEDIR_CANTIDAD = "Ingresá la cantidad de sacos que querés:";

const MENSAJE_ERROR_OPCION = "Opción inválida. Por favor, ingresá un número válido del menú (1 al 4).";

const INFO_UBICACION_TEXTO = "¡Estamos en: calle falsa 123, Buenos Aires, Argentina \n" +
                             "¡Te esperamos de Lunes a Viernes de 9 a 15 hs!";
const INFO_ENTREGA_TEXTO = "Nuestros plazos de entrega habituales son:\n" +
                           " - Dentro de Buenos aires: 24 a 48 horas hábiles.\n" +
                           " - Fuera de Buenos aires: 3 a 7 días hábiles.\n" +
                           "Recordá que los tiempos pueden variar.";

const PRODUCTOS_CAFE = [
    { id: 1, nombre: "Arábica", precio: 25 },
    { id: 2, nombre: "Robusta", precio: 20 },
    { id: 3, nombre: "Typica", precio: 28 },
    { id: 4, nombre: "Catuaí", precio: 23 }
];

// --- Funciones del Simulador ---

function obtener_opcion_menu_principal() {
    let opcion = prompt(MENU_PRINCIPAL_TEXTO);
    console.log("Opción de menú principal ingresada: " + opcion);
    return opcion;
}

function obtener_tipo_cafe() {
    let opcion_cafe_valida = false;
    let cafe_elegido = null;

    let menu_cafe_texto = "Elegí tu tipo de café (ingresá el número):\n";
    PRODUCTOS_CAFE.forEach(cafe => {
        menu_cafe_texto += `${cafe.id}. ${cafe.nombre} ($${cafe.precio}/saco)\n`;
    });
    menu_cafe_texto += "\n(Para cancelar el pedido, haz clic en el botón 'Cancelar')";

    while (!opcion_cafe_valida) {
        let eleccion = prompt(menu_cafe_texto);

        if (eleccion === null) {
            alert("Pedido de café cancelado. Volviendo al menú principal.");
            console.log("Usuario canceló la selección de café.");
            opcion_cafe_valida = true;
        } else {
            const id_cafe = parseInt(eleccion);
            
            if (isNaN(id_cafe)) {
                alert("Opción inválida. Por favor, ingresá un NÚMERO.");
                console.log("Entrada no numérica para café: " + eleccion);
            } else {
                const cafe_encontrado = PRODUCTOS_CAFE.find(cafe => cafe.id === id_cafe);

                if (cafe_encontrado) {
                    cafe_elegido = cafe_encontrado;
                    opcion_cafe_valida = true;
                    console.log(`Café elegido: ${cafe_elegido.nombre}`);
                } else {
                    alert("Opción de café inválida. Por favor, ingresá 1, 2, 3 o 4.");
                    console.log("Entrada de café válida pero no encontrada: " + eleccion);
                }
            }
        }
    }
    return cafe_elegido;
}

function obtener_cantidad() {
    let cantidad_valida = false;
    let cantidad = null;

    while (!cantidad_valida) {
        let entrada_cantidad = prompt(MENSAJE_PEDIR_CANTIDAD + "\n(Para cancelar la operacion, haz clic en el botón 'Cancelar')");

        if (entrada_cantidad === null) {
            alert("Operación cancelada. Volviendo al menú principal.");
            console.log("Usuario canceló la entrada de cantidad.");
            cantidad_valida = true; 
        } else {
            let num_cantidad = parseInt(entrada_cantidad);
            
            // Mensajes de error más específicos para cantidad
            if (isNaN(num_cantidad)) {
                alert("Error: Por favor, ingresa un NÚMERO para la cantidad.");
                console.log("Entrada no numérica para cantidad: " + entrada_cantidad);
            } else if (num_cantidad <= 0) {
                alert("Error: La cantidad debe ser un número MAYOR a cero.");
                console.log("Cantidad menor o igual a cero: " + entrada_cantidad);
            } else {
                cantidad = num_cantidad;
                cantidad_valida = true;
                console.log(`Cantidad ingresada: ${cantidad}`);
            }
        }
    }
    return cantidad; 
}

function calcular_subtotal(cantidad, precio_unitario) {
    let subtotal = cantidad * precio_unitario;
    console.log("Subtotal calculado: " + subtotal);
    return subtotal;
}

function mostrar_informacion(tipo_info) {
    if (tipo_info === "ubicacion") {
        alert(INFO_UBICACION_TEXTO);
        console.log("Mostrando información de ubicación.");
    } else if (tipo_info === "entrega") {
        alert(INFO_ENTREGA_TEXTO);
        console.log("Mostrando información de plazos de entrega.");
    }
}

function mostrar_resumen_y_confirmar(cafe, cantidad, subtotal) {
    let mensaje_resumen = `--- Resumen de tu Pedido ---` +
                         `\nTipo de Café: ${cafe.nombre}` +
                         `\nCantidad: ${cantidad} sacos` +
                         `\nPrecio Unitario: $${cafe.precio.toFixed(2)}` +
                         `\n----------------------------` +
                         `\nSubtotal: $${subtotal.toFixed(2)}`;
    alert(mensaje_resumen);

    let confirmacion = confirm("¿Confirmás este pedido?");
    if (confirmacion) {
        alert("¡Pedido CONFIRMADO! Gracias por elegirnos.");
        console.log("Pedido confirmado.");
    } else {
        alert("Pedido CANCELADO. Podés iniciar uno nuevo cuando quieras.");
        console.log("Pedido cancelado.");
    }
}


// --- Lógica Principal del Bot ---

alert(MENSAJE_BIENVENIDA);

let seguir_en_bot = true;

while (seguir_en_bot) {
    let opcion_usuario = obtener_opcion_menu_principal();

    // Uso de switch para el menú principal
    switch (opcion_usuario) {
        case '1':
            console.log("El usuario eligió 'Hacer un pedido'.");
            let cafe_seleccionado = obtener_tipo_cafe();
            
            if (cafe_seleccionado !== null) { 
                let cantidad_pedido = obtener_cantidad();

                if (cantidad_pedido !== null && cantidad_pedido > 0) { 
                    let subtotal = calcular_subtotal(cantidad_pedido, cafe_seleccionado.precio);
                    mostrar_resumen_y_confirmar(cafe_seleccionado, cantidad_pedido, subtotal);
                }
            }
            break; 

        case '2':
            mostrar_informacion("ubicacion");
            break;

        case '3':
            mostrar_informacion("entrega");
            break;

        case '4':
        case null: 
            seguir_en_bot = false;
            alert(MENSAJE_DESPEDIDA);
            console.log("Bot finalizado por el usuario.");
            break;

        default: 
            alert(MENSAJE_ERROR_OPCION);
            console.log("Opción de menú inválida ingresada: " + opcion_usuario);
            break;
    }

    if (seguir_en_bot) {
        console.log("Volviendo al menú principal.");
    }
}

console.log("Fin del programa JavaScript.");