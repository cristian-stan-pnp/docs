#!/usr/bin/env node
/**
 * Updates the docs.json navigation for the Spanish (es) language
 * to include all newly migrated pages.
 */

const fs = require('fs');
const path = require('path');

const docsJsonPath = path.join(__dirname, '..', 'docs.json');
const docs = JSON.parse(fs.readFileSync(docsJsonPath, 'utf-8'));

// Find the Spanish language entry
const esLang = docs.navigation.languages.find(l => l.language === 'es');

if (!esLang) {
  console.error('❌ Could not find Spanish language in docs.json');
  process.exit(1);
}

// Replace the Guías tab groups with the full updated navigation
const guidesTab = esLang.tabs.find(t => t.tab === 'Guías');

if (!guidesTab) {
  console.error('❌ Could not find Guías tab');
  process.exit(1);
}

guidesTab.groups = [
  {
    group: 'Comenzar',
    pages: [
      'guides/get-started/introduction',
      'guides/get-started/authentication',
      'guides/get-started/environments',
      'guides/get-started/quickstart',
    ],
  },
  {
    group: 'Modelos de pagos',
    pages: [
      'guides/accept-payments/web-integration',
      'guides/accept-payments/pos-integration',
      'guides/accept-payments/no-integration',
      'guides/accept-payments/platformas-integration',
      'guides/accept-payments/plugins-integration',
    ],
  },
  {
    group: 'Integración',
    pages: [
      'guides/accept-payments/simple-integration',
      'guides/accept-payments/webservice-payment',
      'guides/accept-payments/marketplace-integration',
      'guides/accept-payments/link-payments',
      'guides/accept-payments/moto-payments',
      'guides/accept-payments/email-sms-payments',
      'guides/accept-payments/payment-urls',
      'guides/accept-payments/partial-authorization',
    ],
  },
  {
    group: 'Checkout',
    pages: [
      'guides/checkout/introduction',
      'guides/checkout/configure',
      'guides/checkout/customize',
      'guides/checkout/api-integration',
      'guides/checkout/sdk-integration',
      'guides/checkout/react-integration',
    ],
  },
  {
    group: 'Funcionalidades',
    pages: [
      'guides/features/tokenization',
      'guides/features/cards',
      'guides/features/3ds',
      'guides/features/fraud',
      'guides/features/security',
      'guides/features/source-holder-verification',
      'guides/features/customization',
      'guides/features/webhooks',
      'guides/features/balance-obtainable',
    ],
  },
  {
    group: 'Herramientas',
    pages: [
      'guides/tools/subscriptions',
      'guides/tools/debt-collector',
      {
        group: 'Proxy PCI',
        pages: [
          'guides/tools/proxipci',
          'guides/tools/proxipci/getting-started',
          'guides/tools/proxipci/channels',
          'guides/tools/proxipci/javascript-library',
          'guides/tools/proxipci/displaying-card-data',
          'guides/tools/proxipci/payments',
        ],
      },
    ],
  },
  {
    group: 'Wallets',
    pages: [
      'guides/wallets/introduction',
      'guides/wallets/google-pay',
      'guides/wallets/apple-pay',
      'guides/wallets/click-to-pay',
    ],
  },
  {
    group: 'Métodos de pago alternativos',
    pages: [
      'guides/apm/introduction',
      'guides/apm/bizum',
      'guides/apm/cofidis',
      'guides/apm/mbway',
      'guides/apm/multibanco',
      'guides/apm/payshop',
      'guides/apm/boleto',
      'guides/apm/loterica',
      'guides/apm/picpay',
      'guides/apm/pix',
      'guides/apm/efecty',
      'guides/apm/pagofacil',
      'guides/apm/pse',
      'guides/apm/flowpay',
      'guides/apm/khipu',
      'guides/apm/klap',
      'guides/apm/mach',
      'guides/apm/servipag',
      'guides/apm/webpay',
      'guides/apm/spei',
      'guides/apm/safetypay',
    ],
  },
  {
    group: 'Servicios de pago',
    pages: [
      'guides/payment-services/introduction',
      'guides/payment-services/redsys',
      'guides/payment-services/cecabank',
      'guides/payment-services/paylands',
      'guides/payment-services/trustpayments',
      'guides/payment-services/nuvei',
      'guides/payment-services/payretailers',
      'guides/payment-services/credorax',
      'guides/payment-services/credibanco',
      'guides/payment-services/floa',
      'guides/payment-services/pagsmile',
      'guides/payment-services/cashflows',
      'guides/payment-services/flywire',
      'guides/payment-services/cybersource',
      'guides/payment-services/paypal',
      'guides/payment-services/klarna',
      'guides/payment-services/mit',
      'guides/payment-services/inespay',
      'guides/payment-services/tink',
      'guides/payment-services/dlocal',
      'guides/payment-services/devengo',
      'guides/payment-services/apolopag',
      'guides/payment-services/clearhaus',
      'guides/payment-services/firepay',
      'guides/payment-services/revolutpay',
      'guides/payment-services/tradebp',
      'guides/payment-services/premierpay',
    ],
  },
  {
    group: 'Plugins',
    pages: ['guides/plugins/ecommerce'],
  },
  {
    group: 'Recursos',
    pages: [
      'guides/resources/CFT-and-AFT',
      'guides/resources/concepts',
      'guides/resources/error-codes',
      'guides/resources/glossary',
      'guides/resources/notification-validation',
      'guides/resources/batch-operations',
      'guides/resources/payment-config-security',
    ],
  },
];

fs.writeFileSync(docsJsonPath, JSON.stringify(docs, null, 2) + '\n', 'utf-8');
console.log('✅ docs.json updated successfully!');
console.log(`   Spanish navigation now has ${guidesTab.groups.length} groups.`);
guidesTab.groups.forEach(g => {
  const count = Array.isArray(g.pages) ? g.pages.length : 0;
  console.log(`   - ${g.group}: ${count} pages`);
});
