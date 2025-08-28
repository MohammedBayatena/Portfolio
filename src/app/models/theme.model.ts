export interface Theme {
  id: string;
  name: string;
  desktopBackground: string;
  iconStyle: {
    size: string;
    font: string;
    color: string;
    selectedColor: string;
    backgroundColor: string;
    selectedBackgroundColor: string;
  };
  windowStyle: {
    border: string;
    borderRadius: string;
    titleBar: {
      height: string;
      background: string;
      gradient?: string;
      color: string;
      fontWeight: string;
    };
    closeButton: {
      background: string;
      color: string;
    };
    minimizeButton: {
      background: string;
      color: string;
    };
  };
  taskbarStyle: {
    height: string;
    background: string;
    buttonStyle: {
      background: string;
      color: string;
      selectedBackground: string;
    };
  };
}
