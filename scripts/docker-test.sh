#!/bin/bash
set -e

docker build -t sbom-test .

docker run --rm -p 5000:5000 sbom-test /app/install.sh

echo 'Open http://localhost:5000 to verify deployment'
