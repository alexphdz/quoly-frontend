# Quoly — Guía de usuario

> **Para quién es esta guía:** el comprador que usa Quoly día a día.
> **Qué describe:** lo que la aplicación web realmente hace hoy, pantalla por pantalla, con sus límites claros y qué hace (y qué no hace) la IA.
> **Vigencia:** refleja el estado actual de la app (verificado contra el código, 2026-10-24). Donde un documento de producto más viejo diga algo distinto, manda esta guía.

---

## 1. Qué es Quoly

Quoly es un **espacio de trabajo para compradores** que cotizan con proveedores que **ya conocen**. Tú escribes una solicitud comercial corta, la envías, y Quoly convierte las respuestas (correos, PDFs, Excel, Word, fichas técnicas, cotizaciones parciales, preguntas mezcladas) en una **comparación clara que puedes defender** ante finanzas, calidad u operaciones.

Puntos clave:

- **Los proveedores nunca crean cuenta ni usan un portal.** Responden como siempre: por correo y con los archivos que ya mandan.
- **Tú mantienes el control.** Quoly lee, estructura, resume y recomienda — pero **tú** eliges a quién invitas, qué envías, qué lecturas aceptas y a quién le adjudicas.
- **Es agnóstico de categoría.** Sirve para ingredientes, componentes, químicos, textiles, empaque, equipo… lo que sea que compres. No es una herramienta de una sola industria.

---

## 2. Para quién

El cliente es **el comprador**: un líder de compras, category manager, gerente de operaciones, o un fundador que todavía cotiza personalmente. Ya tiene su lista de proveedores; Quoly la guarda de forma privada (con contactos y etiquetas). **No** es un marketplace y **no** sugiere proveedores de fuera de tu lista.

---

## 3. El flujo en una imagen

```
Crear la solicitud
  → Elegir proveedores y enviar
  → Los proveedores avanzan por su cuenta
  → Tú resuelves lo que te pidieron
  → Se acumulan cotizaciones y especificaciones
  → Comparar
  → Tú decides (adjudicas)
```

Una misma solicitud puede tener **varios proveedores en etapas distintas al mismo tiempo**: uno ya cotizó, otro sigue en silencio, otro está esperando que tú le respondas algo.

---

## 4. Conceptos clave

| Concepto | Qué es |
|---|---|
| **Solicitud (RFQ)** | La solicitud comercial que creas y envías. Tiene un estado general. |
| **Estado de la solicitud** | **Borrador** (aún la escribes) · **Abierta** (en movimiento) · **Cerrada** (terminaste con ella). Cerrar **no** es adjudicar. |
| **Proveedor en la solicitud** | Cada proveedor invitado tiene su **propia etapa** (ver tabla abajo). |
| **Cotización** | La oferta comercial que Quoly pudo estructurar del material del proveedor. Puede ser **parcial** (incluso sin precio). |
| **Acción del comprador** | Algo que un proveedor **todavía necesita de ti**. Queda **abierta** hasta que la marcas resuelta. |
| **Evidencia de especificación** | Lectura, parámetro por parámetro, de lo que dijo el proveedor — comparada contra tu referencia cuando existe. |
| **Comparación** | Pone a los proveedores de una solicitud lado a lado (diferencias comerciales y técnicas). |

### Etapas de un proveedor

| Etapa | Significado |
|---|---|
| **No contactado** (`not_contacted`) | Agregado a la solicitud, aún no se le envía |
| **Esperando respuesta** (`awaiting_response`) | Se le envió; aún no llega material de cotización |
| **Requiere acción del comprador** (`buyer_action_required`) | El proveedor espera algo de ti |
| **Respuesta parcial** (`partial_response`) | Hay material de cotización, pero incompleto |
| **Cotización recibida** (`quote_received`) | Hay una cotización confirmada para comparar |
| **Declinó** (`declined`) | El proveedor declinó |
| **Cerrado** (`closed`) | Cerraste a este proveedor en la solicitud (sin cerrar toda la solicitud) |

Un mismo mensaje puede traer **varias etiquetas a la vez**: cotización recibida, cotización parcial, aclaración requerida, acuse, declinación, otro, necesita revisión. Una cotización y una pregunta pueden llegar juntas.

