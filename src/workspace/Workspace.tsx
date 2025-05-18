import styles from "./Workspace.module.css";
import RouteList from "../components/routeList/RouteList";
import Toolbar from "../components/toolbar/Toolbar";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function Workspace({ workspacePath }: { workspacePath: string[] | null }) {
  let [markdown, setMarkdown] = useState<string>("");
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
          setMarkdown(data as string);
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
            <Markdown rehypePlugins={[rehypeRaw]} >{markdown}</Markdown>
          </div>
        </div>
      </div>
    </Toolbar>
  );
}
export default Workspace;
