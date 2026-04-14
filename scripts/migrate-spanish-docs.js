#!/usr/bin/env node
/**
 * Migration script: Creates all missing Spanish documentation pages
 * from scraped source content into the new guides/ structure.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SCRAPED = path.join(ROOT, '.agent', 'previews-docs-scrapped');

function mkdir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function write(filePath, content) {
  mkdir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created: ${filePath.replace(ROOT + '/', '')}`);
}

function readScraped(relPath) {
  const full = path.join(SCRAPED, relPath);
  if (!fs.existsSync(full)) return null;
  return fs.readFileSync(full, 'utf-8');
}

/**
 * Strip the scraped frontmatter (it often has just description)
 * and rebuild clean frontmatter for the new file.
 */
function extractBody(content) {
  if (!content) return '';
  // Remove frontmatter block
  const match = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  return match ? match[1].trim() : content.trim();
}

function extractFrontmatter(content) {
  if (!content) return {};
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm = {};
  match[1].split('\n').forEach(line => {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) fm[m[1]] = m[2];
  });
  return fm;
}

// ============================================================
// APM PAGES (19 missing)
// ============================================================

const apms = [
  {
    file: 'guides/apm/boleto.mdx',
    scraped: 'apm/apm-boleto.mdx',
    title: 'Boleto',
    description: 'Acepta pagos con Boleto Bancário en Brasil a través de la API de Paylands',
  },
  {
    file: 'guides/apm/cofidis.mdx',
    scraped: 'apm/apm-cofidis.mdx',
    title: 'Cofidis',
    description: 'Acepta pagos con Cofidis (4xCard y Cofidis Pay) en España a través de la API de Paylands',
  },
  {
    file: 'guides/apm/efecty.mdx',
    scraped: 'apm/apm-efecty.mdx',
    title: 'Efecty',
    description: 'Acepta pagos con Efecty en Colombia a través de la API de Paylands',
  },
  {
    file: 'guides/apm/flowpay.mdx',
    scraped: 'apm/apm-flowpay.mdx',
    title: 'Flow Pay',
    description: 'Acepta pagos con Flow Pay en Chile a través de la API de Paylands',
  },
  {
    file: 'guides/apm/khipu.mdx',
    scraped: 'apm/apm-khipu.mdx',
    title: 'Khipu',
    description: 'Acepta pagos con Khipu en Chile a través de la API de Paylands',
  },
  {
    file: 'guides/apm/klap.mdx',
    scraped: 'apm/apm-klap.mdx',
    title: 'Klap',
    description: 'Acepta pagos con Klap (Multicaja) en Chile a través de la API de Paylands',
  },
  {
    file: 'guides/apm/loterica.mdx',
    scraped: 'apm/apm-loterica.mdx',
    title: 'Lotérica',
    description: 'Acepta pagos con Lotérica en Brasil a través de la API de Paylands',
  },
  {
    file: 'guides/apm/mach.mdx',
    scraped: 'apm/apm-mach.mdx',
    title: 'Mach',
    description: 'Acepta pagos con Mach en Chile a través de la API de Paylands',
  },
  {
    file: 'guides/apm/mbway.mdx',
    scraped: 'apm/apm-mbway.mdx',
    title: 'MB WAY',
    description: 'Acepta pagos con MB WAY en Portugal a través de la API de Paylands',
  },
  {
    file: 'guides/apm/multibanco.mdx',
    scraped: 'apm/apm-multibanco.mdx',
    title: 'Multibanco',
    description: 'Acepta pagos con Multibanco en Portugal a través de la API de Paylands',
  },
  {
    file: 'guides/apm/pagofacil.mdx',
    scraped: 'apm/apm-pagoFacil.mdx',
    title: 'Pago Fácil',
    description: 'Acepta pagos con Pago Fácil en Argentina a través de la API de Paylands',
  },
  {
    file: 'guides/apm/payshop.mdx',
    scraped: 'apm/apm-payshop.mdx',
    title: 'Payshop',
    description: 'Acepta pagos con Payshop en Portugal a través de la API de Paylands',
  },
  {
    file: 'guides/apm/picpay.mdx',
    scraped: 'apm/apm-picpay.mdx',
    title: 'PicPay',
    description: 'Acepta pagos con PicPay en Brasil a través de la API de Paylands',
  },
  {
    file: 'guides/apm/pix.mdx',
    scraped: 'apm/apm-pix.mdx',
    title: 'PIX',
    description: 'Acepta pagos con PIX en Brasil a través de la API de Paylands',
  },
  {
    file: 'guides/apm/pse.mdx',
    scraped: 'apm/apm-pse.mdx',
    title: 'PSE',
    description: 'Acepta pagos con PSE en Colombia a través de la API de Paylands',
  },
  {
    file: 'guides/apm/safetypay.mdx',
    scraped: 'apm/apm-safetyPay.mdx',
    title: 'SafetyPay',
    description: 'Acepta pagos con SafetyPay a través de la API de Paylands',
  },
  {
    file: 'guides/apm/servipag.mdx',
    scraped: 'apm/apm-servipag.mdx',
    title: 'Servipag',
    description: 'Acepta pagos con Servipag en Chile a través de la API de Paylands',
  },
  {
    file: 'guides/apm/spei.mdx',
    scraped: 'apm/apm-spei.mdx',
    title: 'SPEI',
    description: 'Acepta pagos con SPEI en México a través de la API de Paylands',
  },
  {
    file: 'guides/apm/webpay.mdx',
    scraped: 'apm/apm-webpay.mdx',
    title: 'Webpay',
    description: 'Acepta pagos con Webpay en Chile a través de la API de Paylands',
  },
];

