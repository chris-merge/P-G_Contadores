
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
    const proveedor = json.emisor || {};
    const identificacionCod= json.identificacion || {};
    // modificacion  rama 

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
