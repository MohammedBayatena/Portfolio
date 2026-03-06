import {Injectable, inject} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {of} from 'rxjs';
import {catchError, map, mergeMap, tap} from 'rxjs/operators';
import * as ThemeActions from '../actions/theme.actions';
import {ThemeService} from '../services/theme.service';

@Injectable({
  providedIn: 'root'
})
export class ThemeEffects {
  private actions$ = inject(Actions);
  private themeService = inject(ThemeService);

  loadThemes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ThemeActions.loadThemes),
      mergeMap(() => {
        return this.themeService.getAvailableThemes().pipe(
          map(themes => ThemeActions.loadThemesSuccess({themes})),
          catchError(error => of(ThemeActions.loadThemesFailure({error: error.message})))
        );
      })
    )
  );

  selectTheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ThemeActions.selectTheme),
      mergeMap(({theme}) => {
        return this.themeService.applyTheme(theme).pipe(
          map(() => ThemeActions.selectThemeSuccess({theme})),
          catchError(error => of(ThemeActions.selectThemeFailure({error: error.message})))
        );
      })
    )
  );

  saveTheme$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ThemeActions.saveTheme),
      mergeMap(({theme}) => {
        return this.themeService.saveTheme(theme).pipe(
          map(() => ThemeActions.saveThemeSuccess({theme})),
          catchError(error => of(ThemeActions.saveThemeFailure({error: error.message})))
        );
      })
    )
  );

}
