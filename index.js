"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const google_genai_1 = require("@langchain/google-genai");
const generative_ai_1 = require("@google/generative-ai");
const text_splitter_1 = require("langchain/text_splitter");
const prompts_1 = require("@langchain/core/prompts");
const runnables_1 = require("@langchain/core/runnables");
const document_1 = require("langchain/util/document");
const messages_1 = require("@langchain/core/messages");
const loadDirectory_1 = require("./src/loadDirectory");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c, _d, e_2, _e, _f, _g, e_3, _h, _j;
        const API_KEY = process.env.GOOGLE_API_KEY;
        // const UN_API_KEY = process.env.UNSTRUCTURED_API_KEY;
        const model = new google_genai_1.ChatGoogleGenerativeAI({
            model: "gemini-pro",
            apiKey: `${API_KEY}`,
            maxOutputTokens: 2048,
            safetySettings: [
                {
                    category: generative_ai_1.HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: generative_ai_1.HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
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
            const documents = yield (0, loadDirectory_1.loadDirectory)(directoryPath);
            console.log("Total documents loaded:", documents.length);
            // const filteredDocs = documents.filter(
            //   (doc : string) => doc.pageContent && doc.pageContent.trim().length > 0
            // );
            // if (filteredDocs.length === 0) {
            //   console.error("No valid documents found. Exiting.");
            //   return;
            // }
            const javascriptSplitter = text_splitter_1.RecursiveCharacterTextSplitter.fromLanguage("js", {
                chunkSize: 2000,
                chunkOverlap: 200,
            });
            const texts = yield javascriptSplitter.splitDocuments(documents);
            console.log("Loaded ", texts.length, " documents.");
            const prompt = prompts_1.ChatPromptTemplate.fromMessages([
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
            const promptChain = runnables_1.RunnableSequence.from([
                {
                    context: () => __awaiter(this, void 0, void 0, function* () {
                        return (0, document_1.formatDocumentsAsString)(texts);
                    }),
                },
                prompt,
                model,
                // new StringOutputParser(),
            ]);
            // const promptChain = prompt.pipe(model);
            let genDocs = " ";
            const codeContext = () => __awaiter(this, void 0, void 0, function* () {
                return (0, document_1.formatDocumentsAsString)(texts);
            });
            const request = new messages_1.HumanMessage({
                // content: async () => {
                //   return formatDocumentsAsString(texts);
                // },
                content: `Generate the documentation for the provided context`,
                // content: codeContext,
            });
            try {
                for (var _k = true, _l = __asyncValues(yield promptChain.stream({
                    // context: codeContext,
                    messages: [request],
                })), _m; _m = yield _l.next(), _a = _m.done, !_a; _k = true) {
                    _c = _m.value;
                    _k = false;
                    const chunk = _c;
                    console.log(chunk.content);
                    genDocs += chunk.content;
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (!_k && !_a && (_b = _l.return)) yield _b.call(_l);
                }
                finally { if (e_1) throw e_1.error; }
            }
            const reflectionPrompt = prompts_1.ChatPromptTemplate.fromMessages([
                [
                    "system",
                    `You are an API documentation evaluator. Generate critique and recommendations for the user's documentation.  
       Provide detailed recommendations, including requests for improvements in structure, clarity, accuracy, completeness, and style.  
       Also, check if the documentation generated is consistent with the provided context;`,
                ],
                //Additionally, suggest any missing sections or content, if applicable
                new prompts_1.MessagesPlaceholder("messages"),
            ]);
            const reflect = reflectionPrompt.pipe(model);
            let reflection = " ";
            try {
                for (var _o = true, _p = __asyncValues(yield reflect.stream({
                    context: codeContext,
                    messages: [request, new messages_1.HumanMessage({ content: genDocs })],
                })), _q; _q = yield _p.next(), _d = _q.done, !_d; _o = true) {
                    _f = _q.value;
                    _o = false;
                    const chunk = _f;
                    console.log(chunk.content);
                    reflection += chunk.content;
                }
            }
            catch (e_2_1) { e_2 = { error: e_2_1 }; }
            finally {
                try {
                    if (!_o && !_d && (_e = _p.return)) yield _e.call(_p);
                }
                finally { if (e_2) throw e_2.error; }
            }
            let stream = yield promptChain.stream({
                context: codeContext,
                messages: [
                    request,
                    new messages_1.AIMessage({ content: genDocs }),
                    new messages_1.HumanMessage({ content: reflection }),
                ],
            });
            try {
                for (var _r = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _g = stream_1_1.done, !_g; _r = true) {
                    _j = stream_1_1.value;
                    _r = false;
                    const chunk = _j;
                    console.log(chunk.content);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (!_r && !_g && (_h = stream_1.return)) yield _h.call(stream_1);
                }
                finally { if (e_3) throw e_3.error; }
            }
            // const State = Annotation.Root({
            //   messages: Annotation<BaseMessage[]>({
            //     reducer: (x, y) => x.concat(y),
            //   })
            // })
            // documents = "";
        }
        catch (err) {
            console.error("Unable to scan directory: " + err);
        }
        // const res = await combineDocumentsChain.invoke();
        // console.log("Documentation:", res);
    });
}
main();
