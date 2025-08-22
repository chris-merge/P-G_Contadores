// Plantilla base para el JSON
const jsonTemplate = {
  "identificacion": {
    "version": "",
    "ambiente": "",
    "tipoDte": "",
    "numeroControl": "",
    "codigoGeneracion": "",
    "tipoModelo": "",
    "tipoOperacion": "",
    "tipoContingencia": null,
    "motivoContin": null,
    "fecEmi": "",
    "horEmi": "",
    "tipoMoneda": ""
  },
  "documentoRelacionado": null,
  "emisor": {
    "nit": "",
    "nrc": "",
    "nombre": "",
    "codActividad": "",
    "descActividad": "",
    "nombreComercial": "",
    "tipoEstablecimiento": "",
    "direccion": { "departamento": "", "municipio": "", "complemento": "" },
    "telefono": "",
    "correo": "",
    "codEstableMH": "",
    "codEstable": null,
    "codPuntoVentaMH": "",
    "codPuntoVenta": null
  },
  "receptor": {
    "nit": "",
    "nrc": "",
    "nombre": "",
    "codActividad": "",
    "descActividad": "",
    "nombreComercial": null,
    "direccion": { "departamento": "", "municipio": "", "complemento": "" },
    "telefono": "",
    "correo": ""
  },
  "otrosDocumentos": null,
  "ventaTercero": null,
  "cuerpoDocumento": [
    {
      "numItem": "",
      "tipoItem": "",
      "numeroDocumento": null,
      "codigo": null,
      "codTributo": null,
      "descripcion": "",
      "cantidad": "",
      "uniMedida": "",
      "precioUni": "",
      "montoDescu": "",
      "ventaNoSuj": "",
      "ventaExenta": "",
      "ventaGravada": "",
      "tributos": ["", "", ""],
      "psv": "",
      "noGravado": ""
    }
  ],
  "resumen": {
    "totalNoSuj": "",
    "totalExenta": "",
    "totalGravada": "",
    "subTotalVentas": "",
    "descuNoSuj": "",
    "descuExenta": "",
    "descuGravada": "",
    "porcentajeDescuento": "",
    "totalDescu": "",
    "tributos": [
      { "codigo": "", "descripcion": "", "valor": "" },
      { "codigo": "", "descripcion": "", "valor": "" },
      { "codigo": "", "descripcion": "", "valor": "" }
    ],
    "subTotal": "",
    "ivaPerci1": "",
    "ivaRete1": "",
    "reteRenta": "",
    "montoTotalOperacion": "",
    "totalNoGravado": "",
    "totalPagar": "",
    "totalLetras": "",
    "saldoFavor": "",
    "condicionOperacion": "",
    "pagos": [{ "codigo": "", "montoPago": "", "plazo": "", "referencia": null, "periodo": "" }],
    "numPagoElectronico": null
  },
  "extension": {
    "nombEntrega": null,
    "docuEntrega": null,
    "nombRecibe": null,
    "docuRecibe": null,
    "observaciones": "",
    "placaVehiculo": null
  },
  "apendice": [
    { "campo": "", "etiqueta": "", "valor": "" },
    { "campo": "", "etiqueta": "", "valor": "" },
    { "campo": "", "etiqueta": "", "valor": "" },
    { "campo": "", "etiqueta": "", "valor": "" }
  ],
  "firmaElectronica": "",
  "selloRecibido": ""
};

function addFileToTable(file){
    // Generar JSON dinámico a partir de la plantilla
    const jsonData = { ...jsonTemplate };
    jsonData.identificacion.version = "1.0";
    jsonData.identificacion.fecEmi = new Date().toISOString().split("T")[0];
    jsonData.identificacion.horEmi = new Date().toLocaleTimeString();
    jsonData.emisor.nombre = "Empresa Ejemplo";
    jsonData.receptor.nombre = "Cliente Ejemplo";
    jsonData.cuerpoDocumento[0].descripcion = file.name;
    jsonData.cuerpoDocumento[0].cantidad = "1";

    // Crear blob para descarga
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const row=document.createElement('tr');
    row.innerHTML=`
        <td class="px-4 py-2 text-sm text-gray-800">${file.name}</td>
        <td class="px-4 py-2 text-sm text-gray-500">${formatFileSize(file.size)}</td>
        <td class="px-4 py-2 text-center">
            <a href="${url}" download="${file.name.replace('.pdf','')}.json"
               class="bg-blue-600 hover:bg-blue-700 text-white py-1 px-3 rounded text-sm">
                <i class="fas fa-download mr-1"></i> Descargar JSON
            </a>
        </td>
    `;
    tableBody.appendChild(row);
    uploadedTable.classList.remove('hidden');
}