---

## 5. Pantallas y qué puedes hacer

### Iniciar sesión · Crear cuenta · Recuperar contraseña

- **Iniciar sesión** con correo y contraseña.
- **Crear cuenta** con un correo de trabajo y contraseña. Tras registrarte, Quoly te pide **confirmar tu correo** (te llega un enlace); hasta confirmarlo no puedes entrar. Hay un botón para **reenviar** el correo de confirmación.
- **¿Olvidaste tu contraseña?** En la pantalla de inicio de sesión. Pides el enlace, te llega por correo, y en la pantalla de restablecer defines una nueva.
- Los errores te dicen qué pasó (credenciales incorrectas, correo no confirmado, cuenta suspendida, correo ya registrado, registros cerrados, o servicio no disponible) y te dejan reintentar.

> Conectar un buzón **no** es parte de crear la cuenta. Lo haces después (opcional).

### Inicio (Home)

Aterrizas aquí tras entrar. Ves un saludo según la hora y tu nombre cuando se puede derivar, más indicadores: cotizaciones por revisar, proveedores esperándote, pipeline, fechas y actividad — todo **contado a partir de tus solicitudes y cotizaciones reales**. Si no hay nada pendiente, el saludo lo dice y creas una solicitud desde la barra lateral.

### Solicitudes (lista)

Ves **todas tus solicitudes**. Por cada una: nombre del producto, referencia interna (si la pusiste), estado, cantidad y unidad, cuántas cotizaciones hay en comparación, y si algún proveedor te está esperando.

- **Buscar** por nombre de producto, referencia interna o identidad de la solicitud.
- **Abrir la comparación** directo desde la lista cuando ya hay algo que comparar.
- **Atención**: cuando un proveedor te necesita, la solicitud se marca; abrirla te lleva a lo que está pendiente.

### Crear solicitud

Un solo formulario corto. Puedes **guardar borrador** y volver, o **crear** cuando los campos requeridos sean válidos.

**Requeridos**
- **Nombre del producto** — qué estás comprando.
- **Cantidad solicitada** — la cantidad a cotizar en esta solicitud.
- **Unidad de medida.**

**Opcionales**
- **Referencia interna**, y si los proveedores la ven o no (si la ocultas, queda para ti pero no se envía).
- **Incoterm 2020** y el **lugar** que ese término nombra.
- **Fecha de entrega deseada.**
- **Requisitos técnicos** — texto libre (ej. "grado alimenticio", "assay 99.5%", un sello de cadena de custodia). El formulario **no** convierte esos ejemplos en campos propios.
- **Especificación de referencia** — un archivo. **Nunca es obligatorio.**

**Unidades disponibles** (el catálogo puede crecer): kg, g, mg, lb, oz, L, mL, piezas, unidades, metros, cm, mm, m², m³, rollos, cajas, bolsas, tambores, pallets, contenedores, sets, packs.

**Incoterms 2020** — los once términos. El lugar cambia de significado según el término:

| Término | Modo | Qué es el lugar |
|---|---|---|
| EXW / FCA | Cualquiera | Lugar de entrega |
| CPT / CIP / DAP / DPU / DDP | Cualquiera | Lugar de destino |
| FAS / FOB | Marítimo / vías navegables | Puerto de embarque |
| CFR / CIF | Marítimo / vías navegables | Puerto de destino |

**Tres formas válidas de manejar la especificación:**
1. **Adjuntas** un archivo de especificación de referencia.
2. **Escribes** los requisitos en texto libre y no adjuntas nada.
3. **Ni archivo ni requisitos** — la solicitud puede pedirle al proveedor su ficha técnica actual.

> Crear o enviar **nunca** pide atributos de empaque, ni MOQ, ni volumen anual, ni volumen cúbico. El MOQ llega después, del proveedor.

### Detalle de la solicitud

Donde trabajas una solicitud ya creada.

