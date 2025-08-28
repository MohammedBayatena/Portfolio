export interface ContextMenuModel {
  id: string;
  label: string;
  disabled?: boolean;
  divider?: boolean;
  action?: () => void;
  children: ContextMenuModel[]
}
