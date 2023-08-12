dist/figures:
	./scripts/make_figures.sh

scripts/node_modules:
	cd scripts; npm install

dist/data.json: scripts/node_modules
	node scripts/read-data.js

dist/sdd.xml: dist/data.json
	node scripts/write-data.js

dist/ssd.lua:
	curl https://raw.githubusercontent.com/larsgw/pandoc-reader-sdd/v1.0.1/sdd.lua -o dist/sdd.lua

dist/sdd.md: dist/ssd.lua dist/sdd.xml
	cd dist; pandoc -f sdd.lua -t markdown -s sdd.xml > sdd.md
	node scripts/apply-fixes.js

dist/fauna-ukraine-21-nymphs.pdf: dist/sdd.md dist/figures
	cd dist; pandoc -t pdf --pdf-engine=xelatex -V mainfont="Noto Serif" --dpi 300 sdd.md > fauna-ukraine-21-nymphs.pdf
