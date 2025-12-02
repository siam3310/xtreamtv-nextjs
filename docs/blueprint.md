# **App Name**: XtreamTV

## Core Features:

- M3U Playlist Parsing: Fetches and parses the Xtream Codes playlist from the provided URL (http://filex.me:8080/get.php?username=MAS101A&password=MAS101AABB&type=m3u_plus&output=m3u8) to extract channels, movies, series, and categories.
- Live TV Channels: Displays live TV channels in a grid or list view with real-time search and category filtering.
- Movies and Series: Presents movies and series in dedicated sections, supporting search and category-based filtering.
- Video Streaming: Enables video streaming using Video.js with HLS support for both live channels and on-demand content.
- Real-time Search and Category Filtering: Offers instant search functionality and dynamic category filtering to quickly find desired content.
- Lazy Loading with Pagination: Implements lazy loading of content with a 'Load More' button, loading 20 items per page to optimize performance.
- View Mode Toggle: Allows users to switch between grid and list views for all content types.

## Style Guidelines:

- Background: Pure black (#000000) to create a monochromatic dark theme.
- Text: White (#FFFFFF) for primary text and gray-400 (#A3A3A3) for secondary text to ensure readability.
- Accent: Zinc-900 (#18181B) for cards and inputs to provide subtle contrast.
- Body and headline font: 'Inter', a grotesque-style sans-serif font for a modern, machined look; suitable for both headlines and body text.
- Lucide React icons for a clean, minimalist design.
- Desktop: 70% video player (left) + 30% content list (right) in a flex-row layout; Mobile: Full-width player (top) + content list (bottom) in a flex-col layout.
- No heavy animations or hover effects to maintain an ultra-lightweight design.