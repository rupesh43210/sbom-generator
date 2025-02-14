export const LICENSE_OPTIONS = [
  "Apache-2.0",
  "MIT",
  "GPL-3.0",
  "BSD-3-Clause",
  "ISC",
  "LGPL-3.0",
  "MPL-2.0",
  "EPL-2.0",
  "Unlicense",
  "proprietary"
];

export const COMPONENT_TYPES = [
  { value: "library", label: "Library" },
  { value: "framework", label: "Framework" },
  { value: "application", label: "Application" },
  { value: "container", label: "Container" },
  { value: "operating-system", label: "Operating System" },
  { value: "device", label: "Device" },
  { value: "file", label: "File" }
];

export const COMMON_VENDORS = [
  "Apache",
  "Microsoft",
  "Google",
  "Amazon",
  "Oracle",
  "Red Hat",
  "IBM",
  "Mozilla",
  "npm",
  "Docker",
  "Linux Foundation",
  "Other"
];

export const HASH_ALGORITHMS = [
  { value: "SHA-1", label: "SHA-1" },
  { value: "SHA-256", label: "SHA-256 (Recommended)" },
  { value: "SHA-512", label: "SHA-512" },
  { value: "MD5", label: "MD5 (Not Recommended)" }
];

export const CPE_PATTERNS = {
  application: "cpe:2.3:a:vendor:product:version",
  operatingSystem: "cpe:2.3:o:vendor:product:version",
  hardware: "cpe:2.3:h:vendor:product:version"
};

export const PURL_PATTERNS = {
  npm: "pkg:npm/package@version",
  maven: "pkg:maven/group/artifact@version",
  pypi: "pkg:pypi/package@version",
  golang: "pkg:golang/package@version",
  docker: "pkg:docker/image@version"
};

// Known Component Templates
export const KNOWN_COMPONENTS = {
  "apache": {
    type: "application",
    versions: ["2.4.57", "2.4.56", "2.4.55", "2.4.54"],
    supplier: "Apache Software Foundation",
    author: "Apache Software Foundation",
    description: "The Apache HTTP Server Project is a collaborative software development effort aimed at creating a robust, commercial-grade, featureful, and freely-available source code implementation of an HTTP (Web) server.",
    licenses: ["Apache-2.0"],
    purl: "pkg:generic/httpd@VERSION",
    cpe: "cpe:2.3:a:apache:http_server:VERSION",
    homepage: "https://httpd.apache.org",
    downloadLocation: "https://httpd.apache.org/download.cgi",
    copyrightText: "Copyright The Apache Software Foundation"
  },
  "nginx": {
    type: "application",
    versions: ["1.24.0", "1.22.1", "1.20.2"],
    supplier: "NGINX Software Inc.",
    author: "Igor Sysoev",
    description: "NGINX is a free, open-source, high-performance HTTP server and reverse proxy, as well as an IMAP/POP3 proxy server.",
    licenses: ["BSD-2-Clause"],
    purl: "pkg:generic/nginx@VERSION",
    cpe: "cpe:2.3:a:nginx:nginx:VERSION",
    homepage: "https://nginx.org",
    downloadLocation: "https://nginx.org/en/download.html",
    copyrightText: "Copyright (C) 2002-2024 Igor Sysoev"
  }
  // Add more known components as needed
};