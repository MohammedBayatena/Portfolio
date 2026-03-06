import {DesktopBackground} from './desktop-background.model';

export interface Base64PngImage {
  name: string;
  value: string;
}

export interface Theme {
  id: string;
  name: string;
  displayName: string;
  colors: {
    text_color: string;
    progress_color: string;
    start_menu_decoration_color: string;
    background_color: string;
    background_color_dark: string;
    background_color_light: string;
    background: string;
    white_backgrounds: string;
    hover_background_color: string;
    hover_text_color: string;
    disabled_hover_text_color: string;
    disabled_hover_background_color: string;
    desktop_background: string;
    selected_item_color: string;
    selected_item_text_color: string;
    title_bar_gradient_start: string;
    title_bar_gradient_end: string;
    task_bar_start_button_background_color: string;
    task_bar_item_background: string;
  };
  wallpaper?: DesktopBackground
}

export interface ThemeState {
  currentTheme: Theme;
  availableThemes: Theme[];
  isLoading: boolean;
  error: string | null;
  customColors: Partial<Theme['colors']>;
}

export const defaultTheme: Theme = {
  id: 'windows98-default',
  name: 'Windows 98 Default',
  displayName: 'Windows 98 Default',
  colors: {
    text_color: '#000000',
    progress_color: '#000080',
    start_menu_decoration_color: '#000080',
    background_color: '#C0C0C0',
    background_color_dark: '#808080',
    background_color_light: '#C0C0C0',
    background: '#C0C0C0',
    white_backgrounds: 'white',
    hover_background_color: '#000080',
    hover_text_color: '#FFFFFF',
    disabled_hover_text_color: '#808080',
    disabled_hover_background_color: '#C0C0C0',
    desktop_background: '#008080',
    selected_item_color: '#000080',
    selected_item_text_color: '#FFFFFF',
    title_bar_gradient_start: 'navy',
    title_bar_gradient_end: '#1084d0',
    task_bar_start_button_background_color: 'silver',
    task_bar_item_background: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAG0lEQVQYV2M8cODAf3t7ewbG/////z948CADAFuqCj64BtLKAAAAAElFTkSuQmCC'
  },
  wallpaper: {
    wallpaperType: 'color',
    backgroundColor: '#008080'
  }
};
