import type { SignatureData, SignatureTemplate } from "@/types/signature";

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
const INSTAGRAM_URL = "https://www.instagram.com/salesianoresende";
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
  const template: SignatureTemplate =
    data.template === "compact" ? "compact" : "standard";
  const emailAddr = data.email.trim() || EMAIL_FALLBACK;
  const facebookUrl = normalizeUrl(data.facebookUrl, FACEBOOK_URL);
  const instagramUrl = normalizeUrl(data.instagramUrl, INSTAGRAM_URL);
  const linkedinUrl = normalizeUrl(data.linkedinUrl, LINKEDIN_URL);

  const directPhoneRow = data.phone.trim()
    ? `<tr>
        <td style="padding-bottom:5px;">
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tbody><tr>
            <td style="vertical-align:middle;padding-right:6px;line-height:0;">
              <img src="${img("/assets/phone.png")}" alt="" width="14" height="14"
                style="display:block;border:0;" />
            </td>
            <td style="vertical-align:middle;white-space:nowrap;">
              <a href="tel:${sanitizePhone(data.phone)}"
                style="font-size:12px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;line-height:1.2;display:inline-block;white-space:nowrap;word-break:normal;overflow-wrap:normal;">
                ${esc(data.phone)}
              </a>
            </td>
          </tr></tbody></table>
        </td>
      </tr>`
    : "";

  if (template === "compact") {
    return `
<table cellpadding="0" cellspacing="0" border="0" width="540"
  style="font-family:Arial,Helvetica,sans-serif;width:540px;border-collapse:collapse;">
  <tbody>
    <tr>
      <td style="vertical-align:top;padding-right:12px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody>
          <tr>
            <td style="font-size:16px;font-weight:700;color:${BLUE};padding-bottom:2px;font-family:Arial,Helvetica,sans-serif;">
              ${esc(data.name)}
            </td>
          </tr>
          ${data.role.trim() ? `<tr><td style="font-size:12px;color:#333333;padding-bottom:1px;font-family:Arial,Helvetica,sans-serif;">${esc(data.role)}</td></tr>` : ""}
          ${data.department.trim() ? `<tr><td style="font-size:11px;color:#555555;font-weight:600;text-transform:uppercase;letter-spacing:0.3px;padding-bottom:3px;font-family:Arial,Helvetica,sans-serif;">${esc(data.department)}</td></tr>` : ""}
          <tr>
            <td style="font-size:10px;color:#888888;padding-top:2px;padding-bottom:4px;font-family:Arial,Helvetica,sans-serif;">
              ${INSTITUTION}
            </td>
          </tr>
        </tbody></table>
      </td>
      <td style="width:1px;background-color:${BLUE};font-size:0;line-height:0;opacity:0.1;">&nbsp;</td>
      <td style="width:12px;">&nbsp;</td>
      <td style="vertical-align:top;padding-right:12px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody>
          ${directPhoneRow}
          <tr>
            <td style="padding-bottom:4px;">
              <table cellpadding="0" cellspacing="0" border="0"><tbody><tr>
                <td style="vertical-align:middle;padding-right:6px;line-height:0;">
                  <img src="${img("/assets/mail.png")}" alt="" width="13" height="13" style="display:block;border:0;" />
                </td>
                <td style="vertical-align:middle;white-space:nowrap;">
                  <a href="mailto:${emailAddr}" style="font-size:11px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;line-height:1.2;display:inline-block;white-space:nowrap;">
                    ${esc(emailAddr)}
                  </a>
                </td>
              </tr></tbody></table>
            </td>
          </tr>
          <tr>
            <td style="vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" border="0"><tbody><tr>
                <td style="vertical-align:top;padding-right:6px;line-height:0;padding-top:1px;">
                  <img src="${img("/assets/link.png")}" alt="" width="13" height="13" style="display:block;border:0;" />
                </td>
                <td style="vertical-align:top;">
                  <a href="${WEBSITE_URL}" target="_blank" style="font-size:11px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;line-height:1.2;display:inline-block;">
                    ${WEBSITE_LABEL}
                  </a>
                </td>
              </tr></tbody></table>
            </td>
          </tr>
        </tbody></table>
      </td>
      <td style="vertical-align:middle;">
        <a href="${WEBSITE_URL}" target="_blank">
          <img src="${img("/assets/logo-salesiano-resende.png")}" alt="${INSTITUTION}" width="72" style="display:block;border:0;" />
        </a>
      </td>
    </tr>
    <tr>
      <td colspan="5" style="height:1px;background-color:${BLUE};font-size:0;line-height:0;">&nbsp;</td>
    </tr>
    <tr>
      <td colspan="5" style="padding-top:6px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody><tr>
          <td style="vertical-align:middle;padding-right:8px;">
            <img src="${img("/assets/logo-arco-s.png")}" alt="S Salesiano" height="22" style="display:block;border:0;" />
          </td>
          <td style="width:1px;background-color:${BLUE};font-size:0;line-height:0;opacity:0.1;">&nbsp;</td>
          <td style="width:8px;">&nbsp;</td>
          <td style="vertical-align:middle;padding-right:5px;"><a href="${facebookUrl}" target="_blank"><img src="${img("/assets/facebook.png")}" alt="Facebook" width="20" height="20" style="display:block;border:0;" /></a></td>
          <td style="vertical-align:middle;padding-right:5px;"><a href="${instagramUrl}" target="_blank"><img src="${img("/assets/instagram.png")}" alt="Instagram" width="20" height="20" style="display:block;border:0;" /></a></td>
          <td style="vertical-align:middle;"><a href="${linkedinUrl}" target="_blank"><img src="${img("/assets/linkedin.png")}" alt="LinkedIn" width="20" height="20" style="display:block;border:0;" /></a></td>
        </tr></tbody></table>
      </td>
    </tr>
  </tbody>
</table>`.trim();
  }

  return `
<table cellpadding="0" cellspacing="0" border="0" width="580"
  style="font-family:Arial,Helvetica,sans-serif;width:580px;border-collapse:collapse;">
  <tbody>
    <tr>
      <td width="212" style="vertical-align:top;padding-right:18px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody>
          <tr>
            <td style="font-size:17px;font-weight:700;color:${BLUE};
                       padding-bottom:3px;font-family:Arial,Helvetica,sans-serif;">
              ${esc(data.name)}
            </td>
          </tr>
          ${data.role.trim() ? `<tr><td style="font-size:13px;color:#333333;padding-bottom:2px;font-family:Arial,Helvetica,sans-serif;">${esc(data.role)}</td></tr>` : ""}
          ${data.department.trim() ? `<tr><td style="font-size:12px;color:#555555;font-weight:600;text-transform:uppercase;letter-spacing:0.4px;padding-bottom:4px;font-family:Arial,Helvetica,sans-serif;">${esc(data.department)}</td></tr>` : ""}
          <tr>
            <td style="font-size:11px;color:#888888;padding-top:3px;padding-bottom:4px;font-family:Arial,Helvetica,sans-serif;">
              ${INSTITUTION}
            </td>
          </tr>
        </tbody></table>
      </td>
      <td style="width:2px;background-color:${BLUE};font-size:0;line-height:0;opacity:0.1;">&nbsp;</td>
      <td style="width:16px;">&nbsp;</td>
      <td width="212" style="vertical-align:top;padding-right:18px;">
        <table cellpadding="0" cellspacing="0" border="0"><tbody>
          ${directPhoneRow}
          <tr>
            <td style="padding-bottom:5px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;"><tbody><tr>
                <td style="vertical-align:middle;padding-right:6px;line-height:0;">
                  <img src="${img("/assets/mail.png")}" alt="" width="14" height="14"
                    style="display:block;border:0;" />
                </td>
                <td style="vertical-align:middle;white-space:nowrap;">
                  <a href="mailto:${emailAddr}"
                    style="font-size:12px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;line-height:1.2;display:inline-block;white-space:nowrap;word-break:normal;overflow-wrap:normal;">
                    ${esc(emailAddr)}
                  </a>
                </td>
              </tr></tbody></table>
            </td>
          </tr>
          <tr>
            <td style="vertical-align:middle;">
              <table cellpadding="0" cellspacing="0" border="0"><tbody><tr>
                <td style="vertical-align:top;padding-right:6px;line-height:0;padding-top:1px;">
                  <img src="${img("/assets/link.png")}" alt="" width="14" height="14"
                    style="display:block;border:0;" />
                </td>
                <td style="vertical-align:top;">
                  <a href="${WEBSITE_URL}" target="_blank"
                    style="font-size:12px;color:#222222;text-decoration:none;font-family:Arial,Helvetica,sans-serif;line-height:1.2;display:inline-block;">
                    ${WEBSITE_LABEL}
                  </a>
                </td>
              </tr></tbody></table>
            </td>
          </tr>
        </tbody></table>
      </td>
      <td style="width:16px;">&nbsp;</td>
      <td width="86" style="vertical-align:middle;">
        <a href="${WEBSITE_URL}" target="_blank">
          <img src="${img("/assets/logo-salesiano-resende.png")}"
            alt="${INSTITUTION}" width="86" style="display:block;border:0;" />
        </a>
      </td>
    </tr>
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
            <td style="width:1px;background-color:${BLUE};font-size:0;line-height:0;opacity:0.1;">&nbsp;</td>
            <td style="width:10px;">&nbsp;</td>
            <td style="vertical-align:middle;padding-right:6px;">
              <a href="${facebookUrl}" target="_blank">
                <img src="${img("/assets/facebook.png")}" alt="Facebook" width="22" height="22" style="display:block;border:0;" />
              </a>
            </td>
            <td style="vertical-align:middle;padding-right:6px;">
              <a href="${instagramUrl}" target="_blank">
                <img src="${img("/assets/instagram.png")}" alt="Instagram" width="22" height="22" style="display:block;border:0;" />
              </a>
            </td>
            <td style="vertical-align:middle;">
              <a href="${linkedinUrl}" target="_blank">
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

function normalizeUrl(value: string, fallback: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return fallback;
  }

  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  return `https://${trimmed}`;
}
