const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'dist', 'sdd.md')

let content = fs.readFileSync(file, 'utf8')
content = content.replace(/\[(Instar [IV]+)\]\(.+?\)/g, '$1')
content = content.replace(
  /(The ridge bordering the jugae is higher and thicker than that of E\. integriceps\.)\\/,
  '$1 `\\dotfill{} `{=tex}`<span style="float: right;">`{=html}`\\mbox{`{=tex}[*E. maurus*](#taxon-117)`}`{=tex} & `\\mbox{`{=tex}[*E. testudinarius*](#taxon-120)`}`{=tex}`</span>`{=html}\\'
)

let introduction = fs.readFileSync(path.join(__dirname, '..', 'README.md'), 'utf8')
introduction = introduction.replace(/(orcid_16x16.gif\))/, '$1{ width=10px }')
content = content.replace(/\n---\n\n/, '\n---\n\n' + introduction.trim() + '\n\n---\n\n')

fs.writeFileSync(file, content)
