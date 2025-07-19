
let ultimoJson = [];

document.getElementById("file-input").addEventListener("change", handleFiles);
const dropZone = document.getElementById("drop-zone");

dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("hover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("hover");
});

dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("hover");
    const files = Array.from(e.dataTransfer.files);
    if (files.length) parseFiles(files);
});

function handleFiles(e) {
    const files = Array.from(e.target.files);
    if (files.length) parseFiles(files);
}

function parseFiles(files) {
    ultimoJson = []; // Limpiar datos anteriores
    let pending = files.length;

    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
            try {
                const json = JSON.parse(e.target.result);
                const data = mapData(json);
                if (data) ultimoJson.push(data);
            } catch (err) {
                console.error(`Error al leer el archivo: ${file.name}`, err);
                alert(`Error al leer el archivo: ${file.name}`);
            } finally {
                pending--;
                if (pending === 0) {
                    console.log("Contenido de ultimoJson listo para exportar:", JSON.stringify(ultimoJson, null, 2));
                    renderTable(ultimoJson);
                }
            }
        };
        reader.readAsText(file);
    });
}

function toNumber(val) {
    const num = parseFloat(String(val).replace(",", "").replace(/\$/g, "").trim());
    return isNaN(num) ? 0 : num;
}

function mapData(json) {
    const resumen = json.resumen || {};
    const cuerpo = (json.cuerpoDocumento || [])[0] || {};
    const emisor = json.emisor || {};
    const identificacionCod= json.identificacion || {};
    const apendice=json.apendice ||{};
    // modificacion  rama 
     const descripcion = cuerpo.descripcion?.toLowerCase() || "";
    const esCombustible = descripcion.includes("combustible") || descripcion.includes("gasolina") || descripcion.includes("servicio completo") || descripcion.includes("REGULAR");
    const exenta = toNumber(cuerpo.ventaExenta);
    const gravada = toNumber(cuerpo.ventaGravada);
    //firma
    const firma = json.firmaElectronica || {};
    const sello = json.selloRecibido || {};
    return {
         //bloque del json identificacion
        "identificacion version": identificacionCod.version || "",
        "ambiente": identificacionCod.ambiente || "",
        "tipoDte": identificacionCod.tipoDte || "",  
        "numeroControl": identificacionCod.numeroControl || "",  
        "codigoGeneracion": identificacionCod.codigoGeneracion || "",  
        "tipoModelo": identificacionCod.tipoModelo || "",  
        "tipoOperacion": identificacionCod.tipoOperacion || "",
        "tipoOperacion": identificacionCod.tipoOperacion || "",
        "tipoContingencia": identificacionCod.tipoContingencia || "",
        "motivoContin": identificacionCod.motivoContin || "",
        "fecEmi": identificacionCod.fecEmi || "",
        "horEmi": identificacionCod.horEmi || "",
        "tipoMoneda": identificacionCod.tipoMoneda || "",
        //emisor documentoRelacionado
        "documentoRelacionado": json.documentoRelacionado?.documentoRelacionado || "",
        //emisor
        "emisor nit": json.emisor?.emisor || "",
        "nrc": json.emisor?.nrc || "",
        "nombre": json.documentoRelacionado?.nombre || "",
        "codActividad": json.emisor?.codActividad || "",
        "descActividad": json.emisor?.descActividad || "",
        "nombreComercial": json.emisor?.nombreComercial || "",
        "tipoEstablecimiento": json.emisor?.tipoEstablecimiento || "",
        "direccion departamento ": json.emisor.direccion?.departamento || "",
        "municipio": json.emisor.direccion?.municipio || "",
        "complemento": json.emisor.direccion?.complemento || "",
        "telefono": json.emisor?.telefono || "",
        "correo": json.emisor?.correo || "",
        "codEstableMH": json.emisor?.codEstableMH || "",
        "codEstable": json.emisor?.codEstable || "",
        "codPuntoVentaMH": json.emisor?.codPuntoVentaMH || "",
        "codPuntoVenta": json.emisor?.codPuntoVenta || "",
        //receptor
        "receptor nit": json.receptor?.nit || "",
        "nrc ": json.receptor?.nrc || "",
        "nombre": json.receptor?.nombre || "",
        "direccion departamento": json.receptor.direccion?.departamento || "",
        "municipio": json.receptor.direccion?.municipio || "",
        "complemento": json.receptor.direccion?.complemento || "",
        "telefono": json.receptor?.telefono || "",
        "correo": json.receptor?.correo || "",
        "correo": json.receptor?.correo || "",
        "otrosDocumentos": json.otrosDocumentos?.otrosDocumentos || "",
        "ventaTercero": json.ventaTercero?.ventaTercero || "",
        //cuerpoDocumento
        "cuerpoDocumento numItem": json.cuerpoDocumento?.numItem || "",
        "tipoItem": json.cuerpoDocumento?.tipoItem || "",      
        "numeroDocumento": json.cuerpoDocumento?.numeroDocumento || "",
        "codigo": json.cuerpoDocumento?.codigo || "",
        "codTributo": json.cuerpoDocumento?.codTributo || "",
        "descripcion": json.cuerpoDocumento?.descripcion || "",
        "cantidad": json.cuerpoDocumento?.cantidad || "",
        "uniMedida": json.cuerpoDocumento?.uniMedida || "",
        "precioUni": json.cuerpoDocumento?.precioUni || "",
        "montoDescu": json.cuerpoDocumento?.montoDescu || "",
        "ventaNoSuj": json.cuerpoDocumento?.ventaNoSuj || "",
        "ventaExenta": json.cuerpoDocumento?.ventaExenta || "",
        "ventaGravada": json.cuerpoDocumento?.ventaGravada || "",
      "tributos": Array.isArray(cuerpo.tributos)?cuerpo.tributos.map(t => {
      if (typeof t === 'object' && t !== null) {
        return t.codigo || JSON.stringify(t);
      }
      return t;}).join(", "): "",
        "psv": json.cuerpoDocumento?.psv || "",
        "noGravado": json.cuerpoDocumento?.noGravado || "",
        
         //resumen
        "resumen totalNoSuj ": json.resumen?.totalNoSuj || "",
        "Compras Exentas": esCombustible?"0.00" : exenta.toFixed(2),
        "Compras Gravadas": esCombustible?(exenta + gravada).toFixed(2) : gravada.toFixed(2),
        "subTotalVentas": json.resumen?.subTotalVentas || "",
        "descuNoSuj": json.resumen?.descuNoSuj || "",
        "descuExenta": json.resumen?.descuExenta || "",
        "descuGravada": json.resumen?.descuGravada || "",
        "porcentajeDescuento": json.resumen?.porcentajeDescuento || "",     
        "totalDescu": json.resumen?.totalDescu || "",     
       "tributos": Array.isArray(resumen.tributos) ? resumen.tributos.join(", ") : "",    
        "subTotal": json.resumen?.subTotal || "",    
       "Anticipo a Cuenta IVA Retenido": resumen.ivaRete1 || "0.00",
        "Anticipo a Cuenta IVA Percibido": resumen.ivaPerci1 || "0.00",      
        "reteRenta": json.resumen?.porcentajeDescuento || "",     
        "montoTotalOperacion": json.resumen?.montoTotalOperacion || "",     
        "totalNoGravado": json.resumen?.totalNoGravado || "",     

        "totalLetras": json.resumen?.totalLetras || "",
        "saldoFavor": json.resumen?.ventaExenta || "",
        "condicionOperacion": json.resumen?.condicionOperacion || "",
        "tributos": Array.isArray(resumen.pagos) ? resumen.pagos.join(", ") : "", 
        "numPagoElectronico": json.resumen?.numPagoElectronico || "",
        "Compras a Sujetos Excluidos": resumen.totalNoGravado || "0.00",
       "Es Combustible": esCombustible?"Sí" : "No",
         "Total de compras": resumen.totalPagar || "0.00",
        //extension
        "extension nombEntrega ": json.extension?.nombEntrega || "",
        "docuEntrega": json.extension?.docuEntrega || "", 
        "nombRecibe": json.extension?.nombRecibe || "", 
        "docuRecibe": json.extension?.docuRecibe || "", 
        "observaciones": json.extension?.observaciones || "", 
        "placaVehiculo": json.extension?.placaVehiculo || "", 
        //apendice
       "Documento Interno": (json.apendice?.find(a => a.campo === "DocInterno")?.valor) || "",
        "CodigoVendedor": (json.apendice?.find(a => a.campo === "CodVendedor")?.valor) || "",
        "NombreVendedor": (json.apendice?.find(a => a.campo === "NomVendedor")?.valor) || "",
        "CodigoCliente": (json.apendice?.find(a => a.campo === "CodCliente")?.valor) || "",

        "firmaElectronica":  JSON.stringify(firma) || "error",
        "selloRecibido": JSON.stringify(sello) || "error"
       
    };
   
}


