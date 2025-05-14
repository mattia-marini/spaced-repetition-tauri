import styles from "./Workspace.module.css";
import RouteList from "../components/routeList/RouteList";
import Toolbar from "../components/toolbar/Toolbar";

function Workspace({ workspacePath }: { workspacePath: string[] | null }) {
  return (
    <Toolbar>
      <RouteList />
      <div className={styles.main} id="dropzone">
        {
          workspacePath ?
            workspacePath.map((path, index) => (
              <div key={index} className={styles.file}>
                {path}
              </div>
            ))
            : "No workspace selected"
        }

      </div>
    </Toolbar>
  );
}
export default Workspace;
