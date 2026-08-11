const { contextBridge, ipcRenderer } = require("electron");

const previewAPI = {
  savePdf: () =>
    ipcRenderer.invoke("contract:request-save-pdf"),
};

contextBridge.exposeInMainWorld("previewAPI", previewAPI);

window.addEventListener("DOMContentLoaded", () => {
  const toolbar = document.createElement("div");

  toolbar.id = "contract-toolbar";

  toolbar.innerHTML = `
    <button id="save-pdf-button" type="button">
      Guardar PDF
    </button>
  `;

  const style = document.createElement("style");

  style.textContent = `
    #contract-toolbar {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 999999;
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      padding: 0 18px;
      background: #14233b;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.18);
    }

    #save-pdf-button {
      border: 0;
      border-radius: 6px;
      padding: 9px 18px;
      background: #ffffff;
      color: #14233b;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
    }

    #save-pdf-button:hover {
      background: #f3f4f6;
    }
  `;

  document.head.appendChild(style);
  document.body.prepend(toolbar);

  document.body.style.paddingTop = "54px";

  document
    .getElementById("save-pdf-button")
    .addEventListener("click", async () => {
      const result = await previewAPI.savePdf();

      if (result?.saved) {
        console.log("PDF guardado correctamente.");
      } else if (!result?.canceled) {
        console.error(
          "No se pudo guardar el PDF:",
          result?.error
        );
      }
    });
});