function renderTable(data) {
    const container = document.getElementById("table-container");
    container.innerHTML = "";

    if (!data || data.length === 0) {
        container.textContent = "No hay datos que mostrar.";
        return;
    }

    const table = document.createElement("table");
    table.classList.add("table");

    const headers = Object.keys(data[0]);
    const thead = table.createTHead();
    const headerRow = thead.insertRow();

    headers.forEach(header => {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    });

    const tbody = table.createTBody();
    data.forEach(item => {
        const row = tbody.insertRow();
        headers.forEach(key => {
            const cell = row.insertCell();
            if (isMoneyField(key)) {
                cell.textContent = formatCurrency(item[key]);
            } else {
                cell.textContent = String(item[key]);
            }
        });
    });

    const totalRow = tbody.insertRow();
    headers.forEach(key => {
        const cell = totalRow.insertCell();
        const camposSumables = [
            "Compras Exentas",
            "Compras Gravadas",
            "Anticipo a Cuenta IVA Retenido",
            "Anticipo a Cuenta IVA Percibido",
            "Total de compras",
            "Compras a Sujetos Excluidos"
        ];

        if (camposSumables.includes(key)) {
            const suma = data.reduce((acc, item) => {
                const val = parseFloat(String(item[key]).replace(",", "").replace(/\$/g, "")) || 0;
                return acc + val;
            }, 0);
            cell.textContent = formatCurrency(suma);
            cell.style.fontWeight = "bold";
        } else if (key === "Número") {
            cell.textContent = "Totales:";
            cell.style.fontWeight = "bold";
        } else {
            cell.textContent = "";
        }
    });

    container.appendChild(table);
}

