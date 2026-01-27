# Focus Web Blocker

A modern, distraction-free browser extension designed to help you stay focused by blocking distracting websites.

## Features

- **Modern UI**: Clean, minimalist design that matches the Focus Web Blocker website theme
- **Power Button**: Simple on/off toggle with smooth animations
- **Smart Suggestions**: Auto-complete for common websites
- **Full YouTube Coverage**: Blocks all YouTube domains and resources
- **Responsive Design**: Optimized for different screen sizes
- **Smooth Animations**: Subtle transitions and hover effects

## Theme

The extension uses a modern, distraction-free design with:
- **Color Scheme**: Dark theme with rose-400 to purple-600 gradients
- **Typography**: Clean, readable fonts with proper spacing
- **Animations**: Smooth transitions and subtle hover effects
- **Layout**: Minimalist interface that focuses on functionality

## Installation

1. Download or clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

1. Click the extension icon to open the popup
2. Use the power button to enable/disable blocking
3. Add websites to block using the input field
4. Remove blocked websites by clicking the delete button
5. The extension will automatically block access to listed sites

## Technical Details

- **Manifest Version**: 3
- **Permissions**: declarativeNetRequest, storage
- **Background**: Service worker for blocking logic
- **Storage**: Local storage for settings and blocked sites
- **Blocking**: Uses declarativeNetRequest for efficient website blocking

## Development

The extension is built with vanilla JavaScript and CSS, featuring:
- Modern CSS with custom properties
- Responsive design principles
- Accessibility features
- Cross-browser compatibility
