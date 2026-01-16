export function getFileName(filepath: string) {
  return filepath.split("/").pop()!;
}

export function getFileExtension(filepath: string) {
  const fileName = getFileName(filepath);
  const extension = fileName.split(".").pop()!.toLocaleLowerCase();
  switch (extension) {
    case "doc":
    case "docx":
      return "Word";
    case "md":
      return "Markdown";
    case "txt":
      return "Text";
    case "ppt":
    case "pptx":
      return "PowerPoint";
    case "xls":
    case "xlsx":
      return "Excel";
    default:
      return extension.toUpperCase();
  }
}