function isMoneyField(key) {
    const camposMoneda = [
        "Compras Exentas",
        "Compras Gravadas",
        "Anticipo a Cuenta IVA Retenido",
        "Anticipo a Cuenta IVA Percibido",
        "Total de compras",
        "Compras a Sujetos Excluidos"
    ];
    return camposMoneda.includes(key);
}

function formatCurrency(value) {
    let num = parseFloat(String(value).replace(",", "").replace(/\$/g, ""));
    if (isNaN(num)) num = 0;
    return "$ " + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function exportarExcel() {
    const dataExport = ultimoJson.map(item => {
        const copy = { ...item };
        for (const key in copy) {
            if (isMoneyField(key)) {
                copy[key] = parseFloat(String(copy[key]).replace(",", "").replace(/\$/g, "")) || 0;
            }
        }
        return copy;
    });

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compras");
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `compras_${fecha}.xlsx`);
}
function exportarCSV_PuntoYComa() {
    if (!ultimoJson || ultimoJson.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }

    const headers = Object.keys(ultimoJson[0]);
    const csvRows = [];

    // Encabezados
    csvRows.push(headers.join(";"));

    // Filas de datos
    ultimoJson.forEach(row => {
        const values = headers.map(header => {
            let cell = row[header];

            // Eliminar formato monetario si aplica
            if (isMoneyField(header)) {
                cell = String(cell).replace(/\$/g, "").replace(/,/g, "").trim();
            }

            // Escapar comillas dobles
            if (typeof cell === "string" && cell.includes('"')) {
                cell = cell.replace(/"/g, '""');
            }

            // Encerrar en comillas si contiene punto y coma
            if (typeof cell === "string" && cell.includes(";")) {
                cell = `"${cell}"`;
            }

            return cell;
        });
        csvRows.push(values.join(";"));
    });

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fecha = new Date().toISOString().split("T")[0];
    const filename = `compras_${fecha}.csv`;

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
