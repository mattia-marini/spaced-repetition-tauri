import { useNavigate } from "react-router-dom";
import styles from "./Toolbar.module.css";
import { useEffect } from "react";
import Separator from "../separator/Separator";

function Toolbar({ children }: React.PropsWithChildren) {
  useEffect(() => {
    console.log(children)
  }, []);
  const navigate = useNavigate();
  return (
    <div className={styles.container}>
      <div style={{ flexGrow: 0 }}>
        {Array.isArray(children) ? children[0] : children}
      </div>
      <Separator />
      <div style={{ flexGrow: 1, display: "flex" }}>
        {Array.isArray(children) ? children[1] : null}
      </div>
    </div >
  );
}
export default Toolbar;
