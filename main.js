const { SELLER } = require("./src/data/contract");

const {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
} = require("electron");

const path = require("node:path");
const fs = require("node:fs");
const { spawn } = require("node:child_process");

const FACTURIX_EXE = app.isPackaged
  ? path.join(
      path.dirname(process.execPath),
      "..",
      "..",
      "..",
      "Facturix",
      "release",
      "win-unpacked",
      "Facturix Invoicing System.exe"
    )
  : path.join(
      __dirname,
      "..",
      "Facturix",
      "release",
      "win-unpacked",
      "Facturix Invoicing System.exe"
    );

const { renderContract } = require("./src/services/template");


// ============================================================
// PREVIEW CONTRACT STORAGE
// ============================================================

const previewContracts = new Map();


// ============================================================
// SELLER
// ============================================================

ipcMain.handle("seller:get", () => {
  return SELLER;
});

ipcMain.handle("facturix:launch", async (_event, contractData) => {
  try {
    const contractFile = path.join(
      app.getPath("temp"),
      "autoescandinavia-contract.json"
    );

    fs.writeFileSync(
      contractFile,
      JSON.stringify(contractData, null, 2),
      "utf8"
    );

    const facturix = spawn(
      FACTURIX_EXE,
      [`--contract-file=${contractFile}`],
      {
        detached: true,
        stdio: "ignore",
      }
    );

    facturix.unref();

    return {
      launched: true,
    };
  } catch (error) {
    console.error("Error launching Facturix:", error);

    return {
      launched: false,
      error: error.message,
    };
  }
});


// ============================================================
// CONTRACT RENDERING
// ============================================================

ipcMain.handle("contract:render", async (_event, contractData) => {
  return await renderContract(contractData);
});


// ============================================================
// CONTRACT PREVIEW
// ============================================================

ipcMain.handle("contract:preview", async (_event, contractHtml) => {
  const previewWindow = new BrowserWindow({
    width: 900,
    height: 1200,

    title:
      "Contrato de Compraventa - Auto Escandinavia",

    webPreferences: {
      preload: path.join(
        __dirname,
        "preload-preview.js"
      ),

      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Store the exact HTML associated with this
  // preview window.
  const previewId = previewWindow.webContents.id;

previewContracts.set(
  previewId,
  contractHtml
);

// Remove stored contract when the window closes.
previewWindow.on("closed", () => {
  previewContracts.delete(previewId);
});

  const dataUrl =
    "data:text/html;charset=utf-8," +
    encodeURIComponent(contractHtml);

  await previewWindow.loadURL(dataUrl);

  return {
    opened: true,
  };
});


// ============================================================
// SAVE PDF FROM PREVIEW
// ============================================================

ipcMain.handle(
  "contract:request-save-pdf",
  async (event) => {
    const previewWindow =
      BrowserWindow.fromWebContents(
        event.sender
      );

    if (
      !previewWindow ||
      previewWindow.isDestroyed()
    ) {
      return {
        saved: false,
        error:
          "No se encontró la ventana de vista previa.",
      };
    }

    const contractHtml =
      previewContracts.get(
        previewWindow.webContents.id
      );

    if (!contractHtml) {
      return {
        saved: false,
        error:
          "No hay ningún contrato disponible para guardar.",
      };
    }

    const { canceled, filePath } =
      await dialog.showSaveDialog(
        previewWindow,
        {
          title:
            "Guardar contrato en PDF",

          defaultPath:
            "Compraventa.pdf",

          filters: [
            {
              name: "Documento PDF",
              extensions: ["pdf"],
            },
          ],
        }
      );

    if (canceled || !filePath) {
      return {
        saved: false,
        canceled: true,
      };
    }

    const pdfWindow = new BrowserWindow({
      show: false,

      webPreferences: {
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: true,
      },
    });

    try {
      const dataUrl =
        "data:text/html;charset=utf-8," +
        encodeURIComponent(contractHtml);

      await pdfWindow.loadURL(dataUrl);

      const pdfData =
        await pdfWindow.webContents.printToPDF({
          printBackground: true,
          preferCSSPageSize: true,
        });

      fs.writeFileSync(
        filePath,
        pdfData
      );

      return {
        saved: true,
        filePath,
      };
    } catch (error) {
      console.error(
        "Error al guardar el PDF:",
        error
      );

      return {
        saved: false,
        error:
          "No se pudo generar el PDF.",
      };
    } finally {
      if (!pdfWindow.isDestroyed()) {
        pdfWindow.close();
      }
    }
  }
);


// ============================================================
// MAIN APPLICATION WINDOW
// ============================================================

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,

    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,

      preload: path.join(
        __dirname,
        "preload.js"
      ),
    },
  });

  win.loadFile(
    path.join(
      __dirname,
      "src",
      "renderer",
      "index.html"
    )
  );
}


// ============================================================
// APPLICATION LIFECYCLE
// ============================================================

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (
      BrowserWindow.getAllWindows()
        .length === 0
    ) {
      createWindow();
    }
  });
});


app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});