#!/usr/bin/env node

/**
 * Fix OpenAPI Schema Issues
 *
 * 1. Resolves bare $ref-only properties in request AND response bodies,
 *    inlining type/description so Mintlify renders them properly.
 *    IMPORTANT: allOf is kept intact — Mintlify handles it natively.
 *    Merging allOf ourselves causes "impossible schema combination" errors.
 *
 * 2. Simplifies single-item oneOf/anyOf to a direct type definition.
 *
 * 3. Adds x-codeSamples to all endpoints that have a request body example.
 *
 * Usage: node scripts/fix-openapi-schema.js
 */

const fs = require('fs');
const path = require('path');

const SPEC_PATH = path.join(__dirname, '../api-reference/openapi.json');
const spec = JSON.parse(fs.readFileSync(SPEC_PATH, 'utf8'));

// ─────────────────────────────────────────────────────────────────────────────
// $ref resolver
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a $ref string to the actual schema object in the spec.
 * @param {string} ref
 * @returns {object|null}
 */
function resolveRef(ref) {
  if (!ref || !ref.startsWith('#/')) return null;
  const parts = ref.slice(2).split('/');
  let current = spec;
  for (const part of parts) {
    const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
    if (current == null || typeof current !== 'object') return null;
    current = current[key];
  }
  return current ?? null;
}

const INLINE_MAX_DEPTH = 8;
// Track visited refs to prevent infinite recursion on circular schemas
const visitedRefs = new Set();

/**
 * Deeply inline $ref pointers in a schema. Keeps allOf/oneOf/anyOf
 * with multiple items in place (Mintlify handles them natively).
 * Simplifies single-item oneOf/anyOf to a direct type.
 *
 * @param {object} schema
 * @param {number} depth
 * @returns {object}
 */
function inlineSchema(schema, depth = 0) {
  if (!schema || typeof schema !== 'object' || depth > INLINE_MAX_DEPTH) return schema;
  if (Array.isArray(schema)) return schema.map(s => inlineSchema(s, depth));

  let result = { ...schema };

  // ── Resolve bare $ref ──────────────────────────────────────────────────────
  if (result['$ref']) {
    const ref = result['$ref'];

    // Guard against circular refs
    if (!visitedRefs.has(ref)) {
      visitedRefs.add(ref);
      const resolved = resolveRef(ref);
      if (resolved) {
        const resolvedInlined = inlineSchema({ ...resolved }, depth + 1);
        // Copy resolved fields into result (without overwriting existing keys)
        for (const [k, v] of Object.entries(resolvedInlined)) {
          if (k !== '$ref' && result[k] === undefined) {
            result[k] = v;
          }
        }
      }
      visitedRefs.delete(ref);
    }

    // Remove $ref so Mintlify uses the inlined type directly
    delete result['$ref'];
  }

  // ── Simplify single-item oneOf / anyOf to direct type ─────────────────────
  // e.g. { oneOf: [{ type: 'string', description: '...' }] }
  //   → { type: 'string', description: '...' }
  for (const combiner of ['oneOf', 'anyOf']) {
    if (Array.isArray(result[combiner]) && result[combiner].length === 1) {
      const single = inlineSchema({ ...result[combiner][0] }, depth + 1);
      delete result[combiner];
      for (const [k, v] of Object.entries(single)) {
        if (result[k] === undefined) result[k] = v;
      }
    }
  }

  // ── Keep allOf in place but resolve $refs within each member ──────────────
  // DO NOT merge allOf — it causes "impossible schema combination" in Mintlify
  if (Array.isArray(result.allOf)) {
    result.allOf = result.allOf.map(s => inlineSchema({ ...s }, depth + 1));
  }

  // ── Recurse into properties ────────────────────────────────────────────────
  if (result.properties && typeof result.properties === 'object') {
    const newProps = {};
    for (const [k, v] of Object.entries(result.properties)) {
      newProps[k] = inlineSchema(v, depth + 1);
    }
    result.properties = newProps;
  }

  // ── Recurse into array items ───────────────────────────────────────────────
  if (result.items) {
    result.items = inlineSchema(result.items, depth + 1);
  }

  return result;
}

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1: Fix request body schemas
// ─────────────────────────────────────────────────────────────────────────────

let requestFixed = 0;
for (const [, pathItem] of Object.entries(spec.paths)) {
  for (const [, operation] of Object.entries(pathItem)) {
    if (!operation || typeof operation !== 'object') continue;
    const content = operation.requestBody?.content?.['application/json'];
    if (!content?.schema) continue;
    const before = JSON.stringify(content.schema);
    visitedRefs.clear();
    content.schema = inlineSchema(content.schema);
    if (JSON.stringify(content.schema) !== before) requestFixed++;
  }
}

