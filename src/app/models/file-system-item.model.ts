import {FileSystemItemType, SizeUnit} from '../services/file-system.service';

export interface FileSystemItem {
  id: string; // ID Used for Identification and Indexing
  name: string; // Display Name
  type: FileSystemItemType; // Type of the System Item
  icon: string; // Icon as Text/Emoji - Used when iconUrl not Provided
  children?: FileSystemItem[]; // Children on this System Item
  content?: string; // Only Applicable To Items Of Type File, This is the File Content as String
  iconUrl?: string; // Optional URL for custom icons
  src?: string; // Optional source for media files
  action?: () => void; // Action Executed when System Item is Clicked or Any Other Event as per need
  size?: number; // Only Applicable to System Files of Type Drive / CD-Rom
  freeSpace?: number; // Only Applicable to System Files of Type Drive / CD-Rom
  spaceUnit?: SizeUnit; // Only Applicable to System Files of Type Drive / CD-Rom
}
