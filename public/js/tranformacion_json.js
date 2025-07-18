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

function mapData(json) {
    const resumen = json.resumen || {};
    const cuerpo = (json.cuerpoDocumento || [])[0] || {};
    const proveedor = json.emisor || {};
    const identificacionCod= json.identificacion || {};
    // rama principal
    return {
        "Número": cuerpo.numItem || "",
        "Fecha de Emisión": json.identificacion?.fecEmi || "",
        "Clase de Documento": cuerpo.tipoItem || "",
        "Tipo de Documento": json.identificacion?.tipoDte || "",
        "Número de Documento Codigo": identificacionCod.codigoGeneracion && identificacionCod.codigoGeneracion.trim() !== "" ? `${identificacionCod.codigoGeneracion}` : "N/D",
        "N.R.C": proveedor.nrc ? `${proveedor.nrc}` : "",
        "N.I.T o DUI": proveedor.nit ? `${proveedor.nit}` : "",
        "Nombre del proveedor": proveedor.nombre || "",
        "Compras Exentas": cuerpo.ventaExenta || "0.00",
        "Compras Gravadas": cuerpo.ventaGravada || "0.00",
        "Anticipo a Cuenta IVA Retenido": resumen.ivaRete1 || "0.00",
        "Anticipo a Cuenta IVA Percibido": resumen.ivaPerci1 || "0.00",
        "Total de compras": resumen.totalPagar || "0.00",
        "Compras a Sujetos Excluidos": resumen.totalNoGravado || "0.00"
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

    // Totales
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

    console.log("Data que se exportará a Excel:", JSON.stringify(dataExport, null, 2));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compras");
    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `compras_${fecha}.xlsx`);
}

// Exportar CSV usando punto y coma (;) como separador de columnas (recomendado para ES/LatAm)
function exportarCSV_PuntoYComa() {
    const dataExport = ultimoJson.map(item => {
        const copy = { ...item };
        for (const key in copy) {
            if (isMoneyField(key)) {
                copy[key] = parseFloat(String(copy[key]).replace(",", "").replace(/\$/g, "")) || 0;
            }
        }
        return copy;
    });

    console.log("Data que se exportará a CSV (punto y coma):", JSON.stringify(dataExport, null, 2));

    const ws = XLSX.utils.json_to_sheet(dataExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Compras");

    const fecha = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `compras_${fecha}_puntoycoma.csv`, { bookType: "csv", FS: ";" });
}

function prepararImpresion() {
    const container = document.getElementById("table-container");
    const originalTable = container.querySelector("table");
    if (!originalTable) return alert("No hay tabla para imprimir.");

    const newTable = document.createElement("table");
    newTable.classList.add("table");

    const thead = newTable.createTHead();
    const originalTheadRow = originalTable.tHead.rows[0];
    const newHeadRow = thead.insertRow();
    for (let i = 0; i < originalTheadRow.cells.length; i++) {
        const th = originalTheadRow.cells[i].cloneNode(true);
        newHeadRow.appendChild(th);
    }

    const tbody = newTable.createTBody();
    for (const row of originalTable.tBodies[0].rows) {
        const newRow = tbody.insertRow();
        for (let i = 0; i < row.cells.length; i++) {
            const cell = row.cells[i].cloneNode(true);
            newRow.appendChild(cell);
        }
    }

    const printWindow = window.open("", "", "width=1200,height=800");
    if (!printWindow) {
        alert("Por favor permite ventanas emergentes para imprimir.");
        return;
    }

    printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir Compras</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <style>
          body { font-family: 'Segoe UI', sans-serif; padding: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 2rem; }
          table th, table td { border: 1px solid #dee2e6; padding: 8px; text-align: center; white-space: nowrap; }
          table th { background-color: #7fb3d5 !important; font-weight: bold; }
        </style>
      </head>
      <body>
        <h3>Listado de Compras</h3>
        <div id="tablaCompleta"></div>
      </body>
    </html>
  `);

    printWindow.document.close();

    printWindow.addEventListener('load', () => {
        printWindow.document.getElementById("tablaCompleta").appendChild(newTable);
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    });
}

function limpiarTabla() {
    const container = document.getElementById("table-container");
    container.innerHTML = "";
    ultimoJson = [];
}