console.log(`✅ Step 1 done: Fixed request body schemas on ${requestFixed} endpoints`);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2: Fix response schemas
// ─────────────────────────────────────────────────────────────────────────────

let responseFixed = 0;
for (const [, pathItem] of Object.entries(spec.paths)) {
  for (const [, operation] of Object.entries(pathItem)) {
    if (!operation || typeof operation !== 'object' || !operation.responses) continue;
    for (const [, response] of Object.entries(operation.responses)) {
      const content = response?.content?.['application/json'];
      if (!content?.schema) continue;
      const before = JSON.stringify(content.schema);
      visitedRefs.clear();
      content.schema = inlineSchema(content.schema);
      if (JSON.stringify(content.schema) !== before) responseFixed++;
    }
  }
}

console.log(`✅ Step 2 done: Fixed response schemas on ${responseFixed} status codes`);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 3: Add / update x-codeSamples
// ─────────────────────────────────────────────────────────────────────────────

function buildCurl(method, endpointPath, example) {
  const url = `https://api.paylands.com/v1/sandbox${endpointPath}`;
  return `curl --request ${method.toUpperCase()} \\
  --url ${url} \\
  --header 'Authorization: Basic <base64(API_KEY:)>' \\
  --header 'Content-Type: application/json' \\
  --data '${JSON.stringify(example, null, 2)}'`;
}

function buildPython(method, endpointPath, example) {
  const url = `https://api.paylands.com/v1/sandbox${endpointPath}`;
  const body = JSON.stringify(example, null, 2)
    .replace(/: true/g, ': True')
    .replace(/: false/g, ': False')
    .replace(/: null/g, ': None');
  return `import requests

url = "${url}"
headers = {
    "Authorization": "Basic <base64(API_KEY:)>",
    "Content-Type": "application/json"
}
payload = ${body}

response = requests.${method.toLowerCase()}(url, json=payload, headers=headers)
print(response.json())`;
}

function buildNode(method, endpointPath, example) {
  const url = `https://api.paylands.com/v1/sandbox${endpointPath}`;
  return `const response = await fetch("${url}", {
  method: "${method.toUpperCase()}",
  headers: {
    "Authorization": "Basic <base64(API_KEY:)>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify(${JSON.stringify(example, null, 2)})
});

const data = await response.json();
console.log(data);`;
}

function buildPhp(method, endpointPath, example) {
  const url = `https://api.paylands.com/v1/sandbox${endpointPath}`;
  const body = JSON.stringify(example, null, 2).replace(/'/g, "\\'");
  return `<?php
$ch = curl_init("${url}");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "${method.toUpperCase()}");
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    "Authorization: Basic " . base64_encode("<API_KEY>:"),
    "Content-Type: application/json"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, '${body}');

$response = curl_exec($ch);
curl_close($ch);
echo $response;`;
}

let samplesAdded = 0;
for (const [pathKey, pathItem] of Object.entries(spec.paths)) {
  for (const [method, operation] of Object.entries(pathItem)) {
    if (!operation || typeof operation !== 'object') continue;
    if (typeof operation.operationId === 'undefined') continue;
    const content = operation.requestBody?.content?.['application/json'];
    const example = content?.schema?.example;
    if (!example) continue;

    operation['x-codeSamples'] = [
      { lang: 'bash',       label: 'cURL',    source: buildCurl(method, pathKey, example) },
      { lang: 'python',     label: 'Python',  source: buildPython(method, pathKey, example) },
      { lang: 'javascript', label: 'Node.js', source: buildNode(method, pathKey, example) },
      { lang: 'php',        label: 'PHP',     source: buildPhp(method, pathKey, example) },
    ];
    samplesAdded++;
  }
}

console.log(`✅ Step 3 done: Added/updated x-codeSamples on ${samplesAdded} endpoints`);

// ─────────────────────────────────────────────────────────────────────────────
// STEP 4: Write back JSON + auto-convert to YAML
// ─────────────────────────────────────────────────────────────────────────────
fs.writeFileSync(SPEC_PATH, JSON.stringify(spec, null, 2), 'utf8');
console.log(`✅ Step 4 done: Written updated spec to ${SPEC_PATH}`);

const { execSync } = require('child_process');
const YAML_PATH = path.join(__dirname, '../api-reference/openapi.yaml');
try {
  execSync(
    `python3 -c "import json, yaml; yaml.dump(json.load(open('${SPEC_PATH}')), open('${YAML_PATH}', 'w'), allow_unicode=True, default_flow_style=False, sort_keys=False, width=120)"`,
    { stdio: 'inherit' }
  );
  console.log(`✅ YAML written to ${YAML_PATH}`);
} catch (e) {
  console.warn('Warning: YAML conversion failed:', e.message);
}

console.log('\n🚀 All done! Restart your Mintlify dev server to see the changes.');
