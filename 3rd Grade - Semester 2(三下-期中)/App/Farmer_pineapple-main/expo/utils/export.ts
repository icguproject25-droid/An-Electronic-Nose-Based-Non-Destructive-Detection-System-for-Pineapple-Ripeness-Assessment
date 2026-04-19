import { Alert, Platform, Share } from "react-native";

export async function exportCsvFile(fileName: string, content: string): Promise<void> {
  try {
    if (Platform.OS === "web") {
      const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    await Share.share({
      title: fileName,
      message: `${fileName}\n\n${content}`,
    });
  } catch (error) {
    console.log("[exportCsvFile] error", error);
    Alert.alert("Export failed", "Please try again.");
  }
}
