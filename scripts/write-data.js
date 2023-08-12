const fs = require('fs')
const path = require('path')
const xml = require('xmlbuilder2')
const sizeOf = require('image-size')
const data = require('../dist/data.json')

const now = (new Date()).toISOString()

const sdd = {
  uk: xml.create(),
  en: xml.create(),
}

function createDataset (sdd) {
  return sdd.ele('Datasets')
    .att('xmlns', 'http://rs.tdwg.org/UBIF/2006/')
    .att('xmlns:exif', 'http://ns.adobe.com/exif/1.0/')
    .att('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance')
    .att('xsi:schemaLocation', 'http://rs.tdwg.org/UBIF/2006/ http://rs.tdwg.org/UBIF/2006/Schema/1.1/SDD.xsd')
    .ele('TechnicalMetadata')
      .att('created', now)
      .ele('Generator')
        .att('name', 'Custom Script')
        .att('version', '0.0.0')
      .up()
      .ele('TechnicalContact')
        .att('ref', 'author-2')
        .att('literal', 'Lars Willighagen')
      .up()
      .ele('AdministrativeContact')
        .att('ref', 'author-2')
        .att('literal', 'Lars Willighagen')
      .up()
    .up()
}

const $dataset = {
  uk: createDataset(sdd.uk).ele('Dataset').att('xml:lang', 'uk'),
  en: createDataset(sdd.en).ele('Dataset').att('xml:lang', 'en'),
}

$dataset.uk
  .ele('Representation')
    .ele('Label').txt('Щитників (личинки)').up()
  .up()
  .ele('RevisionData')
    .ele('Creators')
      .ele('Agent').att('role', 'aut').att('ref', 'author-1')
      .up()
    .up()
    .ele('DateCreated').txt('1961-01-01T00:00:00').up()
    .ele('DateModified').txt('1961-01-01T00:00:00').up()
    .ele('RevisionStatus').att('code', 'Unrevised').up()
    .ele('Version')
      .att('major', '1')
      .att('minor', '00')
      .att('modifier', 'beta')
      .att('issued', '1961-01-01T00:00:00')
    .up()
  .up()
  .ele('Scope')
    // TODO .ele('Citation').att('ref', 'pub-1').up()
    .ele('GeographicArea').att('ref', 'area-1').up()
  .up()

$dataset.en
  .ele('Representation')
    .ele('Label').txt('Shield bugs (nymphs)').up()
  .up()
  .ele('RevisionData')
    .ele('Creators')
      .ele('Agent').att('role', 'aut').att('ref', 'author-1')
      .up()
    .up()
    .ele('Contributors')
      .ele('Agent').att('role', 'trl').att('ref', 'author-2')
      .up()
    .up()
    .ele('DateCreated').txt('1961-01-01T00:00:00').up()
    .ele('DateModified').txt(now).up()
    .ele('RevisionStatus').att('code', 'Unrevised').up()
    .ele('Version')
      .att('major', '1')
      .att('minor', '00')
      .att('modifier', 'beta')
      .att('issued', now)
    .up()
  .up()
  .ele('Scope')
    // TODO .ele('Citation').att('ref', 'pub-1').up()
    .ele('GeographicArea').att('ref', 'area-1').up()
  .up()

const $taxa = {
  uk: $dataset.uk.ele('TaxonNames'),
  en: $dataset.en.ele('TaxonNames'),
}
const $tree = {
  uk: $dataset.uk.ele('TaxonHierarchies'),
  en: $dataset.en.ele('TaxonHierarchies'),
}
const $keys = {
  uk: $dataset.uk.ele('IdentificationKeys'),
  en: $dataset.en.ele('IdentificationKeys'),
}

