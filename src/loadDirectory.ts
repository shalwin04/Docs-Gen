import fs from "fs";
import path from "path";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { Document } from "langchain/document";

const loadDirectory = async (directoryPath: string): Promise<Document[]> => {
  const documents: Document[] = [];
  const allowedExtensions = [".js", ".jsx", ".ts", ".tsx"];

  const loadFilesRecursively = async (currentPath: string): Promise<void> => {
    const filesAndDirs = fs.readdirSync(currentPath);

    for (const item of filesAndDirs) {
      const itemPath = path.join(currentPath, item);
      const stats = fs.statSync(itemPath);

      // Skip the node_modules directory
      if (stats.isDirectory() && item !== "node_modules") {
        await loadFilesRecursively(itemPath);
      } else if (
        stats.isFile() &&
        allowedExtensions.includes(path.extname(itemPath))
      ) {
        const loader = new TextLoader(itemPath);
        const doc = await loader.load();

        if (doc && doc.length > 0) {
          documents.push(...doc);
          console.log(`Loaded document from file: ${itemPath}`);
        } else {
          console.warn(
            `Skipped empty or undefined document in file: ${itemPath}`
          );
        }
      }
    }
  };

  await loadFilesRecursively(directoryPath);

  return documents;
};

export { loadDirectory };
