export interface Lead {
  phone: string;
  formType: "callback" | "catalog" | "calculation" | "colors";
  messenger?: string;
  sourcePage?: string;
  formTitle?: string;
}

const FAILED = "Не удалось отправить заявку. Попробуйте позже.";

async function call(init?: RequestInit) {
  let response: Response;
  try {
    response = await fetch("/send.php", { cache: "no-store", ...init });
  } catch {
    throw new Error(FAILED);
  }
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || FAILED);
  return body;
}

/**
 * Sends a form request to send.php. The handler accepts a request only with a
 * fresh one-time token, so bots posting numbers straight to it are refused.
 * Throws an Error whose message can be shown to the person.
 */
export async function submitLead(lead: Lead): Promise<void> {
  const { token } = await call();
  await call({
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...lead, token }),
  });
}
