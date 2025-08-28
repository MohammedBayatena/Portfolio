import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {MediaFile} from '../models/media-file.model';

@Injectable({
  providedIn: 'root',
})
export class MediaFileService {
  private manifestUrl = 'assets/media-manifest.json';

  constructor(private http: HttpClient) {}

  getMediaFiles(): Observable<MediaFile[]> {
    return this.http.get<MediaFile[]>(this.manifestUrl);
  }
}
