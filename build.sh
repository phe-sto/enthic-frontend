#!/bin/sh
################################################################################
# BUILDER OF THE enthic.fr WEBSITE
# DEPENDENCIES: CLOSURE JS, TRIMAGE, HTML-MINIFIER, POSTCCS, NANOCSS, SHELL...
################################################################################
# PREPARE THE FOLDER
################################################################################
# REMOVE POTENTIAL BUILD FOLDER
rm -rf ../build
# CREATE BUILD FOLDER CALLED build
mkdir ../build
# COPY SRC TO BUILD DIRECTORY
cp -r ./ ../build
#cp -r ./favicon.ico ./build/favicon.ico
################################################################################
# JAVASCRIPT WITH CLOSURE JS
################################################################################
# COPY JS FILES AS TEMP FILES
cp js/index.js .
# JS CLOSURE COMPILER
java -jar closure-compiler-v20190909.jar -O SIMPLE --js_output_file=../build/js/index.js --js=index.js --language_out=ECMASCRIPT_2015
# REMOVE JS TEMP FILES
rm index.js
################################################################################
# CSS WITH POSTCSS AND CSS NANO
################################################################################
postcss css/index.css > ../build/css/index.css
################################################################################
# HTML WITH HTML-MINIFIER
################################################################################
for VARIABLE in index.html papit.html contact.html api.html
do
	html-minifier --collapse-whitespace --remove-comments --remove-optional-tags --remove-redundant-attributes --remove-tag-whitespace --use-short-doctype --minify-css true --minify-js true $VARIABLE > ../build/$VARIABLE
done
################################################################################
# COMPRESS IMAGE WITH TRIMAGE
################################################################################
trimage -d ./ >/dev/null 2>&1