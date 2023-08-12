#!/usr/bin/env bash

cd "$(dirname "$0")/.."

mkdir -p dist/figures

for file in figures/*.svg; do
  inkscape $file -o "dist/${file%.svg}.png";
done
