const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("contractAPI", {
  getSeller: () => ipcRenderer.invoke("seller:get"),

  renderContract: (contractData) =>
    ipcRenderer.invoke("contract:render", contractData),

  previewContract: (contractHtml) =>
    ipcRenderer.invoke("contract:preview", contractHtml),

  savePdf: (contractHtml) =>
    ipcRenderer.invoke("contract:save-pdf", contractHtml),

  requestSavePdf: () =>
    ipcRenderer.invoke("contract:request-save-pdf"),
});