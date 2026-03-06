import {createAction, props} from '@ngrx/store';
import {Theme} from '../models/theme.model';


export const loadThemes = createAction('[Theme] Load Themes');
export const loadThemesSuccess = createAction(
  '[Theme] Load Themes Success',
  props<{ themes: Theme[] }>()
);
export const loadThemesFailure = createAction(
  '[Theme] Load Themes Failure',
  props<{ error: string }>()
);


export const selectTheme = createAction(
  '[Theme] Select Theme',
  props<{ theme: Theme }>()
);
export const selectThemeSuccess = createAction(
  '[Theme] Select Theme Success',
  props<{ theme: Theme }>()
);
export const selectThemeFailure = createAction(
  '[Theme] Select Theme Failure',
  props<{ error: string }>()
);


export const saveTheme = createAction(
  '[Theme] Save Theme',
  props<{ theme: Theme }>()
);
export const saveThemeSuccess = createAction(
  '[Theme] Save Theme Success',
  props<{ theme: Theme }>()
);
export const saveThemeFailure = createAction(
  '[Theme] Save Theme Failure',
  props<{ error: string }>()
);


export const updateWallpaper = createAction(
  '[Theme] Update Wallpaper',
  props<{ wallpaper: Theme['wallpaper'] }>()
);
export const updateWallpaperSuccess = createAction(
  '[Theme] Update Wallpaper Success',
  props<{ wallpaper: Theme['wallpaper'] }>()
);

export const resetTheme = createAction('[Theme] Reset Theme');
export const resetThemeSuccess = createAction('[Theme] Reset Theme Success');
