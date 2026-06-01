type ErrorWithDetails = {
    statusCode?: number;
    responseHeaders?: Record<string, string | undefined>;
    responseBody?: string;
    message?: string;
    errors?: unknown[];
};

function getRetryAfterSeconds(error: ErrorWithDetails) {
    const headerValue = error.responseHeaders?.["retry-after"];
    const parsedHeader = headerValue ? Number(headerValue) : NaN;

    if (Number.isFinite(parsedHeader)) {
        return parsedHeader;
    }

    if (!error.responseBody) {
        return undefined;
    }

    try {
        const body = JSON.parse(error.responseBody) as {
            error?: { metadata?: { retry_after_seconds?: number } };
        };
        return body.error?.metadata?.retry_after_seconds;
    } catch {
        return undefined;
    }
}

function findApiError(error: unknown): ErrorWithDetails | undefined {
    if (!error || typeof error !== "object") {
        return undefined;
    }

    const current = error as ErrorWithDetails;

    if (current.statusCode || current.responseBody) {
        return current;
    }

    if (Array.isArray(current.errors)) {
        for (let i = current.errors.length - 1; i >= 0; i--) {
            const match = findApiError(current.errors[i]);
            if (match) return match;
        }
    }

    return undefined;
}

export function formatAiError(error: unknown) {
    const apiError = findApiError(error);

    if (apiError?.statusCode === 429) {
        const retryAfter = getRetryAfterSeconds(apiError);
        const wait = retryAfter ? ` Wait about ${Math.ceil(retryAfter)} seconds and try again.` : "";
        const model = process.env.OPENROUTER_DEFAULT_MODEL?.trim() || "openai/gpt-oss-20b:free";

        return [
            `OpenRouter rate limited the current model (${model}).${wait}`,
            "Use a paid/non-free OpenRouter model or add your own provider key in OpenRouter integrations to avoid the shared free-model limit.",
        ].join(" ");
    }

    if (apiError?.statusCode === 401) {
        return "OpenRouter rejected OPENROUTER_API_KEY. Check that the key in .env is valid.";
    }

    if (apiError?.message) {
        return apiError.message;
    }

    return error instanceof Error ? error.message : String(error);
}
