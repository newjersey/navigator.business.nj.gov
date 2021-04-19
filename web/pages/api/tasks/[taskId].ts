import type { NextApiRequest, NextApiResponse } from "next";
import { Task } from "../../../lib/types/types";
import { getTaskById } from "../../../lib/getTaskById";

export default async (req: NextApiRequest, res: NextApiResponse<Task>): Promise<void> => {
  const { taskId } = req.query;
  res.status(200).json(await getTaskById(taskId as string));
};
