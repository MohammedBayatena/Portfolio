import {createFeatureSelector, createSelector} from '@ngrx/store';
import {ThemeState} from '../models/theme.model';

export const selectThemeState = createFeatureSelector<ThemeState>('theme');

export const selectCurrentTheme = createSelector(
  selectThemeState,
  (state: ThemeState) => state.currentTheme
);

export const selectAvailableThemes = createSelector(
  selectThemeState,
  (state: ThemeState) => state.availableThemes
);

export const selectThemeIsLoading = createSelector(
  selectThemeState,
  (state: ThemeState) => state.isLoading
);

export const selectThemeError = createSelector(
  selectThemeState,
  (state: ThemeState) => state.error
);

export const selectThemeWallpaper = createSelector(
  selectCurrentTheme,
  (theme) => theme.wallpaper
);