- **La solicitud**: lees producto, cantidad, unidad, Incoterm y lugar, fecha deseada, requisitos técnicos, si hay archivo de referencia, la referencia interna (aunque el proveedor no la haya visto), y el estado. Puedes **cerrar** la solicitud cuando terminas.
- **Proveedores**: agregas desde tu directorio o uno solo para esta solicitud. Cada uno muestra su etapa. Puedes **cerrar un solo proveedor** sin cerrar toda la solicitud.
- **Enviar**: envías a los que aún no recibieron la solicitud. **Con buzón conectado**, se envía desde tu buzón. **Sin buzón**, copias la solicitud y la mandas tú (copiar no marca al proveedor como "enviado" falsamente).
- **Comunicación**: lees lo enviado y lo recibido por proveedor, incluso acuses o declinaciones.
- **Acciones del comprador ("Necesitan respuesta")**: las preguntas/pendientes abiertos de los proveedores. Por cada uno, Quoly te ofrece **respuestas rápidas** armadas de tu propia solicitud (ej. el lugar, la cantidad, una línea de tus requisitos) o un campo libre. Puedes:
  - **Resolver** — lo marcas atendido (no envía nada); si elegiste respuestas, las guarda en la solicitud.
  - **Enviar respuestas** — compone tu respuesta con lo que elegiste + una nota y la envía por tu buzón (o abre un borrador de correo). **Tú** eliges el contenido.
- **Comparación en la solicitud**: la misma comparación vive aquí, junto a los proveedores.

### Respuesta entrante del proveedor

Lees **una** respuesta y ves qué hizo Quoly con ella.

- Abres el **mensaje original** y los **documentos** que llegaron (cuerpo, PDFs, Excel, Word, fichas).
- Ves lo **extraído**: puntos comerciales, puntos de especificación y los pendientes.
- Ves las **etiquetas** del mensaje (pueden ser varias) y lo marcado como **necesita revisión**: corriges o aceptas un valor antes de confiar en él.
- **Lo que el proveedor todavía necesita**: cada pendiente con su tipo (información, documento, confirmación, aclaración técnica, aclaración comercial, otro) y su estado (abierto/resuelto). Cuando la respuesta **ya está en la solicitud**, Quoly te la muestra al lado.
- **Responder al proveedor**: puedes escribir una respuesta y enviarla por tu buzón conectado. También puedes pedir una **sugerencia de respuesta con IA** (botón "Sugerir respuesta (IA)"): aparece un borrador en una tarjeta; con **"Usar esta sugerencia"** pasa al cuadro de texto (editable), o escribes la tuya. **La sugerencia solo se genera cuando la pides, siempre la revisas/editas, y nada se envía solo.**

### Cotización

La oferta comercial extraída para un proveedor, **incluso incompleta**.

- Ves los valores que Quoly encontró y los **huecos** donde el proveedor calló (una cotización puede quedar **sin precio**).
- **Resumen en lenguaje llano** de lo que el proveedor mandó, con los **números exactos** — es una lectura, no un juicio.
- **Escalones de precio (tiers)**: cuando cotizó varias cantidades, ves cada quiebre (cantidad, unidad, precio, moneda). Se conservan las cifras originales; puede mostrarse una **vista normalizada** al lado.
- **MOQ**: solo si el proveedor lo declaró.
- **Lead time**: producción, tránsito y total **solo donde el proveedor lo dijo**, con su redacción original. Si no dio total, **no se inventa**.
- **Necesita revisión**: los campos inciertos quedan marcados hasta que los aceptas o corriges. Confirmar **no** requiere precio ni todos los campos llenos.

### Evidencia de especificación

Lo que el proveedor dijo del producto, alineado con tu referencia **cuando existe**. Cada parámetro recibe **un veredicto**:

| Veredicto | Significado |
|---|---|
| **Coincide** | La evidencia concuerda con la referencia |
| **Desviación** | El proveedor dijo algo distinto |
| **Falta del proveedor** | La referencia lo pide y el proveedor no lo abordó |
| **No comparable** | Ambos dicen algo pero no se pueden alinear |
| **Parámetro adicional del proveedor** | El proveedor dijo algo que la referencia no pedía |
| **Necesita revisión** | Alguien debe mirar antes de confiar en el veredicto |

**No hay porcentaje de match ni score.** Cuando **no** diste referencia, se muestra la especificación extraída del proveedor, sin veredictos.

### Comparación

El corazón del producto. Pone a los proveedores de una solicitud lado a lado.

