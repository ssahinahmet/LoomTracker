const baseURL = "http://45.150.149.84:5000";

document.addEventListener("DOMContentLoaded", () => {
  fetchOperators();

  document.getElementById("addForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const pin = document.getElementById("pin").value.trim();

    if (!/^\d{8}$/.test(pin)) {
      return alert("PIN 8 haneli rakam olmalı.");
    }

    const operator_id = localStorage.getItem("_id"); // Olmasa da sorun olmaz

    const payload = { name, pin };
    if (operator_id) payload.operator_id = operator_id;

    try {
      const response = await fetch(`${baseURL}/api/operator`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("Operatör başarıyla eklendi.");
        document.getElementById("addForm").reset();
        fetchOperators();
      } else {
        showMessage(result.message || "Bir hata oluştu.");
      }
    } catch (err) {
      console.error(err);
      showMessage("Sunucu hatası.");
    }
  });

  document.getElementById("deactivateBtn").addEventListener("click", async () => {
    const selectedPin = document.getElementById("operatorList").value;
    if (!selectedPin) return showMessage("Lütfen bir operatör seçin.");

    try {
      const response = await fetch(`${baseURL}/api/operator/deactivate/${selectedPin}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });

      const result = await response.json();

      if (response.ok) {
        showMessage("Operatör işten çıkarıldı (pasif edildi).");
        fetchOperators();
      } else {
        showMessage(result.message || "İşten çıkarma başarısız.");
      }
    } catch (err) {
      console.error(err);
      showMessage("Sunucu hatası.");
    }
  });
});

async function fetchOperators() {
  try {
    const res = await fetch(baseURL + "/api/operators");
    const data = await res.json();

    const select = document.getElementById("operatorList");
    select.innerHTML = "";

    if (!data.length) {
      const option = document.createElement("option");
      option.textContent = "Hiç operatör yok.";
      option.disabled = true;
      option.selected = true;
      select.appendChild(option);
      return;
    }

    data.forEach((op) => {
      const option = document.createElement("option");
      option.value = op.pin;
      option.textContent = `${op.name} (${op.pin})${op.isActive === false ? " (İşten Çıkarıldı)" : ""}`;
      if (op.isActive === false) {
        option.disabled = true; // Pasif operatör seçilemesin
      }
      select.appendChild(option);
    });
  } catch (err) {
    console.error(err);
    showMessage("Operatörler yüklenemedi.");
  }
}

function showMessage(msg) {
  document.getElementById("message").textContent = msg;
}
