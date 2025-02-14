# SBOM Generator

A modern Software Bill of Materials (SBOM) generator with NVD vulnerability tracking.

## 🚀 Quick Start

One-step installation:

```bash
git clone https://github.com/rupesh43210/sbom-generator.git
cd sbom-generator
chmod +x install.sh
./install.sh
```

That's it! The script will:
- Set up all dependencies
- Configure the environment
- Build the application
- Start the server automatically

Access the application at `http://localhost:5000` (or another port if 5000 is in use).

## 🔑 NVD API Key (Optional)

For vulnerability scanning:
1. Get an API key from [NVD](https://nvd.nist.gov/developers/request-an-api-key)
2. Add it to `.env`: `NVD_API_KEY=your-key-here`
3. The key will be loaded automatically - no restart needed

## 🛠️ Features

- 📦 Generate SBOMs for your projects
- 🔍 Search NVD database for components
- 🔐 Track vulnerabilities (with NVD API key)
- 📊 Modern, responsive UI
- 🔄 Real-time updates
- ⚡ Dynamic configuration

## 🧰 Tech Stack

- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express
- UI: Tailwind CSS + Radix UI
- State: React Query
- Routing: Wouter

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📝 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 👤 Author

**Rupesh**
- GitHub: [@rupesh43210](https://github.com/rupesh43210)

## 🔧 Manual Setup (if needed)

If you prefer manual setup:

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

3. Build and start:
   ```bash
   npm run build
   npm run start
   ```

## 📚 Documentation

### API Endpoints

- `GET /api/nvd/search` - Search NVD database
- `POST /api/settings/nvd-key` - Update NVD API key
- More endpoints coming soon...

### Component Structure

```
client/
  ├── src/
  │   ├── components/    # Reusable UI components
  │   ├── pages/        # Page components
  │   └── app.tsx       # Main application
server/
  ├── index.ts          # Server entry
  └── routes.ts         # API routes
```

## 🌟 Coming Soon

- [ ] Export formats (CycloneDX, SPDX)
- [ ] Component version tracking
- [ ] Dependency graph visualization
- [ ] Team collaboration features
- [ ] CI/CD integration

## ⚡ Performance

- Lightweight bundle size
- Fast component search
- Real-time vulnerability updates
- Efficient API caching

## 🔒 Security

- Environment variable protection
- Secure API key handling
- Input validation
- Error handling

## 💡 Need Help?

- Check the [issues](https://github.com/rupesh43210/sbom-generator/issues)
- Create a new issue
- Contact the author
