import { useNavigate } from "react-router-dom";
import styles from "./RouteList.module.css";

function RouteList() {
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <button onClick={() => navigate("/workspace")} >
        Workspace
      </button>
      <button onClick={() => navigate("/")} >
        Main
      </button>
    </div>
  );
}
export default RouteList;
