# SBOM Generator

A comprehensive Software Bill of Materials (SBOM) generator that provides advanced component identification, real-time vulnerability tracking, and seamless NVD database integration for robust software security analysis.

**Author**: Rupesh (rupesh)

## Features

- 🔍 Advanced component identification with NVD database integration
- 🔄 Real-time component search and validation
- 📝 Support for both public and proprietary components
- 🚀 Auto-population of component details from NVD
- 🔒 Secure API key management
- 💻 Modern React-based UI with TypeScript

## Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)
- NVD API Key (Get one from [NVD API Key Request](https://nvd.nist.gov/developers/request-an-api-key))

## Installation

1. Clone the repository:
```bash
git clone https://github.com/[your-username]/sbom-generator.git
cd sbom-generator
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
NVD_API_KEY=your-api-key-here
```

## Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5003`

## Production

Build and start the production server:
```bash
npm run build
PORT=5003 npm run start
```

## Usage

1. **Component Search**:
   - Use the search bar to find components in the NVD database
   - Components can be added manually if not found in NVD
   - The system will show appropriate messages if NVD is not accessible

2. **Adding Components**:
   - Select components from the dropdown
   - Fill in additional details as needed
   - Mark components as proprietary if they're internal

3. **Error Handling**:
   - The system gracefully handles missing API keys
   - Provides offline support with manual entry
   - Shows clear error messages for troubleshooting

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Built with React, TypeScript, and Express
- Uses the NVD API for component validation
- Styled with Tailwind CSS and Shadcn UI