- **Comercial**: precio y tiers, moneda, unidad, Incoterm y lugar, MOQ, lead time, validez, términos de pago — proveedor por proveedor. Lo que falta, **se queda visible como faltante**. La redacción original del proveedor queda disponible donde un valor vino de una frase.
- **Técnica**: los veredictos de especificación cuando diste referencia; o las especificaciones extraídas lado a lado cuando no la diste. **Sin score.**
- **Briefing y recomendación**: un resumen escrito (dispersión de precios, lead times, huecos, pendientes abiertos). Puede **recomendar un proveedor** con base en datos comerciales normalizados y completitud; la tabla de ranking marca la cotización líder como recomendada.
- **Tú decides**: registrar la adjudicación es tu acción explícita (**Adjudicar / Record award** — no "ganador"). Cancelar deja la solicitud abierta.
- **Exportar a PDF**: puedes exportar la decisión/adjudicación a PDF.
- Los **pendientes abiertos** siguen visibles en la comparación, para que una oferta barata pero bloqueada no se confunda con una terminada.

### Cotizaciones (entre solicitudes)

Encuentra cotizaciones sin abrir cada solicitud. Ves las de todas tus solicitudes, cuáles necesitan revisión, filtras por una solicitud y buscas por proveedor o solicitud. **Es una forma de encontrar trabajo, no una segunda comparación**: no rankea proveedores.

### Directorio de proveedores

Tu lista privada. Agregas, buscas, abres, editas, **archivas** y **restauras** proveedores. Los archivados no aparecen al agregar proveedores a una solicitud hasta restaurarlos. Guardas cómo contactar a la empresa, agregas **contactos** y eliges el principal. Las **etiquetas** organizan la lista. **No** sugiere proveedores de fuera de tu lista ni navega un marketplace.

**Detalle del proveedor**: ves y editas la empresa, gestionas contactos, archivas/restauras, y ves en qué solicitudes está incluido.

### Settings (Ajustes)

- **Perfil**: correo, miembro desde. **Foto**: subir/quitar avatar.
- **Apariencia**: Claro / Oscuro / Sistema.
- **Idioma**: idioma del workspace (Español/Inglés) y el idioma por defecto de los correos a proveedores.
- **Seguridad**: cambiar contraseña (actual / nueva / confirmar).
- **Buzón**: conectar **Gmail** o **Outlook** (ver estado conectado y desconectar). Conectar un buzón es lo que permite **enviar desde tu correo** y **recibir las respuestas** que llegan ahí. Es **opcional**: sin buzón, envías copiando la solicitud.

---

## 6. Qué hace la IA

La IA **reduce el trabajo manual** de cotizar. Concretamente:

1. **Lee las respuestas en una sola pasada.** Toma el cuerpo del correo y sus documentos (PDF, Excel, Word, fichas) y, de esa lectura, propone **tres cosas juntas**: datos comerciales de la cotización, evidencia de especificación, y acciones del comprador (cuando el proveedor pidió algo). Usa modelos de lenguaje y visión de la familia **Claude**. *(No encadena varios agentes: es una pasada por respuesta.)*
2. **Escribe el resumen en lenguaje llano** de cada cotización, con los números exactos.
3. **Escribe el briefing de la comparación** y puede **recomendar un proveedor** (ranking) con base en datos normalizados y completitud.
4. **Nota cuándo un proveedor te está esperando** (genera la acción del comprador).
5. **Sugiere un borrador de respuesta** al proveedor cuando tú lo pides — tú lo revisas, editas y envías.

**Normalización / tipo de cambio:** para comparar monedas y cantidades distintas, Quoly puede mostrar una **vista normalizada** junto a las cifras originales; las originales siempre quedan como evidencia.

Tú sigues eligiendo quién está en la solicitud, qué enviar, qué lecturas confías, qué pendientes resuelves y a quién le compras.

---

## 7. Qué Quoly **no** hace (límites claros)