$dataset.uk
  .ele('Agents')
    .ele('Agent')
      .att('id', 'author-1')
      .ele('Representation')
        .ele('Label').txt('Василь Георгійович Пучков').up()
      .up()
    .up()
    .ele('Agent')
      .att('id', 'author-2')
      .ele('Representation')
        .ele('Label').txt('Lars Willighagen').up()
      .up()
    .up()
  .up()
  .ele('GeographicAreas')
    .ele('GeographicArea')
      .att('id', 'area-1')
      .ele('Representation')
        .ele('Label').txt('Україна').up()
      .up()
    .up()
  .up()

$dataset.en
  .ele('Agents')
    .ele('Agent')
      .att('id', 'author-1')
      .ele('Representation')
        .ele('Label').txt('Vasily Georgievich Puchkov').up()
      .up()
    .up()
    .ele('Agent')
      .att('id', 'author-2')
      .ele('Representation')
        .ele('Label').txt('Lars Willighagen').up()
      .up()
    .up()
  .up()
  .ele('GeographicAreas')
    .ele('GeographicArea')
      .att('id', 'area-1')
      .ele('Representation')
        .ele('Label').txt('Ukraine').up()
      .up()
    .up()
  .up()

const $figures = {
  uk: $dataset.uk.ele('MediaObjects'),
  en: $dataset.en.ele('MediaObjects'),
}

{
  const figures = new Set()
  for (const key of data.keys) {
    for (const lead of key.leads) {
      if (lead.figures) {
        for (const figure of lead.figures) {
          if (!figures.has(figure)) {
            figures.add(figure)
          }
        }
      }
    }
  }

  for (const figure of Array.from(figures).sort((a, b) => a - b)) {
    for (const lang in $figures) {
      const $figure = $figures[lang].ele('MediaObject').att('id', `figure-${figure}`)
      const file = `figures/figure-${figure.padStart(3, '0')}.png`
      // $figure.ele('Representation').ele('Label').txt(`Figure ${figure}`)
      $figure.ele('exif:PixelXDimension').txt(sizeOf(path.join(__dirname, '..', 'dist', file)).width * (96 / 600))
      $figure.ele('Type').txt('Image')
      $figure.ele('Source').att('href', file)
    }
  }
}

const $treeNodes = {}

for (const lang in $tree) {
  $treeNodes[lang] = $tree[lang].ele('TaxonHierarchy')
    .ele('Representation')
      .ele('Label')
        .txt('Default Entity Tree')
      .up()
    .up()
    .ele('TaxonHierarchyType')
      .txt('PhylogeneticTaxonomy')
    .up()
    .ele('Nodes')

  $tree[lang].ele('TaxonHierarchy')
    .ele('Representation')
      .ele('Label')
        .txt('Life Stages')
      .up()
    .up()
    .ele('TaxonHierarchyType')
      .txt('NonPhylogeneticTaxonomy')
    .up()
    .ele('Nodes')
      .ele('Node')
        .att('id', 'taxon-node-nymph-1')
        .ele('TaxonName').att('ref', 'taxon-nymph-1').up()
      .up()
      .ele('Node')
        .att('id', 'taxon-node-nymph-2')
        .ele('TaxonName').att('ref', 'taxon-nymph-2').up()
      .up()
      .ele('Node')
        .att('id', 'taxon-node-nymph-3')
        .ele('TaxonName').att('ref', 'taxon-nymph-3').up()
      .up()
      .ele('Node')
        .att('id', 'taxon-node-nymph-4')
        .ele('TaxonName').att('ref', 'taxon-nymph-4').up()
      .up()
      .ele('Node')
        .att('id', 'taxon-node-nymph-5')
        .ele('TaxonName').att('ref', 'taxon-nymph-5').up()
      .up()

  $taxa[lang]
    .ele('TaxonName')
      .att('id', 'taxon-nymph-1')
      .ele('Representation')
        .ele('Label').txt(lang === 'en' ? 'Instar I' : 'I стадія').up()
      .up()
    .up()
    .ele('TaxonName')
      .att('id', 'taxon-nymph-2')
      .ele('Representation')
        .ele('Label').txt(lang === 'en' ? 'Instar II' : 'II стадія').up()
      .up()
    .up()
    .ele('TaxonName')
      .att('id', 'taxon-nymph-3')
      .ele('Representation')
        .ele('Label').txt(lang === 'en' ? 'Instar III' : 'III стадія').up()
      .up()
    .up()
    .ele('TaxonName')
      .att('id', 'taxon-nymph-4')
      .ele('Representation')
        .ele('Label').txt(lang === 'en' ? 'Instar IV' : 'IV стадія').up()
      .up()
    .up()
    .ele('TaxonName')
      .att('id', 'taxon-nymph-5')
      .ele('Representation')
        .ele('Label').txt(lang === 'en' ? 'Instar V' : 'V стадія').up()
      .up()
    .up()
}

