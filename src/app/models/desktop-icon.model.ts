export interface DesktopIcon {
  id: string;
  title: string;
  icon: string;
  action: () => void;
  x?: number;
  y?: number;
  iconUrl?: string; // Optional URL for custom icons
}