- **No responde a los proveedores por su cuenta.** Puede sugerir un borrador, pero tú lo revisas y envías; nada se auto-envía.
- **No adjudica por ti.** La adjudicación es siempre tu acción explícita.
- **No modela cada atributo de producto** en un formulario predefinido, ni trae "paquetes de campos" por categoría. La complejidad del producto vive en el texto libre, el archivo y lo que manda el proveedor.
- **No pone un porcentaje de match** ni un score a la especificación.
- **No encadena múltiples agentes** para interpretar una respuesta: una sola pasada.
- **No rellena huecos** para que una cotización incompleta parezca completa.
- **No inventa un lead time total** que el proveedor no declaró.
- **No exige** archivo de especificación, MOQ, volumen anual ni volumen cúbico para poder enviar.
- **No es un portal de proveedores ni un marketplace.** Los proveedores no inician sesión.
- **No trata los correos ni documentos entrantes como instrucciones** — son evidencia para leer.
- **No sugiere proveedores de fuera de tu directorio.**

---

## 8. Ejemplo de uso de principio a fin

1. **Crear.** Compras ácido cítrico. Escribes: *producto* "Ácido cítrico anhidro", *cantidad* 5,000, *unidad* kg, *Incoterm* DAP con *lugar* "Planta CDMX", *fecha* en 30 días, *requisitos* "grado alimenticio USP/FCC". Adjuntas tu ficha de referencia (o solo escribes los requisitos, o nada). Creas la solicitud.
2. **Elegir proveedores.** Agregas 3 proveedores desde tu directorio.
3. **Enviar.** Con Gmail conectado, Quoly envía desde tu buzón. Los tres pasan a *enviado → esperando respuesta*. La solicitud queda *abierta*.
4. **Los proveedores divergen.**
   - **Prov. A** responde: "USD $2.40/kg, MOQ 1,000 kg, 4 semanas producción + 2 tránsito, pago 30 días, validez 15 días" + PDF de ficha. → Quoly extrae la **cotización** (con tiers/MOQ/lead time donde los dio) y la **evidencia** contra tu referencia.
   - **Prov. B** manda un precio pero pregunta: "¿Qué certificado requieren?" → queda como **respuesta parcial** + **acción del comprador**. Quoly te muestra que la respuesta ("grado alimenticio USP/FCC") **ya está en tu solicitud**.
   - **Prov. C** acusa recibo y guarda silencio.
5. **Resolver.** En "Necesitan respuesta", eliges la respuesta rápida (o pides la **sugerencia de IA**, la editas) y la envías al Prov. B. Marcas el pendiente resuelto.
6. **Acumular.** Las cotizaciones y especificaciones se juntan; lo incompleto queda incompleto.
7. **Comparar.** Abres la comparación: ves diferencias comerciales y técnicas, los huecos, los pendientes, y un **ranking con recomendación** más el análisis de Quoly.
8. **Decidir.** Eliges al proveedor y haces **Adjudicar**. Exportas el PDF para tu expediente.

---

## 9. Notas y requisitos

- **Idiomas:** la interfaz está en Español e Inglés. También eliges el idioma por defecto de los correos a proveedores.
- **Buzón opcional:** puedes usar Quoly sin conectar Gmail/Outlook (enviando por copia), pero conectarlo automatiza el envío y la recepción de respuestas.
- **Actualización:** las respuestas entrantes y cotizaciones se refrescan solas cada ~1 minuto mientras tienes la solicitud abierta.
- **Solicitudes antiguas de empaque:** las solicitudes creadas en el workspace anterior de empaque siguen siendo legibles, pero crear/enviar ya no pide atributos de empaque.

---

## Glosario

- **RFQ / Solicitud** — la solicitud comercial que envías.
- **Incoterms 2020** — los once términos comerciales de la ICC; cada uno nombra un lugar de entrega, de destino, o un puerto.
- **Lugar nombrado** — la fábrica, bodega, terminal, aeropuerto, puerto, ciudad o centro de distribución que exige el Incoterm elegido.
- **MOQ** — cantidad mínima de orden; una condición del proveedor.
- **Acción del comprador** — algo que un proveedor necesita de ti; abierta hasta que la resuelves.
- **Cotización parcial** — una respuesta comercial a la que le faltan piezas, incluida una sin precio.
- **Evidencia de especificación** — lectura a nivel de parámetro de lo que el proveedor declaró, juzgada contra tu referencia cuando existe.
