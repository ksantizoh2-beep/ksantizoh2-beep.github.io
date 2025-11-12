// ====== Datos de productos (puedes editar precios/URLs) ======
const CATALOGO = [
  { id: "laptop",   nombre: "Laptop Gamer RTX",   precio: 950, img: "./accest/lap.jpeg" },
  { id: "audifonos",nombre: "airpods", precio: 45, img: "./accest/Audifonos.jpeg" },
  { id: "mouse",    nombre: "Mouse Gamer RGB",    precio: 25,  img: "./accest/mouse.jpeg" },
  { id: "teclado",  nombre: "Teclado Mecánico",   precio: 60,  img: "./accest/teclado.jpeg" },
  { id: "monitor",  nombre: "Monitor 24” 75Hz",   precio: 180, img: "./accest/monitor.jpeg" }
];


// ====== Estado (carrito en localStorage) ======
const STORAGE_KEY = "kindgls_cart";
let carrito = leerCarrito();

// ====== Inicio ======
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btnIngresar").addEventListener("click", validarLogin);
  renderProductos();

  document.getElementById("btnAbrirCarrito").addEventListener("click", abrirCarrito);
  document.getElementById("btnCerrarCarrito").addEventListener("click", cerrarCarrito);

  document.getElementById("envio").addEventListener("change", actualizarTotales);
  document.getElementById("btnFinalizar").addEventListener("click", finalizarCompra);

  actualizarCarritoUI();
});

// ====== Login ======
function validarLogin() {
  const usuario = document.getElementById('usuario').value.trim();
  const clave = document.getElementById('clave').value.trim();

  if (usuario === 'alumno' && clave === '2025') {
    document.getElementById('msgLogin').textContent = '';
    document.getElementById('seccionCompra').classList.remove('oculto');
    document.getElementById('seccionLogin').classList.add('oculto');
    document.getElementById('seccionCompra').scrollIntoView({ behavior: 'smooth' });
  } else {
    document.getElementById('msgLogin').textContent =
      'Usuario o contraseña incorrectos (debe ser alumno / 2025)';
  }
}

