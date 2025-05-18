import styles from "./Workspace.module.css";
import RouteList from "../components/routeList/RouteList";
import Toolbar from "../components/toolbar/Toolbar";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

type MarkdownInfos = {
  title: string;
  id: number | null;
  front: string;
  back: string | null;
};

type JsonInfos = {
  creation_timestamp: string; // ISO 8601
  last_review: string | null;
  scores: number[];
};

type Flashcard = {
  from_markdown: MarkdownInfos;
  from_json: JsonInfos;
};

function Workspace({ workspacePath }: { workspacePath: string[] | null }) {
  let [parsedFlashcards, setParsedFlashcards] = useState<Record<string, Flashcard> | null>(null);
  let [currCardIndex, setCurrCardIndex] = useState(0);
  let [error, setError] = useState<string | null>(null);

  useEffect(() => {


    if (workspacePath && workspacePath.length === 2) {
      let jsonFile = null;
      let markdownFile = null;

      for (const path of workspacePath) {
        if (path.endsWith('.json')) {
          jsonFile = path;
        } else if (path.endsWith('.md')) {
          markdownFile = path;
        }
      }

      if (jsonFile && markdownFile) {
        invoke("read_markdown", { markdown: markdownFile, json: jsonFile }).then((data) => {
          setParsedFlashcards(JSON.parse(data as string));
        })
      } else {
        setError("Please select a markdown file and a json file");
      }

    }
    else {
      setError("Exactly two files must be selected");
    }
  }, [workspacePath]);

  return (
    <Toolbar>
      <RouteList />
      <div className={styles.main}>
        {
          workspacePath ?
            workspacePath.map((path, index) => (
              <div key={index} className={styles.file}>
                {path}
              </div>
            ))
            : "No workspace selected"
        }
        {error && <div className={styles.error}>{error}</div>}
        <div className={`${styles.markdownContainer} ${styles.invisibleScrollbar}`}>
          <div >
            <Markdown rehypePlugins={[rehypeRaw]}>
              {
                parsedFlashcards
                  ? (Object.keys(parsedFlashcards).length > 0
                    ? parsedFlashcards[Object.keys(parsedFlashcards)[currCardIndex]].from_markdown.front
                    : '# Empty deck!')
                  : 'No deck loaded'
              }
            </Markdown>
          </div>
        </div>
      </div>
    </Toolbar>
  );
}
export default Workspace;
