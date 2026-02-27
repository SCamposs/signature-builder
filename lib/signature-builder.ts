import type { SignatureData } from "@/types/signature";

// --- Identidade visual -----------------------------------------------------
export const BLUE = "#003087"; // Pantone Blue 072C (aproximacao)
export const RED = "#E4002B"; // Pantone 185C

// --- Dados fixos da instituicao -------------------------------------------
const INSTITUTION = "Instituto São José Salesiano - Resende";
const EMAIL_FALLBACK = "secretaria.isj@salesiano.br";
const WEBSITE_LABEL = "www.salesianos.br/unidade/colegio-salesiano-resende";
const WEBSITE_URL =
  "https://www.salesianos.br/unidade/colegio-salesiano-resende";
const FACEBOOK_URL = "https://www.facebook.com/saleresende/?locale=pt_BR";
const LINKEDIN_URL = "https://www.linkedin.com/in/salesiano-resende-colégio/";
const DEFAULT_ASSET_BASE =
  process.env.NEXT_PUBLIC_SIGNATURE_ASSET_BASE?.trim() ||
  "https://signature-salesiano.vercel.app";

export function buildSignatureHTML(
  data: SignatureData,
  base = DEFAULT_ASSET_BASE,
): string {
  const normalizedBase = base.trim().replace(/\/+$/, "");
  const img = (path: string) => `${normalizedBase}${path}`;
  const emailAddr = data.email.trim() || EMAIL_FALLBACK;

  const directPhoneRow = data.phone.trim()
    ? `<tr>
        <td style="padding-bottom:5px;vertical-align:middle;">
          <img src="${img("/assets/phone.png")}" alt="" width="14" height="14"
            style="display:inline-block;vertical-align:middle;margin-right:6px;border:0;" />
          <a href="tel:${sanitizePhone(data.phone)}"
            style="font-size:12px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
            ${esc(data.phone)}
          </a>
        </td>
      </tr>`
    : "";

  return `
<table cellpadding="0" cellspacing="0" border="0"
  style="font-family:Arial,Helvetica,sans-serif;max-width:580px;border-collapse:collapse;">
  <tbody>
    <tr>
      <td style="vertical-align:top;padding-right:18px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody>
          <tr>
            <td style="font-size:17px;font-weight:700;color:${BLUE};white-space:nowrap;
                       padding-bottom:3px;font-family:Arial,Helvetica,sans-serif;">
              ${esc(data.name)}
            </td>
          </tr>
          ${data.role.trim() ? `<tr><td style="font-size:13px;color:#333333;padding-bottom:2px;font-family:Arial,Helvetica,sans-serif;">${esc(data.role)}</td></tr>` : ""}
          ${data.department.trim() ? `<tr><td style="font-size:12px;color:#555555;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;padding-bottom:4px;font-family:Arial,Helvetica,sans-serif;">${esc(data.department)}</td></tr>` : ""}
          <tr>
            <td style="font-size:11px;color:#888888;padding-top:3px;font-family:Arial,Helvetica,sans-serif;">
              ${INSTITUTION}
            </td>
          </tr>
        </tbody></table>
      </td>
      <td style="width:2px;background-color:${BLUE};opacity:0.1">&nbsp;</td>
      <td style="width:16px;">&nbsp;</td>
      <td style="vertical-align:top;padding-right:18px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody>
          ${directPhoneRow}
          <tr>
            <td style="padding-bottom:5px;vertical-align:middle;">
              <img src="${img("/assets/mail.png")}" alt="" width="14" height="14"
                style="display:inline-block;vertical-align:middle;margin-right:6px;border:0;" />
              <a href="mailto:${emailAddr}"
                style="font-size:12px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                ${esc(emailAddr)}
              </a>
            </td>
          </tr>
          <tr>
            <td style="vertical-align:middle;">
              <img src="${img("/assets/link.png")}" alt="" width="14" height="14"
                style="display:inline-block;vertical-align:middle;margin-right:6px;border:0;" />
              <a href="${WEBSITE_URL}" target="_blank"
                style="font-size:12px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;">
                ${WEBSITE_LABEL}
              </a>
            </td>
          </tr>
        </tbody></table>
      </td>
      <td style="width:16px;">&nbsp;</td>
      <td style="vertical-align:middle;">
        <a href="${WEBSITE_URL}" target="_blank">
          <img src="${img("/assets/logo-salesiano-resende.png")}"
            alt="${INSTITUTION}" width="100" style="display:block;border:0;" />
        </a>
      </td>
    </tr>
    <tr><td colspan="6" style="height:10px;font-size:0;line-height:0;"></td></tr>
    <tr>
      <td colspan="6" style="height:2px;background-color:${BLUE};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="6" style="padding-top:8px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody>
          <tr>
            <td style="vertical-align:middle;padding-right:10px;">
              <img src="${img("/assets/logo-arco-s.png")}" alt="S Salesiano"
                height="26" style="display:block;border:0;" />
            </td>
            <td style="width:1px;background-color:${BLUE};opacity:0.1;">&nbsp;</td>
            <td style="width:10px;">&nbsp;</td>
            <td style="vertical-align:middle;padding-right:6px;">
              <a href="${FACEBOOK_URL}" target="_blank">
                <img src="${img("/assets/facebook.png")}" alt="Facebook" width="22" height="22" style="display:block;border:0;" />
              </a>
            </td>
            <td style="vertical-align:middle;padding-right:6px;">
              <a href="https://www.instagram.com/salesianoresende" target="_blank">
                <img src="${img("/assets/instagram.png")}" alt="Instagram" width="22" height="22" style="display:block;border:0;" />
              </a>
            </td>
            <td style="vertical-align:middle;">
              <a href="${LINKEDIN_URL}" target="_blank">
                <img src="${img("/assets/linkedin.png")}" alt="LinkedIn" width="22" height="22" style="display:block;border:0;" />
              </a>
            </td>
          </tr>
        </tbody></table>
      </td>
    </tr>
    <tr><td colspan="6" style="height:6px;font-size:0;line-height:0;"></td></tr>
  </tbody>
</table>`.trim();
}

function esc(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sanitizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `+55${digits.startsWith("0") ? digits.slice(1) : digits}`;
}
