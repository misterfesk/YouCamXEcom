import type { SkinAnalysisOutput } from "@/lib/skin/normalize";
import type { FitzpatrickType } from "@/types/skin";
import type { TaskPoll } from "./poll";

export interface FileUpload {
  fileId: string;
  upload: { url: string; method: "PUT"; headers: Record<string, string> };
}

export interface YouCamClient {
  createFile(input: { contentType: "image/jpeg"; fileSize: number }): Promise<FileUpload>;
  startSkinAnalysis(fileId: string): Promise<string>;
  startFitzpatrick(fileId: string): Promise<string>;
  pollSkinAnalysis(taskId: string): Promise<TaskPoll<SkinAnalysisOutput[]>>;
  pollFitzpatrick(taskId: string): Promise<TaskPoll<FitzpatrickType>>;
  /** Total remaining units across all credit entries. */
  getCreditBalance(): Promise<number>;
}
