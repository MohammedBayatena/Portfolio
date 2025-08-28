import {FileSystemItem} from '../models/file-system-item.model';

// BST Node structure
interface BSTNode {
  item: FileSystemItem;
  path: string[]; // Path from root to this node
  left: BSTNode | null;
  right: BSTNode | null;
}

export interface FileSystemSearchResult {
  item: FileSystemItem | null,
  path: string[]
}

// Enhanced BST with case-sensitive and case-insensitive search
export class FileSystemBST {
  root: BSTNode | null;
  caseSensitiveIndex: Map<string, FileSystemSearchResult[]>;
  caseInsensitiveIndex: Map<string, FileSystemSearchResult[]>;

  constructor() {
    this.root = null;
    this.caseSensitiveIndex = new Map(); // For case-sensitive searches
    this.caseInsensitiveIndex = new Map(); // For case-insensitive searches
  }

  // Insert a node into the BST
  insert(item: FileSystemItem, path: string[]): void {
    const newNode: BSTNode = {
      item,
      path,
      left: null,
      right: null
    };

    // Add to BST
    if (!this.root) {
      this.root = newNode;
    } else {
      let current = this.root;
      while (true) {
        if (item.name < current.item.name) {
          if (!current.left) {
            current.left = newNode;
            break;
          }
          current = current.left;
        } else {
          if (!current.right) {
            current.right = newNode;
            break;
          }
          current = current.right;
        }
      }
    }

    // Add to both indices
    this.addToIndices(item, path);
  }

  // Add item to both indices
  private addToIndices(item: FileSystemItem, path: string[]): void {
    // Case-sensitive index
    this.addToIndex(item.name, item, path, this.caseSensitiveIndex);

    // Case-insensitive index
    this.addToIndex(item.name.toLowerCase(), item, path, this.caseInsensitiveIndex);
  }

  // Helper method to add to a specific index
  private addToIndex(
    name: string,
    item: FileSystemItem,
    path: string[],
    index: Map<string, FileSystemSearchResult[]>
  ): void {
    // Add all possible substrings of length 3 or more
    for (let i = 0; i <= name.length - 3; i++) {
      for (let j = i + 3; j <= name.length; j++) {
        const substring = name.substring(i, j);
        if (!index.has(substring)) {
          index.set(substring, []);
        }
        index.get(substring)!.push({item, path});
      }
    }
  }

  // Search for exact name match (case-sensitive)
  searchExact(name: string, caseSensitive: boolean = true): FileSystemSearchResult {
    let current = this.root;
    const searchName = caseSensitive ? name : name.toLowerCase();

    while (current) {
      const currentName = caseSensitive ? current.item.name : current.item.name.toLowerCase();

      if (searchName === currentName) {
        return {item: current.item, path: current.path};
      } else if (searchName < currentName) {
        current = current.left;
      } else {
        current = current.right;
      }
    }

    return {item: null, path: []};
  }

  // Search for items containing substring with case sensitivity option
  searchBySubstring(
    substring: string,
    caseSensitive: boolean = false
  ): FileSystemSearchResult[] {
    const searchSub = caseSensitive ? substring : substring.toLowerCase();
    const index = caseSensitive ? this.caseSensitiveIndex : this.caseInsensitiveIndex;
    const results: FileSystemSearchResult[] = [];

    // Check if we have this substring in our index
    if (index.has(searchSub)) {
      return index.get(searchSub)!;
    }

    // If not in index, perform a full traversal (fallback)
    this.traverseForSubstring(this.root, searchSub, results, caseSensitive);
    return results;
  }

  // Helper method to traverse BST for substring matches
  private traverseForSubstring(
    node: BSTNode | null,
    substring: string,
    results: FileSystemSearchResult[],
    caseSensitive: boolean
  ): void {
    if (!node) return;

    // Check current node
    const itemName = caseSensitive ? node.item.name : node.item.name.toLowerCase();
    if (itemName.includes(substring)) {
      results.push({item: node.item, path: node.path});
    }

    // Traverse left and right
    this.traverseForSubstring(node.left, substring, results, caseSensitive);
    this.traverseForSubstring(node.right, substring, results, caseSensitive);
  }
}


// // Case-insensitive search for "doc"
// console.log("\n=== Case-Insensitive Search for 'doc' ===");
// const docResultsInsensitive = fileSystemBST.searchBySubstring("doc", false);
// console.log(`Found ${docResultsInsensitive.length} items containing "doc" (case-insensitive):`);
// docResultsInsensitive.forEach((result, index) => {
//   console.log(`\nResult #${index + 1}:`);
//   console.log("Item:", result.item.name);
//   console.log("Path:", result.path.map(p => p.name).join(" > "));
// });
//
// // Case-sensitive search for "doc"
// console.log("\n=== Case-Sensitive Search for 'doc' ===");
// const docResultsSensitive = fileSystemBST.searchBySubstring("doc", true);
// console.log(`Found ${docResultsSensitive.length} items containing "doc" (case-sensitive):`);
// docResultsSensitive.forEach((result, index) => {
//   console.log(`\nResult #${index + 1}:`);
//   console.log("Item:", result.item.name);
//   console.log("Path:", result.path.map(p => p.name).join(" > "));
// });
//
// // Case-insensitive search for ".PDF"
// console.log("\n=== Case-Insensitive Search for '.PDF' ===");
// const pdfResultsInsensitive = fileSystemBST.searchBySubstring(".PDF", false);
// console.log(`Found ${pdfResultsInsensitive.length} items containing '.PDF' (case-insensitive):`);
// pdfResultsInsensitive.forEach((result, index) => {
//   console.log(`\nResult #${index + 1}:`);
//   console.log("Item:", result.item.name);
//   console.log("Path:", result.path.map(p => p.name).join(" > "));
// });
//
// // Case-sensitive search for ".PDF"
// console.log("\n=== Case-Sensitive Search for '.PDF' ===");
// const pdfResultsSensitive = fileSystemBST.searchBySubstring(".PDF", true);
// console.log(`Found ${pdfResultsSensitive.length} items containing '.PDF' (case-sensitive):`);
// pdfResultsSensitive.forEach((result, index) => {
//   console.log(`\nResult #${index + 1}:`);
//   console.log("Item:", result.item.name);
//   console.log("Path:", result.path.map(p => p.name).join(" > "));
// });
//
// // Exact match search with case sensitivity
// console.log("\n=== Exact Match Search ===");
// const exactMatchCaseInsensitive = fileSystemBST.searchExact("documents", false);
// console.log("\nCase-insensitive exact match for 'documents':");
// if (exactMatchCaseInsensitive.item) {
//   console.log("Found:", exactMatchCaseInsensitive.item.name);
//   console.log("Path:", exactMatchCaseInsensitive.path.map(p => p.name).join(" > "));
// } else {
//   console.log("Not found");
// }
//
// const exactMatchCaseSensitive = fileSystemBST.searchExact("Documents", true);
// console.log("\nCase-sensitive exact match for 'Documents':");
// if (exactMatchCaseSensitive.item) {
//   console.log("Found:", exactMatchCaseSensitive.item.name);
//   console.log("Path:", exactMatchCaseSensitive.path.map(p => p.name).join(" > "));
// } else {
//   console.log("Not found");
// }
