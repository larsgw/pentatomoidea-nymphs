const fs = require('fs')
const path = require('path')

const file = path.join(__dirname, '..', 'dist', 'sdd.md')

let content = fs.readFileSync(file, 'utf8')
content = content.replace(/\[(Instar [IVX])\]\(.+?\)/g, '$1')
content = content.replace(
  /(The ridge bordering the jugae is higher and thicker than that of E\. integriceps\.)\\/,
  '$1 `\\dotfill{} `{=tex}`<span style="float: right;">`{=html}`\\mbox{`{=tex}[*E. maurus*](#taxon-117)`}`{=tex} & `\\mbox{`{=tex}[*E. testudinarius*](#taxon-120)`}`{=tex}`</span>`{=html}\\'
)

fs.writeFileSync(file, content)
