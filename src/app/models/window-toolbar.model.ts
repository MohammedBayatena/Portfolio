export interface ToolbarAction {
  id: string;
  label: string;
  shortcut?: string;
  disabled?: boolean;
  divider?: boolean;
  action?: () => void;
}

export interface ToolbarDropdown {
  id: string;
  label: string;
  items: ToolbarAction[];
}

export interface ToolbarModel {
  dropdowns: ToolbarDropdown[];
}
