#!/usr/bin/env bash
set -e
rm -rf ./build
cd ./web
ng build
cd ../
mkdir -p build
mkdir build/htdocs
cp ./api-server/*.py  ./build/
cp ./api-server/htdocs/*  ./build/htdocs/
cp ./web/dist/* ./build/htdocs/
cd ./build
tar czf dist.tar.gz *

cd ..
mkdir -p dist
mv build/dist.tar.gz ./dist/
rm -rf ./build