console.log('\n📦 Migrating APM pages...');
for (const apm of apms) {
  const scrapedContent = readScraped(apm.scraped);
  const body = scrapedContent ? extractBody(scrapedContent) : `# ${apm.title}\n\nContenido próximamente.`;
  const content = `---
title: '${apm.title}'
description: '${apm.description}'
---

# ${apm.title}

${body}
`;
  write(path.join(ROOT, apm.file), content);
}

// ============================================================
// PAYMENT SERVICES (26 missing — read from scraped)
// ============================================================

const paymentServices = [
  { file: 'guides/payment-services/apolopag.mdx', scraped: 'integrations/payment-service-apolopag.mdx', title: 'Apolopag', description: 'Configuración e integración del servicio de pago Apolopag en Paylands' },
  { file: 'guides/payment-services/cashflows.mdx', scraped: 'integrations/payment-service-cashflows.mdx', title: 'Cashflows', description: 'Configuración e integración del servicio de pago Cashflows en Paylands' },
  { file: 'guides/payment-services/cecabank.mdx', scraped: 'integrations/payment-service-cecabank.mdx', title: 'CECA Bank', description: 'Configuración e integración del servicio de pago CECA Bank en Paylands' },
  { file: 'guides/payment-services/clearhaus.mdx', scraped: 'integrations/payment-service-clearhaus.mdx', title: 'Clearhaus', description: 'Configuración e integración del servicio de pago Clearhaus en Paylands' },
  { file: 'guides/payment-services/credibanco.mdx', scraped: 'integrations/payment-service-credibanco.mdx', title: 'Credibanco', description: 'Configuración e integración del servicio de pago Credibanco en Paylands' },
  { file: 'guides/payment-services/credorax.mdx', scraped: 'integrations/payment-service-credorax.mdx', title: 'Credorax', description: 'Configuración e integración del servicio de pago Credorax en Paylands' },
  { file: 'guides/payment-services/cybersource.mdx', scraped: 'integrations/payment-service-cybersource.mdx', title: 'CyberSource', description: 'Configuración e integración del servicio de pago CyberSource en Paylands' },
  { file: 'guides/payment-services/devengo.mdx', scraped: 'integrations/payment-service-devengo.mdx', title: 'Devengo', description: 'Configuración e integración del servicio de pago Devengo en Paylands' },
  { file: 'guides/payment-services/dlocal.mdx', scraped: 'integrations/payment-service-dlocal.mdx', title: 'dLocal', description: 'Configuración e integración del servicio de pago dLocal en Paylands' },
  { file: 'guides/payment-services/firepay.mdx', scraped: 'integrations/payment-service-firepay.mdx', title: 'FirePay', description: 'Configuración e integración del servicio de pago FirePay en Paylands' },
  { file: 'guides/payment-services/floa.mdx', scraped: 'integrations/payment-service-floa.mdx', title: 'Floa', description: 'Configuración e integración del servicio de pago Floa en Paylands' },
  { file: 'guides/payment-services/flywire.mdx', scraped: 'integrations/payment-service-flywire.mdx', title: 'Flywire', description: 'Configuración e integración del servicio de pago Flywire en Paylands' },
  { file: 'guides/payment-services/inespay.mdx', scraped: 'integrations/payment-service-inespay.mdx', title: 'Inespay', description: 'Configuración e integración del servicio de pago Inespay en Paylands' },
  { file: 'guides/payment-services/klarna.mdx', scraped: 'integrations/payment-service-klarna.mdx', title: 'Klarna', description: 'Configuración e integración del servicio de pago Klarna en Paylands' },
  { file: 'guides/payment-services/mit.mdx', scraped: 'integrations/payment-service-mit.mdx', title: 'MIT', description: 'Configuración e integración del servicio de pago MIT en Paylands' },
  { file: 'guides/payment-services/nuvei.mdx', scraped: 'integrations/payment-service-nuvei.mdx', title: 'Nuvei', description: 'Configuración e integración del servicio de pago Nuvei en Paylands' },
  { file: 'guides/payment-services/pagsmile.mdx', scraped: 'integrations/payment-service-pagsmile.mdx', title: 'Pagsmile', description: 'Configuración e integración del servicio de pago Pagsmile en Paylands' },
  { file: 'guides/payment-services/paylands.mdx', scraped: 'integrations/payment-service-paylands.mdx', title: 'Paylands', description: 'Configuración e integración del servicio de pago nativo Paylands' },
  { file: 'guides/payment-services/paypal.mdx', scraped: 'integrations/payment-service-paypal.mdx', title: 'PayPal', description: 'Configuración e integración del servicio de pago PayPal en Paylands' },
  { file: 'guides/payment-services/payretailers.mdx', scraped: 'integrations/payment-service-payretailers.mdx', title: 'PayRetailers', description: 'Configuración e integración del servicio de pago PayRetailers en Paylands' },
  { file: 'guides/payment-services/premierpay.mdx', scraped: 'integrations/payment-service-premierpay.mdx', title: 'PremierPay', description: 'Configuración e integración del servicio de pago PremierPay en Paylands' },
  { file: 'guides/payment-services/redsys.mdx', scraped: 'integrations/payment-service-redsys.mdx', title: 'Redsys', description: 'Configuración e integración del servicio de pago Redsys en Paylands' },
  { file: 'guides/payment-services/revolutpay.mdx', scraped: 'integrations/payment-service-revolutpay.mdx', title: 'Revolut Pay', description: 'Configuración e integración del servicio de pago Revolut Pay en Paylands' },
  { file: 'guides/payment-services/tink.mdx', scraped: 'integrations/payment-service-tink.mdx', title: 'Tink', description: 'Configuración e integración del servicio de pago Tink en Paylands' },
  { file: 'guides/payment-services/tradebp.mdx', scraped: 'integrations/payment-service-tradebp.mdx', title: 'TradeBP', description: 'Configuración e integración del servicio de pago TradeBP en Paylands' },
  { file: 'guides/payment-services/trustpayments.mdx', scraped: 'integrations/payment-service-trustpayments.mdx', title: 'Trust Payments', description: 'Configuración e integración del servicio de pago Trust Payments en Paylands' },
];

