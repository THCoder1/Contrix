const form = {
  contractDate: document.getElementById("contractDate"),
  contractTime: document.getElementById("contractTime"),
  contractLocation: document.getElementById("contractLocation"),

  buyerName: document.getElementById("buyerName"),
  buyerDni: document.getElementById("buyerDni"),
  buyerPhone: document.getElementById("buyerPhone"),
  buyerAddress: document.getElementById("buyerAddress"),
  buyerCity: document.getElementById("buyerCity"),
  buyerPostalCode: document.getElementById("buyerPostalCode"),
  buyerProvince: document.getElementById("buyerProvince"),
  buyerEmail: document.getElementById("buyerEmail"),

  vehicleMake: document.getElementById("vehicleMake"),
  vehicleModel: document.getElementById("vehicleModel"),
  vehicleRegistration: document.getElementById("vehicleRegistration"),
  vehicleVin: document.getElementById("vehicleVin"),
  vehicleMileage: document.getElementById("vehicleMileage"),
  vehicleFirstRegistration: document.getElementById(
    "vehicleFirstRegistration"
  ),

  salePrice: document.getElementById("salePrice"),

  buyerInspected: document.getElementById("buyerInspected"),
  buyerTested: document.getElementById("buyerTested"),
  buyerAcceptsCondition: document.getElementById(
    "buyerAcceptsCondition"
  ),

  generateContract: document.getElementById("generateContract"),
};

function setCurrentContractDateTime() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  form.contractDate.value = `${year}-${month}-${day}`;
  form.contractTime.value = `${hours}:${minutes}`;
}

setCurrentContractDateTime();

function formatSpanishDate(dateValue) {
  if (!dateValue) {
    return {
      day: "",
      month: "",
      year: "",
    };
  }

  const [year, month, day] = dateValue.split("-");

  const months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre",
  ];

  return {
    day,
    month: months[Number(month) - 1],
    year,
  };
}

function numberToSpanishWords(number) {
  const units = [
    "cero",
    "uno",
    "dos",
    "tres",
    "cuatro",
    "cinco",
    "seis",
    "siete",
    "ocho",
    "nueve",
  ];

  const teens = [
    "diez",
    "once",
    "doce",
    "trece",
    "catorce",
    "quince",
    "dieciséis",
    "diecisiete",
    "dieciocho",
    "diecinueve",
  ];

  const tens = [
    "",
    "",
    "veinte",
    "treinta",
    "cuarenta",
    "cincuenta",
    "sesenta",
    "setenta",
    "ochenta",
    "noventa",
  ];

  const hundreds = [
    "",
    "ciento",
    "doscientos",
    "trescientos",
    "cuatrocientos",
    "quinientos",
    "seiscientos",
    "setecientos",
    "ochocientos",
    "novecientos",
  ];

  function convertBelowThousand(value) {
    if (value < 10) {
      return units[value];
    }

    if (value < 20) {
      return teens[value - 10];
    }

    if (value < 30) {
      if (value === 20) return "veinte";

      const unit = value - 20;
      return `veinti${units[unit]}`;
    }

    if (value < 100) {
      const ten = Math.floor(value / 10);
      const unit = value % 10;

      if (unit === 0) {
        return tens[ten];
      }

      return `${tens[ten]} y ${units[unit]}`;
    }

    if (value < 1000) {
      const hundred = Math.floor(value / 100);
      const remainder = value % 100;

      if (value === 100) {
        return "cien";
      }

      if (remainder === 0) {
        return hundreds[hundred];
      }

      return `${hundreds[hundred]} ${convertBelowThousand(remainder)}`;
    }

    return "";
  }

  if (!Number.isFinite(number) || number < 0) {
    return "";
  }

  if (number === 0) {
    return "cero";
  }

  if (number >= 1_000_000) {
    const millions = Math.floor(number / 1_000_000);
    const remainder = number % 1_000_000;

    const millionText =
      millions === 1
        ? "un millón"
        : `${numberToSpanishWords(millions)} millones`;

    if (remainder === 0) {
      return millionText;
    }

    return `${millionText} ${numberToSpanishWords(remainder)}`;
  }

  if (number >= 1000) {
    const thousands = Math.floor(number / 1000);
    const remainder = number % 1000;

    const thousandText =
      thousands === 1
        ? "mil"
        : `${numberToSpanishWords(thousands)} mil`;

    if (remainder === 0) {
      return thousandText;
    }

    return `${thousandText} ${convertBelowThousand(remainder)}`;
  }

  return convertBelowThousand(number);
}


function formatSpanishCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return {
      formatted: "",
      words: "",
    };
  }

  const euros = Math.floor(amount);
  const cents = Math.round((amount - euros) * 100);

  const formatted = new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

  let words = numberToSpanishWords(euros);

  // Correct Spanish monetary form:
  if (euros === 1) {
    words = "un";
  } else if (words.endsWith("uno")) {
    words = `${words.slice(0, -3)}un`;
  }

  words += euros === 1 ? " euro" : " euros";

  if (cents > 0) {
    words += ` con ${numberToSpanishWords(cents)}`;
    words += cents === 1 ? " céntimo" : " céntimos";
  }

  return {
    formatted,
    words,
  };
}

function formatDisplayDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  const [year, month, day] = dateValue.split("-");

  if (!year || !month || !day) {
    return dateValue;
  }

  return `${day}/${month}/${year}`;
}

async function getContractData() {
  return {
  seller: await window.contractAPI.getSeller(),

  contract: {
  date: form.contractDate.value,
  time: form.contractTime.value,
  location: form.contractLocation.value.trim(),
  ...formatSpanishDate(form.contractDate.value),
},

    buyer: {
      name: form.buyerName.value.trim(),
      dni: form.buyerDni.value.trim(),
      phone: form.buyerPhone.value.trim(),
      address: form.buyerAddress.value.trim(),
      city: form.buyerCity.value.trim(),
      postalCode: form.buyerPostalCode.value.trim(),
      province: form.buyerProvince.value.trim(),
      email: form.buyerEmail.value.trim(),
    },

    vehicle: {
  make: form.vehicleMake.value.trim(),
  model: form.vehicleModel.value.trim(),
  registration: form.vehicleRegistration.value.trim(),
  vin: form.vehicleVin.value.trim(),
  mileage: form.vehicleMileage.value,
  firstRegistration: formatDisplayDate(
    form.vehicleFirstRegistration.value
  ),
},

    sale: {
  price: form.salePrice.value,
  priceFormatted: formatSpanishCurrency(form.salePrice.value).formatted,
  priceInWords: formatSpanishCurrency(form.salePrice.value).words,
},

    declarations: {
  inspected: form.buyerInspected.checked,
  tested: form.buyerTested.checked,
  acceptsCondition: form.buyerAcceptsCondition.checked,

  inspectedMark: form.buyerInspected.checked ? "✓" : "",
  testedMark: form.buyerTested.checked ? "✓" : "",
  acceptsConditionMark: form.buyerAcceptsCondition.checked ? "✓" : "",
},
  }
}


function validateContractData(data) {
  const errors = [];

  if (!data.contract.date) {
    errors.push("La fecha del contrato es obligatoria.");
  }

  if (!data.contract.time) {
    errors.push("La hora del contrato es obligatoria.");
  }

  if (!data.buyer.name) {
    errors.push("El nombre y apellidos del comprador son obligatorios.");
  }

  if (!data.buyer.dni) {
    errors.push("El DNI / NIE del comprador es obligatorio.");
  }

  if (!data.buyer.address) {
    errors.push("La dirección del comprador es obligatoria.");
  }

  if (!data.vehicle.make) {
    errors.push("La marca del vehículo es obligatoria.");
  }

  if (!data.vehicle.model) {
    errors.push("El modelo del vehículo es obligatorio.");
  }

  if (!data.vehicle.registration) {
    errors.push("La matrícula del vehículo es obligatoria.");
  }

  if (!data.vehicle.vin) {
    errors.push("El número de bastidor es obligatorio.");
  }

  if (!data.sale.price) {
    errors.push("El precio de la compraventa es obligatorio.");
  }

  if (!data.declarations.inspected) {
    errors.push(
      "Debe confirmarse que el comprador ha examinado personalmente y directamente el vehículo."
    );
  }

  if (!data.declarations.tested) {
    errors.push(
      "Debe confirmarse que el comprador ha probado el vehículo."
    );
  }

  if (!data.declarations.acceptsCondition) {
    errors.push(
      "Debe confirmarse que el comprador está conforme con el estado interior y exterior del vehículo."
    );
  }

  return errors;
}

    form.generateContract.addEventListener("click", async () => {
  try {
    const contractData = await getContractData();

    const errors = validateContractData(contractData);

    if (errors.length > 0) {
      console.error("Contrato incompleto:", errors);
      return;
    }

    const contractHtml =
      await window.contractAPI.renderContract(contractData);

    await window.contractAPI.previewContract(contractHtml);

    console.log("Contrato renderizado correctamente.");
  } catch (error) {
    console.error("Error al renderizar el contrato:", error);
  }
});