// ====== Catálogo ======
function renderProductos() {
  const grid = document.getElementById("gridProductos");
  grid.innerHTML = "";

  CATALOGO.forEach(p => {
    const card = document.createElement("article");
    card.className = "producto";
    card.innerHTML = `
      <img class="prod-img" src="${p.img}" alt="${p.nombre}">
      <div class="prod-txt">
        <h3>${p.nombre}</h3>
        <div class="precio">Q${p.precio.toFixed(2)}</div>
      </div>
      <div class="prod-act">
        <button class="btn-add" data-id="${p.id}">Agregar al carrito</button>
        <div class="qty">
          <button class="menos" aria-label="menos" data-id="${p.id}">–</button>
          <input type="number" min="1" value="1" id="qty-${p.id}">
          <button class="mas" aria-label="más" data-id="${p.id}">+</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.addEventListener("click", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("btn-add")) {
      const qtyInput = document.getElementById(`qty-${id}`);
      const cantidad = Math.max(1, parseInt(qtyInput.value || "1", 10));
      agregarAlCarrito(id, cantidad);
    }
    if (e.target.classList.contains("mas")) {
      const qtyInput = document.getElementById(`qty-${id}`);
      qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) + 1);
    }
    if (e.target.classList.contains("menos")) {
      const qtyInput = document.getElementById(`qty-${id}`);
      qtyInput.value = Math.max(1, parseInt(qtyInput.value || "1", 10) - 1);
    }
  });
}

// ====== Carrito: persistencia ======
function leerCarrito(){ try{ const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : []; }catch(_){ return []; } }
function guardarCarrito(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(carrito)); }

// ====== Carrito: operaciones ======
function agregarAlCarrito(id, cantidad=1){
  const prod = CATALOGO.find(p=>p.id===id);
  if(!prod) return;
  const idx = carrito.findIndex(i=>i.id===id);
  if(idx>=0){ carrito[idx].cantidad += cantidad; }
  else{ carrito.push({id: prod.id, nombre: prod.nombre, precio: prod.precio, img: prod.img, cantidad}); }
  guardarCarrito(); actualizarCarritoUI(); abrirCarrito();
}
function cambiarCantidad(id, delta){
  const item = carrito.find(i=>i.id===id);
  if(!item) return;
  item.cantidad += delta;
  if(item.cantidad<=0){ eliminarItem(id); return; }
  guardarCarrito(); actualizarCarritoUI();
}
function setCantidad(id, val){
  const item = carrito.find(i=>i.id===id);
  if(!item) return;
  const n = Math.max(1, parseInt(val||"1",10));
  item.cantidad = n;
  guardarCarrito(); actualizarCarritoUI();
}
function eliminarItem(id){
  carrito = carrito.filter(i=>i.id!==id);
  guardarCarrito(); actualizarCarritoUI();
}

// ====== Carrito: UI ======
function abrirCarrito(){ document.getElementById("carritoPanel").classList.add("open"); }
function cerrarCarrito(){ document.getElementById("carritoPanel").classList.remove("open"); }

function actualizarCarritoUI(){
  const lista = document.getElementById("carritoLista");
  lista.innerHTML = "";

  if(carrito.length===0){
    lista.innerHTML = `<p style="color:#9fb2d6">Tu carrito está vacío.</p>`;
  }else{
    carrito.forEach(it=>{
      const row = document.createElement("div");
      row.className = "carrito-item";
      row.innerHTML = `
        <img class="car-img" src="${it.img}" alt="${it.nombre}">
        <div class="car-info">
          <b>${it.nombre}</b>
          <span>Q${it.precio.toFixed(2)}</span>
          <div class="car-qty">
            <button data-op="menos" data-id="${it.id}">–</button>
            <input type="number" min="1" value="${it.cantidad}" data-op="set" data-id="${it.id}">
            <button data-op="mas" data-id="${it.id}">+</button>
          </div>
        </div>
        <button class="btn-del" data-op="del" data-id="${it.id}">Eliminar</button>
      `;
      lista.appendChild(row);
    });

    lista.onclick = (e)=>{
      const id = e.target.dataset.id;
      const op = e.target.dataset.op;
      if(!id || !op) return;
      if(op==="menos") cambiarCantidad(id,-1);
      if(op==="mas") cambiarCantidad(id, 1);
      if(op==="del") eliminarItem(id);
    };
    lista.onchange = (e)=>{
      const id = e.target.dataset.id;
      const op = e.target.dataset.op;
      if(op==="set") setCantidad(id, e.target.value);
    };
  }

  const count = carrito.reduce((s,i)=>s+i.cantidad,0);
  document.getElementById("carritoBadge").textContent = count;

  actualizarTotales();
}

function actualizarTotales(){
  const envio = parseFloat(document.getElementById("envio").value || "0");
  const subtotal = carrito.reduce((s,i)=>s + i.precio*i.cantidad, 0);
  const total = subtotal + envio;

  document.getElementById("txtSubtotal").textContent = "Q"+subtotal.toFixed(2);
  document.getElementById("txtEnvio").textContent = "Q"+envio.toFixed(2);
  document.getElementById("txtTotal").textContent = "Q"+total.toFixed(2);
}

// ====== Generar Factura PDF ======
function generarFacturaPDF(items, envio, subtotal, total, metodoPago) {
  // jsPDF global
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-GT', { year:'numeric', month:'2-digit', day:'2-digit' });
  const hora  = ahora.toLocaleTimeString('es-GT', { hour:'2-digit', minute:'2-digit' });
  const facturaNo = "KGLS-" + ahora.getFullYear().toString().slice(-2)
                  + (ahora.getMonth()+1).toString().padStart(2,'0')
                  + ahora.getDate().toString().padStart(2,'0')
                  + "-" + ahora.getHours().toString().padStart(2,'0')
                  + ahora.getMinutes().toString().padStart(2,'0')
                  + ahora.getSeconds().toString().padStart(2,'0');

  // Encabezado
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("FACTURA", 105, 18, { align: "center" });

  doc.setFontSize(12);
  doc.text("KIND GLS Electronics", 14, 28);
  doc.setFont("helvetica", "normal");
  doc.text("NIT: CF", 14, 34);
  doc.text("Ciudad de Guatemala", 14, 40);

  doc.setFont("helvetica", "bold");
  doc.text(`Factura No.: ${facturaNo}`, 200-14, 28, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.text(`Fecha: ${fecha}  ${hora}`, 200-14, 34, { align: "right" });
  doc.text(`Método de pago: ${metodoPago}`, 200-14, 40, { align: "right" });

  // Cliente (demo)
  doc.setFont("helvetica", "bold");
  doc.text("Cliente:", 14, 52);
  doc.setFont("helvetica", "normal");
  doc.text("alumno", 35, 52);

  // Tabla simple
  let y = 64;
  doc.setFont("helvetica", "bold");
  doc.text("Cant.", 14, y);
  doc.text("Descripción", 34, y);
  doc.text("P. Unit.", 140, y, { align: "right" });
  doc.text("Subtotal", 200-14, y, { align: "right" });
  doc.setLineWidth(0.5);
  doc.line(14, y+2, 200-14, y+2);
  y += 8;

  doc.setFont("helvetica", "normal");
  items.forEach(it => {
    const sub = it.cantidad * it.precio;
    // salto de página si es necesario
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(String(it.cantidad), 14, y);
    doc.text(it.nombre, 34, y);
    doc.text(`Q${it.precio.toFixed(2)}`, 140, y, { align: "right" });
    doc.text(`Q${sub.toFixed(2)}`, 200-14, y, { align: "right" });
    y += 8;
  });

  // Totales
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setLineWidth(0.2);
  doc.line(120, y+3, 200-14, y+3);
  y += 10;

  doc.text("Subtotal:", 140, y, { align: "right" });
  doc.text(`Q${subtotal.toFixed(2)}`, 200-14, y, { align: "right" }); y += 7;

  doc.text("Envío:", 140, y, { align: "right" });
  doc.text(`Q${envio.toFixed(2)}`, 200-14, y, { align: "right" }); y += 7;

  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", 140, y, { align: "right" });
  doc.text(`Q${total.toFixed(2)}`, 200-14, y, { align: "right" }); y += 12;

  // Nota
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Gracias por su compra. Este documento es una representación impresa.", 14, y);

  // Descargar
  doc.save(`Factura_${facturaNo}.pdf`);
}

// ====== Finalizar ======
function finalizarCompra(){
  if(carrito.length===0){
    alert("Tu carrito está vacío.");
    return;
  }
  const envio = parseFloat(document.getElementById("envio").value || "0");
  const metodoPago = document.querySelector('input[name="pago"]:checked')?.value || "Tarjeta";
  const subtotal = carrito.reduce((s,i)=>s + i.precio*i.cantidad, 0);
  const total = subtotal + envio;

  // Copia del carrito para la factura antes de limpiar
  const itemsFactura = carrito.map(i => ({...i}));

  // Mostrar resumen en la página (opcional)
  const detalle = carrito.map(i=>`${i.cantidad} x ${i.nombre} (Q${i.precio.toFixed(2)})`).join("<br>");
  document.getElementById("seccionFin").classList.remove("oculto");
  document.getElementById("resumen").innerHTML =
    `Gracias por su compra.<br><br>${detalle}<br>Envío: Q${envio.toFixed(2)}<br><strong>Total: Q${total.toFixed(2)}</strong>`;

  // Generar PDF
  try {
    generarFacturaPDF(itemsFactura, envio, subtotal, total, metodoPago);
  } catch (e) {
    console.error("No se pudo generar el PDF:", e);
    alert("La compra se realizó, pero ocurrió un problema generando el PDF.");
  }

  // Limpiar carrito y UI
  carrito = [];
  guardarCarrito();
  actualizarCarritoUI();
  cerrarCarrito();
  window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"});
}