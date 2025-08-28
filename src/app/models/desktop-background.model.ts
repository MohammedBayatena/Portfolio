export interface DesktopBackground {
  wallpaperType: 'none' | 'image' | 'color'; // Type of wallpaper
  wallpaperUrl?: string; // Path to the wallpaper image
  wallpaperPosition?: 'center' | 'tile' | 'stretch'; // Positioning of the wallpaper
  backgroundColor?: string; // Background color in hex format
}
