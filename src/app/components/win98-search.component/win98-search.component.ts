import {Component, Input, OnInit} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {FileSystemItemType, FileSystemService} from '../../services/file-system.service';
import {FileSystemItem} from '../../models/file-system-item.model';
import {FileSystemSearchResult} from '../../utils/search-tree-helper';

@Component({
  selector: 'app-win98-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './win98-search.component.html',
  styleUrls: ['./win98-search.component.scss']
})
export class Win98SearchComponent implements OnInit {
  @Input() windowClose: () => void = () => {
  };

  private FileSystem: FileSystemItem[] = [];
  // Look in options
  lookInOptions: any = [
    {value: 'all', label: 'All Folders'},
    {value: 'Documents and Settings', label: 'Documents and Settings'}]

  constructor(private fileSystemService: FileSystemService) {
    this.FileSystem = fileSystemService.getFileSystem()
    this.lookInOptions = [
      ...this.lookInOptions,
      ...this.FileSystem.map((item: FileSystemItem) => {
        return {value: item.name, label: item.name};
      })]
  }

  // Search options
  lookIn: string = 'all';
  searchTerm: string = '';
  searchSubfolders: boolean = true;
  caseSensitive: boolean = false;
  exactMatch: boolean = false;

  // Search results
  searchResults: SearchResult[] = [];
  isSearching: boolean = false;
  searchStatus: string = 'Ready';
  foundFiles: number = 0;

  // File type filters
  fileTypeFilters = [
    {value: 'all', label: 'All Files and Folders'},
    {value: 'documents', label: 'Documents (*.doc, *.txt, etc.)'},
    {value: 'images', label: 'Images (*.jpg, *.png, etc.)'},
    {value: 'audio', label: 'Audio (*.mp3, *.wav, etc.)'},
    {value: 'video', label: 'Video (*.mp4, *.avi, etc.)'}
  ];

  ngOnInit(): void {
  }

  startSearch() {
    if (!this.searchTerm.trim()) {
      this.searchStatus = 'Please enter a search term';
      return;
    }

    this.isSearching = true;
    this.searchResults = [];
    this.searchStatus = 'Searching...';
    this.foundFiles = 0;

    // Simulate search delay with timeout
    setTimeout(() => {
      this.performSearch();
    }, 5);
  }

  stopSearch() {
    this.isSearching = false;
    this.searchStatus = 'Search stopped';
  }

  private performSearch() {
    const result = this.SearchFileSystem();
    this.searchResults = result;
    this.isSearching = false;
    this.foundFiles = result.length;
    this.searchStatus = `Search complete. Found ${this.foundFiles} file(s).`;
  }

  private SearchFileSystem(): SearchResult[] {
    const fileSystem = this.fileSystemService.getSearchTree()

    let searchResult: FileSystemSearchResult[] = []

    if (this.exactMatch) {
      searchResult = [fileSystem.searchExact(this.searchTerm)]
    } else {
      searchResult = fileSystem.searchBySubstring(this.searchTerm, this.caseSensitive)
    }

    if (this.lookIn !== 'all') {
      searchResult = searchResult.filter((result) => {
        return result.path.includes(this.lookIn)
      })

      if (!this.searchSubfolders) {
        searchResult = searchResult.filter((result) => {
          return result.path.at(-2) === this.lookIn
        })
      }

    }


    // Search for an item by ID
    return searchResult
      .filter(result => result.item)
      .map((result): SearchResult => {
        return {
          name: result.item!.name,
          path: result.path.join('\\'),
          size: this.formatFileSize(result.item!.size ?? 0),
          modified: this.generateRandomDate(),
          type: result.item!.type,
          isFolder: result.item!.type == FileSystemItemType.Folder
        }
      });
  }

  private generateRandomDate(): string {
    const start = new Date(1995, 0, 1);
    const end = new Date(1998, 0, 1);
    const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

    return date.toLocaleDateString();
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  openFile(result: SearchResult) {
    if (result.isFolder) {
      alert(`Would open folder: ${result.path}`);
    } else {
      alert(`Would open file: ${result.path}`);
    }
  }

  openContainingFolder(result: SearchResult) {
    alert(`Would open folder containing: ${result.path}`);
  }

  clearResults() {
    this.searchResults = [];
    this.searchStatus = 'Ready';
    this.foundFiles = 0;
  }

  getFileIcon(fileType: string): string {
    const iconMap: { [key: string]: string } = {
      '.txt': '📄',
      '.doc': '📄',
      '.docx': '📄',
      '.pdf': '📕',
      '.jpg': '🖼️',
      '.jpeg': '🖼️',
      '.png': '🖼️',
      '.gif': '🖼️',
      '.bmp': '🖼️',
      '.mp3': '🎵',
      '.wav': '🎵',
      '.mp4': '🎬',
      '.avi': '🎬',
      '.exe': '⚙️',
      '.zip': '📦',
      '.rar': '📦'
    };

    return iconMap[fileType.toLowerCase()] || '📄';
  }

}

interface SearchResult {
  name: string;
  path: string;
  size: string;
  modified: string;
  type: string;
  isFolder: boolean;
}
