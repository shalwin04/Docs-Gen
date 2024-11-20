"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadDirectory = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const text_1 = require("langchain/document_loaders/fs/text");
const loadDirectory = (directoryPath) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const documents = [];
    const allowedExtensions = [".js", ".jsx", ".ts", ".tsx"];
    const loadFilesRecursively = (currentPath) =>
      __awaiter(void 0, void 0, void 0, function* () {
        const filesAndDirs = fs_1.default.readdirSync(currentPath);
        for (const item of filesAndDirs) {
          const itemPath = path_1.default.join(currentPath, item);
          const stats = fs_1.default.statSync(itemPath);
          // Skip the node_modules directory
          if (stats.isDirectory() && item !== "node_modules") {
            yield loadFilesRecursively(itemPath);
          } else if (
            stats.isFile() &&
            allowedExtensions.includes(path_1.default.extname(itemPath))
          ) {
            const loader = new text_1.TextLoader(itemPath);
            const doc = yield loader.load();
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
      });
    yield loadFilesRecursively(directoryPath);
    return documents;
  });
exports.loadDirectory = loadDirectory;
