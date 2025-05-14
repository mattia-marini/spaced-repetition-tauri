import styles from "./Main.module.css";
import RouteList from "../components/routeList/RouteList";
import Toolbar from "../components/toolbar/Toolbar";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";

import { getCurrentWindow, LogicalPosition, LogicalSize, Window } from "@tauri-apps/api/window";
import { useNavigate } from "react-router-dom";

function Main({ setSelectedWorkspace }: { setSelectedWorkspace: Dispatch<SetStateAction<string[] | null>> }) {
  let dropzone = useRef<HTMLDivElement>(null);
  let tauriWindow = useRef<Window | null>(null);
  let scaleFactor = useRef<number>(1);
  let [dropOver, setDropOver] = useState(false);
  let navigate = useNavigate()


  useEffect(() => {
    let newTauriWindow = getCurrentWindow();
    tauriWindow.current = newTauriWindow;
    setupDragDrop();

    tauriWindow.current.scaleFactor().then((newScaleFactor) => {
      scaleFactor.current = newScaleFactor;
    })
  }, []);

  const setupDragDrop = () => {

    return tauriWindow.current!.onDragDropEvent(async (event) => {

      if (event.payload.type == "over") {
        if (await isCoordinateInBoundsOfElement(new LogicalPosition(event.payload.position.x, event.payload.position.y), dropzone.current))
          setDropOver(true)
        else
          setDropOver(false)
      }
      else if (event.payload.type == "drop") {
        setDropOver(false)

        console.log(event.payload.paths);
        setSelectedWorkspace(event.payload.paths)

        navigate("/workspace")
      }
      else {
        setDropOver(false)
        console.log('File drop cancelled');
      }
    })
  }

  const isCoordinateInBoundsOfElement = async (logicalPosition: LogicalPosition, element: HTMLElement | null) => {

    if (!element) {
      return false;
    }

    const rect = element.getBoundingClientRect();
    const tabBarHeight = await getTabBarHeightLogical()
    // console.log(rect)

    let x = logicalPosition.x
    let y = logicalPosition.y

    // Check if the coordinates are within the bounds
    return (
      x >= rect.left &&
      x <= rect.right &&
      (y - tabBarHeight) >= rect.top &&
      (y - tabBarHeight) <= rect.bottom
    );
  }

  async function getTabBarHeightLogical() {
    let innerSizeLogical = new LogicalSize(window.innerWidth, window.innerHeight)
    let outerSizeLogical = (await tauriWindow.current!.outerSize()).toLogical(scaleFactor.current)

    return outerSizeLogical.height - innerSizeLogical.height
  }


  return (
    <Toolbar>
      <RouteList />
      <div ref={dropzone} className={`${styles.dropzone} ${dropOver ? styles.dragover : ''}`} id="dropzone">
        Drag n drop workspace folder
      </div>
    </Toolbar>
  );
}
export default Main;




// const getTabBarHeightPhysical = async () => {
//   let innerSizeLogical = new LogicalSize(window.innerWidth, window.innerHeight)
//   let innerSizePhysical = innerSizeLogical.toPhysical(scaleFactor.current)
//
//   let outerSizePhysical = await tauriWindow.current!.outerSize()
//
//   return outerSizePhysical.height - innerSizePhysical.height
// }
