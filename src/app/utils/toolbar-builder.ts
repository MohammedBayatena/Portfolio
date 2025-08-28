import {ToolbarAction, ToolbarModel} from '../models/window-toolbar.model';

export class ToolbarBuilder {


  private toolbarModel: ToolbarModel = {dropdowns: []};
  private currentDropdownIndex: number = -1; // Will become 0 after the First DropDown is Added.
  private dividerIndex: number = 1; // Reset on Every DropDown Add


  public GetToolbar(): ToolbarModel {
    return this.toolbarModel;
  }

  public AddDropdown(id: string, label: string): ToolbarBuilder {
    this.toolbarModel.dropdowns.push({
      id: id,
      label: label,
      items: []
    });
    this.currentDropdownIndex++;
    this.dividerIndex = 1;
    return this
  }

  public AddDropDownItem(option: ToolbarAction): ToolbarBuilder {
    this.toolbarModel.dropdowns[this.currentDropdownIndex].items.push(option);
    return this
  }

  public AddDivider(): ToolbarBuilder {
    this.toolbarModel.dropdowns[this.currentDropdownIndex].items.push({
      id: `divider${this.dividerIndex}`,
      label: '',
      divider: true
    });
    this.dividerIndex++;
    return this
  }


}