console.log('\n💳 Migrating Payment Service pages...');
for (const ps of paymentServices) {
  const scrapedContent = readScraped(ps.scraped);
  const body = scrapedContent ? extractBody(scrapedContent) : `# ${ps.title}\n\nContenido próximamente.`;
  const content = `---
title: '${ps.title}'
description: '${ps.description}'
---

${body}
`;
  write(path.join(ROOT, ps.file), content);
}

// ============================================================
// GUIDES pages (missing)
// ============================================================

console.log('\n📖 Migrating Guide pages...');

// 3DS
{
  const scraped = readScraped('guides/3ds.mdx');
  const body = scraped ? extractBody(scraped) : '';
  write(path.join(ROOT, 'guides/features/3ds.mdx'), `---
title: '3D Secure (3DS)'
description: 'Guía de autenticación 3D Secure para pagos seguros con Paylands'
---

${body}
`);
}

// Cards guide (28KB!)
{
  const scraped = readScraped('guides/guide-cards.mdx');
  const body = scraped ? extractBody(scraped) : '';
  write(path.join(ROOT, 'guides/features/cards.mdx'), `---
title: 'Guía de Tarjetas'
description: 'Guía completa para gestionar tarjetas en Paylands: tokenización, recurrencia y más'
---

${body}
`);
}

// Balance obtainable
{
  const scraped = readScraped('guides/balance-obtainable.mdx');
  const body = scraped ? extractBody(scraped) : '';
  write(path.join(ROOT, 'guides/features/balance-obtainable.mdx'), `---
title: 'Balance Obtenible'
description: 'Cómo consultar el balance disponible en Paylands'
---

${body}
`);
}

// Source holder verification
{
  const scraped = readScraped('guides/source-holder-verification.mdx');
  const body = scraped ? extractBody(scraped) : '';
  write(path.join(ROOT, 'guides/features/source-holder-verification.mdx'), `---
title: 'Verificación del Titular'
description: 'Cómo verificar la identidad del titular de una tarjeta en Paylands'
---

${body}
`);
}

// ============================================================
// PROXY PCI sub-pages
// ============================================================

console.log('\n🔐 Migrating Proxy PCI pages...');

