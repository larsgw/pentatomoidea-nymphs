const path = require('path')
const fs = require('fs')

function readFile (file) {
  return fs.readFileSync(file, 'utf8')
}

function parseCsv (file) {
    const values = file.trim().match(/("([^"]|"")*?"|[^,\n]+|(?!$))(,|\n|$)/g)

    if (values === null) {
        throw new TypeError('Failed to parse csv')
    }

    const rows = [[]]
    for (let value of values) {
        const last = rows[rows.length - 1]
        if (value.endsWith('\n')) {
            rows.push([])
        }
        value = value.replace(/[,\n]$/, '')
        last.push(value.startsWith('"') ? value.replace(/""/g, '"').slice(1, -1) : value)
    }

    const [header, ...data] = rows
    return data.map(row => row.reduce((entry, value, index) => {
      entry[header[index]] = value
      return entry
    }, {}))
}

const taxonomy = parseCsv(readFile(path.join(__dirname, '..', 'taxa.csv')))
const taxonByName = {
  'Instar I': { localId: 'nymph-1' },
  'Instar II': { localId: 'nymph-2' },
  'Instar III': { localId: 'nymph-3' },
  'Instar IV': { localId: 'nymph-4' },
  'Instar V': { localId: 'nymph-5' },
}
const taxonById = {}
{
  for (const taxon of taxonomy) {
    const name = taxon.scientificNameAuthorship
      ? taxon.scientificName.slice(0, -1 - taxon.scientificNameAuthorship.length).trim()
      : taxon.scientificName

    taxonById[taxon.scientificNameID] = taxon
    taxon.scientificNameOnly = name
    taxon.localId = taxon.scientificNameID.split(':').pop()
    if (taxon.acceptedNameUsageID) {
      const accepted = taxonById[taxon.acceptedNameUsageID]
      if (!accepted.synonyms) { accepted.synonyms = [] }
      accepted.synonyms.push(taxon.scientificNameID)
    } else {
      taxonByName[name] = taxon
    }
  }
}

const steps = parseCsv(readFile(path.join(__dirname, '..', 'keys.csv')))
const keys = []

{
  const keyIndex = {}
  let leads
  let keyId

  keys.push({
    id: `key-${keyId = 'instar'}`,
    label_uk: '',
    label_en: 'Table for determining the instars',
    leads: leads = []
  })

  for (const step of steps) {
    if (step.page === '') {
      const scientific = step.lead_translation.split(' ').pop()
      if (!taxonByName[scientific]) {
        console.log(`Missing: "${scientific}"`)
      }
      keyId = taxonByName[scientific].localId
      keyIndex[`key-${keyId}`] = true
      keys.push({
        id: `key-${keyId}`,
        label_uk: step.lead,
        label_en: step.lead_translation,
        scope: `taxon-${keyId}`,
        leads: leads = []
      })
      continue
    }

    const lead = {
      type: step.result === '' && step.step !== '' ? 'Lead' : 'Result',
      page: step.page,
      lead_uk: step.lead,
      lead_en: step.lead_translation,
    }
    leads.push(lead)

    if (step.step !== '') {
      const [leadIndex, pairIndex] = [...step.step.match(/\d+/g)].map(parseFloat)
      lead.id = `key-${keyId}-${leadIndex}`
      const parentIndex = Math.min(leadIndex, pairIndex) - 1
      if (parentIndex > 0) {
        lead.parent_ref = `key-${keyId}-${parentIndex}`
      }
    }

    if (step.figures) {
      lead.figures = step.figures.split('; ')
    }

    const [vernacular_uk, _] = step.result.split(' -- ')
    const [vernacular_en, scientific] = step.result_translation.split(' -- ')

    if (taxonByName[scientific] || taxonByName[vernacular_en]) {
      const taxon = taxonByName[scientific] || taxonByName[vernacular_en]
      lead.subkey_ref = `key-${taxon.localId}`
      lead.taxon_ref = `taxon-${taxon.localId}`
      if (vernacular_uk) { taxon.vernacularName_uk = vernacular_uk }
      if (vernacular_en) { taxon.vernacularName_en = vernacular_en }
    } else if (scientific) {
      console.log(`Missing: "${scientific}"`)
    } else {
      if (vernacular_uk) { lead.taxon_uk = vernacular_uk }
      if (vernacular_en) { lead.taxon_en = vernacular_en }
    }
  }

  for (const key of keys) {
    for (const lead of key.leads) {
      if (lead.subkey_ref in keyIndex) {
        continue
      } else {
        delete lead.subkey_ref
      }
    }
  }
}

// TODO descriptions

fs.writeFileSync(path.join(__dirname, '..', 'dist', 'data.json'), JSON.stringify({taxonomy, keys}, null, 2))
