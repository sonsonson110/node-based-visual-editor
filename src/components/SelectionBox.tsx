import { useAppSelector } from "../hooks";
import { selectSelectionBox } from "../store/editorSlice";

function SelectionBox() {
  const selectionBox = useAppSelector(selectSelectionBox);

  if (!selectionBox) return null;

  const left = Math.min(selectionBox.startX, selectionBox.endX);
  const top = Math.min(selectionBox.startY, selectionBox.endY);
  const width = Math.abs(selectionBox.endX - selectionBox.startX);
  const height = Math.abs(selectionBox.endY - selectionBox.startY);

  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width,
        height,
        background: "rgba(100,150,255,0.2)",
        border: "1px solid rgba(100,150,255,0.8)",
        pointerEvents: "none",
      }}
    />
  );
}

export default SelectionBox;