for (const taxon of data.taxonomy) {
  for (const lang in $taxa) {
    const $taxon = $taxa[lang].ele('TaxonName').att('id', `taxon-${taxon.localId}`)
    const $taxonRepresentation = $taxon.ele('Representation')
    const vernacularName = taxon[`vernacularName_${lang}`]
    $taxonRepresentation.ele('Label').txt(vernacularName || taxon.scientificName)

    $taxon.ele('NomenclaturalCode').txt('Zoological')
    $taxon.ele('Rank').att('literal', taxon.taxonRank)
    $taxon.ele('CanonicalName').ele('Simple').txt(taxon.scientificNameOnly)
    if (taxon.scientificNameAuthorship) {
      $taxon.ele('CanonicalAuthorship').ele('Simple').txt(taxon.scientificNameAuthorship)
    }

    if (taxon.acceptedNameUsageID) {
      continue
    }

    const $treeNode = $treeNodes[lang].ele('Node').att('id', `taxon-node-${taxon.localId}`)
    if (taxon.parentNameUsageID) {
      const parentLocalId = taxon.parentNameUsageID.split(':').pop()
      $treeNode.ele('Parent').att('ref', `taxon-node-${parentLocalId}`)
    }
    $treeNode.ele('TaxonName').att('ref', `taxon-${taxon.localId}`)
    if (taxon.synonyms) {
      const $synonyms = $treeNode.ele('Synonyms')
      for (const id of taxon.synonyms) {
        const synonymLocalId = id.split(':').pop()
        $synonyms.ele('TaxonName').att('ref', `taxon-${synonymLocalId}`)
      }
    }
  }
}

for (const key of data.keys) {
  for (const lang in $keys) {
    const $key = $keys[lang].ele('IdentificationKey')
    $key.att('id', key.id)

    $key.ele('Representation').ele('Label').txt(key[`label_${lang}`] || key.label_en)

    if (key.scope) {
      $key.ele('Scope').ele('TaxonName').att('ref', key.scope)
    }

    $leads = $key.ele('Leads')
    let prevPage
    for (const lead of key.leads) {
      if (lead.page !== prevPage) {
        $leads.com(` p. ${lead.page} `)
        prevPage = lead.page
      }

      const $lead = $leads.ele('Lead')

      if (lead.id) {
        $lead.att('id', lead.id)
      }
      if (lead.parent_ref) {
        $lead.ele('Parent').att('ref', lead.parent_ref)
      }

      $lead.ele('Statement').txt(lead[`lead_${lang}`])

      if (lead.figures) {
        for (const figure of lead.figures.filter((v, i, a) => i === a.indexOf(v))) {
          $lead.ele('MediaObject').att('ref', `figure-${figure}`)
        }
      }
      if (lead.taxon_ref) {
        // ALERT NON-STANDARD: including taxon name even if subkey exists
        $lead.ele('TaxonName').att('ref', lead.taxon_ref)
      }
      if (lead.subkey_ref) {
        $lead.ele('Subkey').att('ref', lead.subkey_ref)
      }
    }
  }
}

// TODO descriptions

fs.writeFileSync(
  path.join(__dirname, '..', 'dist', 'sdd.xml'),
  sdd.en.end({ prettyPrint: true })
)
