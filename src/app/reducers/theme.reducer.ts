import {createReducer, on, Action} from '@ngrx/store';
import {ThemeState, defaultTheme} from '../models/theme.model';
import * as ThemeActions from '../actions/theme.actions';

export const initialState: ThemeState = {
  currentTheme: defaultTheme,
  availableThemes: [defaultTheme],
  isLoading: false,
  error: null,
  customColors: {}
};

const themeReducerCreator = createReducer(
  initialState,

  on(ThemeActions.loadThemes, state => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(ThemeActions.loadThemesSuccess, (state, {themes}) => ({
    ...state,
    availableThemes: themes,
    isLoading: false,
    error: null
  })),
  on(ThemeActions.loadThemesFailure, (state, {error}) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(ThemeActions.selectTheme, state => ({
    ...state,
    isLoading: true,
    error: null
  })),
  on(ThemeActions.selectThemeSuccess, (state, {theme}) => ({
    ...state,
    currentTheme: theme,
    isLoading: false,
    error: null
  })),
  on(ThemeActions.selectThemeFailure, (state, {error}) => ({
    ...state,
    isLoading: false,
    error
  })),
  on(ThemeActions.updateWallpaper, (state, {wallpaper}) => ({
    ...state,
    currentTheme: {
      ...state.currentTheme,
      wallpaper
    }
  })),
  on(ThemeActions.updateWallpaperSuccess, (state, {wallpaper}) => ({
    ...state,
    currentTheme: {
      ...state.currentTheme,
      wallpaper
    }
  })),
  on(ThemeActions.resetTheme, state => ({
    ...state,
    currentTheme: defaultTheme,
    customColors: {}
  }))
);

export function themeReducer(
  state: ThemeState | undefined,
  action: Action
): ThemeState {
  return themeReducerCreator(state, action);
}
