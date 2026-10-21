import { YouCamError, failureFromCode, scanFailure } from "./errors";
import { errorBodySchema } from "./schemas";

export interface HttpOptions {
  baseUrl: string;
  apiKey: string;
  fetch?: typeof fetch;
  /** Injected in tests so retries don't wait. */
  sleep?: (ms: number) => Promise<void>;
  /** Delay before each retry; its length is the number of retries. */
  backoffMs?: readonly number[];
  timeoutMs?: number;
}

const DEFAULT_BACKOFF = [400, 1200] as const;
const defaultSleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

const retryable = (status: number) => status >= 500 || status === 429;

export interface RequestOptions {
  /** Task-creation POSTs must pass false: a retry after an ambiguous failure could charge twice. */
  retry?: boolean;
}

/**
 * Authenticated JSON request. Retries network errors, 5xx and 429 unless retry is false;
 * maps failures to YouCamError (flagged ambiguous when the server may have acted on the request).
 */
export async function youcamRequest(
  options: HttpOptions,
  method: "GET" | "POST",
  path: string,
  body?: unknown,
  { retry = true }: RequestOptions = {},
): Promise<unknown> {
  const doFetch = options.fetch ?? globalThis.fetch;
  const sleep = options.sleep ?? defaultSleep;
  const backoff = retry ? (options.backoffMs ?? DEFAULT_BACKOFF) : [];

  for (let attempt = 0; ; attempt++) {
    const last = attempt >= backoff.length;
    let response: Response;
    try {
      response = await doFetch(`${options.baseUrl}${path}`, {
        method,
        headers: {
          Authorization: `Bearer ${options.apiKey}`,
          Accept: "application/json",
          ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
        cache: "no-store",
        signal: AbortSignal.timeout(options.timeoutMs ?? 15_000),
      });
    } catch {
      if (last) throw new YouCamError(scanFailure("network"), `${method} ${path}: network error`, true);
      await sleep(backoff[attempt]);
      continue;
    }

    if (response.ok) {
      try {
        return await response.json();
      } catch {
        throw new YouCamError(scanFailure("unknown"), `${method} ${path}: invalid JSON`, true);
      }
    }
    if (retryable(response.status) && !last) {
      await sleep(backoff[attempt]);
      continue;
    }
    throw await failureFromResponse(response, method, path);
  }
}

async function failureFromResponse(response: Response, method: string, path: string): Promise<YouCamError> {
  let code: string | undefined;
  try {
    const parsed = errorBodySchema.safeParse(await response.json());
    if (parsed.success) code = parsed.data.error_code ?? parsed.data.code ?? parsed.data.error ?? undefined;
  } catch {
    // body is optional
  }
  const failure = retryable(response.status)
    ? scanFailure("network")
    : failureFromCode(code, response.status);
  const message = `${method} ${path}: HTTP ${response.status}${code ? ` ${code}` : ""}`;
  return new YouCamError(failure, message, response.status >= 500);
}
