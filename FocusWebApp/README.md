# Focus Web Blocker Landing Page

A beautiful, modern landing page for the Focus Web Blocker Chrome extension, built with React, TypeScript, Tailwind CSS, and Framer Motion.

## Features

- 🎨 **Modern Design**: Clean, professional design with black and purple gradient theme
- 📱 **Responsive**: Fully responsive design that works on all devices
- ⚡ **Fast**: Built with Vite for lightning-fast development and builds
- 🎭 **Animations**: Smooth animations powered by Framer Motion
- 🎯 **SEO Optimized**: Proper meta tags and semantic HTML
- 🔧 **TypeScript**: Full TypeScript support for better development experience

## Tech Stack

- **React 18** - Modern React with hooks
- **TypeScript** - Type safety and better development experience
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **Lucide React** - Beautiful icons
- **Vite** - Fast build tool and dev server

## Getting Started

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd FocusWebApp
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # Navigation header
│   ├── Hero.tsx        # Hero section
│   ├── Features.tsx    # Features showcase
│   ├── HowItWorks.tsx  # How it works section
│   ├── Testimonials.tsx # User testimonials
│   ├── CTA.tsx         # Call-to-action
│   └── Footer.tsx      # Footer
├── App.tsx             # Main app component
├── main.tsx            # App entry point
└── index.css           # Global styles
```

## Design System

### Colors
- **Primary**: `#e94560` (Pink/Red gradient)
- **Dark**: `#1a1a2e` to `#0f3460` (Dark gradient)
- **Text**: White and gray variations

### Typography
- **Font**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800

### Components
- **Glass Effect**: Semi-transparent backgrounds with blur
- **Gradient Text**: Text with gradient overlay
- **Card Hover**: Subtle hover animations
- **Button Primary**: Gradient buttons with hover effects

## Customization

### Colors
Edit `tailwind.config.js` to modify the color palette:

```javascript
colors: {
  primary: {
    500: '#e94560',
    600: '#c73e5a',
    // ... more shades
  }
}
```

### Animations
Custom animations are defined in `tailwind.config.js` and `src/index.css`.

### Content
Update the content in each component file to match your needs.

## Deployment

### Build for Production
```bash
npm run build
```

The built files will be in the `dist/` directory.

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`

### Deploy to Netlify
1. Build the project: `npm run build`
2. Upload the `dist/` folder to Netlify

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please contact [your-email@example.com]

---

Built with ❤️ for productivity
