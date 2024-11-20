import dotenv from "dotenv";

dotenv.config();

import fs from "fs";
import path from "path";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { formatDocumentsAsString } from "langchain/util/document";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { UnstructuredDirectoryLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import { loadDirectory } from "./loadDirectory";

import {
  END,
  MemorySaver,
  StateGraph,
  START,
  Annotation,
} from "@langchain/langgraph";

async function main() : Promise<void> {
  const API_KEY = process.env.GOOGLE_API_KEY;
  // const UN_API_KEY = process.env.UNSTRUCTURED_API_KEY;

  const model = new ChatGoogleGenerativeAI({
    model: "gemini-pro",
    apiKey: `${API_KEY}`,
    maxOutputTokens: 2048,
    safetySettings: [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      },
    ],
  });

  const directoryPath = process.cwd(); // Current working directory

  // const directoryPath =
  // "C:/Users/shalwin/OneDrive/Documents/langchain-projs/my-nakama/front-end";

  // List of allowed extensions
  // const allowedExtensions = [".js", ".jsx", ".ts", ".tsx"];

  // let documents = [];

  try {
    // const files = fs.readdirSync(directoryPath);

    // // Filter files based on their extension
    // const filteredFiles = files.filter((file) =>
    //   allowedExtensions.includes(path.extname(file))
    // );

    // for (const file of filteredFiles) {
    //   const filePath = path.join(directoryPath, file);
    //   const loader = new TextLoader(filePath);
    //   const doc = await loader.load();

    //   if (doc && doc.length > 0) {
    //     documents.push(...doc);
    //     console.log(`Loaded document from file: ${file}`);
    //   } else {
    //     console.warn(`Skipped empty or undefined document in file: ${file}`);
    //   }
    // }
    const documents = await loadDirectory(directoryPath);
    console.log("Total documents loaded:", documents.length);

    // const filteredDocs = documents.filter(
    //   (doc : string) => doc.pageContent && doc.pageContent.trim().length > 0
    // );

    // if (filteredDocs.length === 0) {
    //   console.error("No valid documents found. Exiting.");
    //   return;
    // }

    const javascriptSplitter = RecursiveCharacterTextSplitter.fromLanguage(
      "js",
      {
        chunkSize: 2000,
        chunkOverlap: 200,
      }
    );

    const texts = await javascriptSplitter.splitDocuments(documents);

    console.log("Loaded ", texts.length, " documents.");

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an API documentation generator for a local repository. Given the context of code comments and text extracted from various JavaScript and TypeScript files in the repository, analyze the content to generate detailed API documentation. The documentation should include the following aspects, but only if they are present in the provided input:

        Stay true to the context

Project Overview: Summarize the project's purpose, its main features.

Main Components: Describe the primary components of the codebase, including their roles and how they interact with each other.

API Endpoints:
List all the API endpoints, specifying the HTTP methods (GET, POST, PUT, DELETE, etc.).
For each endpoint, provide a description of its purpose, input parameters, request body structure, response format, and possible error codes.
Include code snippets that illustrate how to use the API endpoints.

Functions and Methods:
Document all the major functions and methods in the context, including their names, parameters, return values, and a brief description of their logic.
Highlight any complex logic or algorithms used, explaining how they work.

Data Models:
Outline the data models used in the project, including any database schemas or object structures.
Provide examples of how data is structured and manipulated within the application.

Design Patterns and Architectural Decisions:
Discuss any design patterns or architectural decisions implemented in the codebase, such as MVC, Singleton, Factory, etc.
Explain the rationale behind these choices and how they contribute to the overall functionality and maintainability of the project.

Configuration and Environment Variables:
List the environment variables and configuration settings required for the project to run.
Explain the purpose of each variable and how to set them up.

Security Considerations:
Identify any security measures implemented in the code, such as authentication, authorization, data validation, and error handling.
Provide guidelines for ensuring the API's security in different environments if present.

Ensure that each section is detailed and only includes information that is explicitly present in the context provided. Aim for clarity, completeness, and accuracy in the generated documentation.

Generate documentation based only on the provided input. Do not include information that is not explicitly present in the context
context: {context}`,
      ],
      // new MessagesPlaceholder("messages"),
    ]);

    const promptChain = RunnableSequence.from([
      {
        context: async () => {
          return formatDocumentsAsString(texts);
        },
      },
      prompt,
      model,
      // new StringOutputParser(),
    ]);

    // const promptChain = prompt.pipe(model);

    let genDocs = " ";

    const codeContext = async () => {
      return formatDocumentsAsString(texts);
    };

    const request = new HumanMessage({
      // content: async () => {
      //   return formatDocumentsAsString(texts);
      // },
      content: `Generate the documentation for the provided context`,
      // content: codeContext,
    });

    for await (const chunk of await promptChain.stream({
      // context: codeContext,
      messages: [request],
    })) {
      console.log(chunk.content);
      genDocs += chunk.content;
    }

    const reflectionPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are an API documentation evaluator. Generate critique and recommendations for the user's documentation.  
       Provide detailed recommendations, including requests for improvements in structure, clarity, accuracy, completeness, and style.  
       Also, check if the documentation generated is consistent with the provided context;`,
      ],
      //Additionally, suggest any missing sections or content, if applicable
      new MessagesPlaceholder("messages"),
    ]);
    const reflect = reflectionPrompt.pipe(model);

    let reflection = " ";
    for await (const chunk of await reflect.stream({
      context: codeContext,
      messages: [request, new HumanMessage({ content: genDocs })],
    })) {
      console.log(chunk.content);
      reflection += chunk.content;
    }

    let stream = await promptChain.stream({
      context: codeContext,
      messages: [
        request,
        new AIMessage({ content: genDocs }),
        new HumanMessage({ content: reflection }),
      ],
    });
    for await (const chunk of stream) {
      console.log(chunk.content);
    }

    // const State = Annotation.Root({
    //   messages: Annotation<BaseMessage[]>({
    //     reducer: (x, y) => x.concat(y),
    //   })
    // })


    // documents = "";
  } catch (err) {
    console.error("Unable to scan directory: " + err);
  }
  // const res = await combineDocumentsChain.invoke();

  // console.log("Documentation:", res);
}

main();
