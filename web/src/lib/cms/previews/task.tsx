/* eslint-disable @typescript-eslint/no-explicit-any */
import { Task } from "@/lib/types/types";
import { TaskElement } from "@/pages/tasks/[taskUrlSlug]";
import { useEffect, useRef } from "react";
type Props = {
  entry?: any;
  window: Window;
  document: Document;
  widgetsFor: (string: string) => any;
  widgetFor: (string: string) => any;
  getAsset: (string: string) => any;
};

const TaskPreview = (props: Props) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ref?.current?.ownerDocument.head.replaceWith(props.window.parent.document.head.cloneNode(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);

  const { body, ...data } = JSON.parse(JSON.stringify(props.entry.getIn(["data"])));
  const task: Task = { contentMd: body ?? "", ...data };

  return (
    <div ref={ref} style={{ margin: 40, pointerEvents: "none" }}>
      <TaskElement task={task} />
    </div>
  );
};

export default TaskPreview;
