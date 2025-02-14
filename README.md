# SBOM Generator

A comprehensive Software Bill of Materials (SBOM) generator that provides advanced component identification, real-time vulnerability tracking, and seamless NVD database integration for robust software security analysis.

## Features

- 🔍 Advanced component identification
- 🔄 Real-time vulnerability tracking
- 🔌 NVD database integration
- 📝 SPDX format support
- 🚀 Auto-population of component details
- ⬇️ SBOM download functionality

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- NVD API Key (Get one from [NVD API Key Request](https://nvd.nist.gov/developers/request-an-api-key))

## Quick Start

1. Clone the repository:
```bash
git clone [your-repo-url]
cd sbom-generator
```

2. Run the installation script:
```bash
chmod +x install.sh
./install.sh
```

3. Add your NVD API key to the `.env` file:
```bash
NVD_API_KEY=your-api-key-here
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:5000`

## Usage

1. Create a new SBOM by clicking the "Create New SBOM" button
2. Search for components using the search bar
3. Add component details manually or use auto-population from NVD database
4. Download your SBOM in JSON format

## Tech Stack

- React frontend with TypeScript
- Node.js backend
- NVD API integration
- Tailwind CSS for styling
- shadcn/ui components

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
