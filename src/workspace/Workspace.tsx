import styles from "./Workspace.module.css";
import RouteList from "../components/routeList/RouteList";
import Toolbar from "../components/toolbar/Toolbar";
import Markdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function Workspace({ workspacePath }: { workspacePath: string[] | null }) {
  let [markdown, setMarkdown] = useState<string>("");

  useEffect(() => {
    invoke("read_markdown", { workspacePath: workspacePath![0] }).then((data) => {
      setMarkdown(data as string);
      // console.log(data)
    })
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
        <div className={styles.markdownContainer}>
          <div style={{ width: "100%", height: "100%" }}>
            <Markdown rehypePlugins={[rehypeRaw]} >{markdown}</Markdown>
          </div>
        </div>
      </div>
    </Toolbar>
  );
}
export default Workspace;