const proxiPCI = [
  { file: 'guides/tools/proxipci/getting-started.mdx', scraped: 'proxy-pci/getting-started.mdx', title: 'Primeros pasos', description: 'Cómo comenzar a usar el PROXY PCI de Paylands' },
  { file: 'guides/tools/proxipci/channels.mdx', scraped: 'proxy-pci/channels.mdx', title: 'Canales', description: 'Configuración de canales en el PROXY PCI de Paylands' },
  { file: 'guides/tools/proxipci/javascript-library.mdx', scraped: 'proxy-pci/javascript-library.mdx', title: 'Librería JavaScript', description: 'Captura segura de datos de tarjeta con la librería JavaScript del PROXY PCI' },
  { file: 'guides/tools/proxipci/displaying-card-data.mdx', scraped: 'proxy-pci/displaying-card-data.mdx', title: 'Visualizar datos de tarjeta', description: 'Cómo mostrar datos de tarjeta de forma segura con el PROXY PCI de Paylands' },
  { file: 'guides/tools/proxipci/payments.mdx', scraped: 'proxy-pci/payments.mdx', title: 'Pagos con PROXY PCI', description: 'Cómo procesar pagos a través del PROXY PCI de Paylands' },
];

for (const pci of proxiPCI) {
  const scrapedContent = readScraped(pci.scraped);
  const body = scrapedContent ? extractBody(scrapedContent) : '';
  const content = `---
title: '${pci.title}'
description: '${pci.description}'
---

${body}
`;
  write(path.join(ROOT, pci.file), content);
}

// ============================================================
// INTEGRATION pages
// ============================================================

console.log('\n🔗 Migrating Integration pages...');

const integrations = [
  { file: 'guides/accept-payments/webservice-payment.mdx', scraped: 'integration/webservice-payment.mdx', title: 'Pago por webservice', description: 'Integración avanzada mediante el webservice de Paylands' },
  { file: 'guides/accept-payments/marketplace-integration.mdx', scraped: 'integration/marketplace-integration.mdx', title: 'Integración Marketplace', description: 'Cómo integrar Paylands en un marketplace con múltiples comercios' },
  { file: 'guides/accept-payments/payment-urls.mdx', scraped: 'integration/payment-urls.mdx', title: 'URLs de pago', description: 'Referencia de URLs de pago de la API de Paylands (sandbox y producción)' },
  { file: 'guides/accept-payments/partial-authorization.mdx', scraped: 'integration/partial-authorization.mdx', title: 'Autorización parcial', description: 'Cómo gestionar autorizaciones parciales en Paylands' },
  { file: 'guides/accept-payments/link-payments.mdx', scraped: 'integration/link-payments.mdx', title: 'Enlaces de pago', description: 'Cómo crear y enviar enlaces de pago con Paylands' },
  { file: 'guides/accept-payments/moto-payments.mdx', scraped: 'integration/moto-payments.mdx', title: 'Pagos MoTo', description: 'Cómo procesar pagos MoTo (Mail Order / Telephone Order) con Paylands' },
  { file: 'guides/accept-payments/email-sms-payments.mdx', scraped: 'integration/email-sms-payments.mdx', title: 'Pagos por Email y SMS', description: 'Cómo enviar cobros por email y SMS con Paylands' },
];

for (const integ of integrations) {
  const scrapedContent = readScraped(integ.scraped);
  const body = scrapedContent ? extractBody(scrapedContent) : '';
  const content = `---
title: '${integ.title}'
description: '${integ.description}'
---

${body}
`;
  write(path.join(ROOT, integ.file), content);
}

// ============================================================
// ROOT / MISC pages
// ============================================================

console.log('\n📄 Migrating root/misc pages...');

// Batch operations
{
  const scraped = readScraped('batch-operations.mdx');
  const body = scraped ? extractBody(scraped) : '';
  write(path.join(ROOT, 'guides/resources/batch-operations.mdx'), `---
title: 'Operaciones en lote'
description: 'Cómo realizar autorizaciones y devoluciones en lote con la API de Paylands'
---

${body}
`);
}

// Payment config & security
{
  const scraped = readScraped('payment-config-security.mdx');
  const body = scraped ? extractBody(scraped) : '';
  write(path.join(ROOT, 'guides/resources/payment-config-security.mdx'), `---
title: 'Configuración y seguridad'
description: 'Configuración de seguridad de pagos en Paylands: whitelist, blacklist y más'
---

${body}
`);
}

// Notification validation (more detailed than current webhooks)
{
  const scraped = readScraped('notification-validation.mdx');
  const body = scraped ? extractBody(scraped) : '';
  write(path.join(ROOT, 'guides/resources/notification-validation.mdx'), `---
title: 'Validación de notificaciones'
description: 'Cómo validar la autenticidad de las notificaciones POST de Paylands'
---

${body}
`);
}

console.log('\n✅ Migration complete!');
console.log('\n📝 Next step: Update docs.json navigation to include all new pages.');
