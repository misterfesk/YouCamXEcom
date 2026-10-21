import type { z } from "zod";
import { CONCERNS } from "@/types/skin";
import { DEFAULT_API_BASE_URL } from "./constants";
import { YouCamError, scanFailure } from "./errors";
import { assertServerOnly } from "./guard";
import { youcamRequest, type HttpOptions } from "./http";
import { interpretPoll } from "./poll";
import {
  creditSchema,
  fileCreateSchema,
  fitzpatrickResultsSchema,
  skinResultsSchema,
  taskCreateSchema,
} from "./schemas";
import type { YouCamClient } from "./types";

assertServerOnly();

export interface LiveClientOptions extends Partial<HttpOptions> {
  apiKey: string;
}

function parse<T extends z.ZodType>(schema: T, raw: unknown, what: string, ambiguous = false): z.output<T> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) throw new YouCamError(scanFailure("unknown"), `Unexpected ${what} response`, ambiguous);
  return parsed.data;
}

/** Headers the browser sets itself; sending them from fetch() is forbidden or redundant. */
const FORBIDDEN_UPLOAD_HEADERS = new Set(["content-length", "host"]);

export function createLiveClient(options: LiveClientOptions): YouCamClient {
  const http: HttpOptions = { baseUrl: DEFAULT_API_BASE_URL, ...options };
  const request = (method: "GET" | "POST", path: string, body?: unknown, retry = true) =>
    youcamRequest(http, method, path, body, { retry });

  const startTask = async (feature: string, body: unknown) => {
    // Never retried: a repeat after a lost reply would start (and charge) a second task.
    const raw = await request("POST", `/s2s/v2.0/task/${feature}`, body, false);
    return parse(taskCreateSchema, raw, "task", true).data.task_id;
  };

  return {
    async createFile({ contentType, fileSize }) {
      const raw = await request("POST", "/s2s/v2.0/file", {
        files: [{ content_type: contentType, file_name: `scan-${Date.now()}.jpg`, file_size: fileSize }],
      });
      const file = parse(fileCreateSchema, raw, "file").data.files[0];
      const put = file.requests[0];
      const headers = Object.fromEntries(
        Object.entries(put.headers ?? {}).filter(([name]) => !FORBIDDEN_UPLOAD_HEADERS.has(name.toLowerCase())),
      );
      return { fileId: file.file_id, upload: { url: put.url, method: "PUT", headers } };
    },

    startSkinAnalysis: (fileId) =>
      startTask("skin-analysis", {
        src_file_id: fileId,
        dst_actions: [...CONCERNS, "skin_type"],
        miniserver_args: { enable_mask_overlay: false },
        format: "json",
      }),

    startFitzpatrick: (fileId) =>
      startTask("fitzpatrick-scale-analyzer", { src_file_id: fileId, version: "1.0" }),

    async pollSkinAnalysis(taskId) {
      const raw = await request("GET", `/s2s/v2.0/task/skin-analysis/${encodeURIComponent(taskId)}`);
      return interpretPoll(raw, skinResultsSchema);
    },

    async pollFitzpatrick(taskId) {
      const raw = await request("GET", `/s2s/v2.0/task/fitzpatrick-scale-analyzer/${encodeURIComponent(taskId)}`);
      return interpretPoll(raw, fitzpatrickResultsSchema);
    },

    async getCreditBalance() {
      const raw = await request("GET", "/s2s/v1.0/client/credit");
      return parse(creditSchema, raw, "credit").results.reduce((sum, entry) => sum + entry.amount_dec, 0);
    },
  };
}
