const fs = require("node:fs/promises");
const path = require("node:path");

const TEMPLATE_PATH = path.join(
  __dirname,
  "..",
  "templates",
  "compraventa.html"
);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getValue(object, pathString) {
  return pathString
    .split(".")
    .reduce((current, key) => current?.[key], object);
}

function renderTemplate(template, data) {
  return template.replace(
    /\{\{\s*([^}]+?)\s*\}\}/g,
    (_, key) => escapeHtml(getValue(data, key.trim()))
  );
}

async function renderContract(data) {
  const template = await fs.readFile(TEMPLATE_PATH, "utf8");

  return renderTemplate(template, data);
}

module.exports = {
  renderContract,
};