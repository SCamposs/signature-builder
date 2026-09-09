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
  "https://signature-builder-v1.vercel.app";

export function buildSignatureHTML(
  data: SignatureData,
  base = DEFAULT_ASSET_BASE,
): string {
  const normalizedBase = base.trim().replace(/\/+$/, "");
  const img = (path: string) => `${normalizedBase}${path}`;
  const template: SignatureTemplate =
    data.template === "compact" || data.template === "latest"
      ? data.template
      : "standard";
  const emailAddr = data.email.trim() || EMAIL_FALLBACK;
  const facebookUrl = normalizeUrl(data.facebookUrl, FACEBOOK_URL);
  const instagramUrl = normalizeUrl(data.instagramUrl, INSTAGRAM_URL);
  const linkedinUrl = normalizeUrl(data.linkedinUrl, LINKEDIN_URL);

  if (template === "latest") {
    return buildLatestSignatureHTML({ data, img, emailAddr });
  }

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

function buildLatestSignatureHTML({
  data,
  img,
  emailAddr,
}: {
  data: SignatureData;
  img: (path: string) => string;
  emailAddr: string;
}): string {
  const location = "Av. Ariclino Dias, 256 <span style=\"font-family:'Geraldton Bold',Arial,Helvetica,sans-serif;font-weight:700;\">-</span> Jardim Jalisco<br />Resende <span style=\"font-family:'Geraldton Bold',Arial,Helvetica,sans-serif;font-weight:700;\">|</span> RJ";
  const contactIcon = (asset: string) => `
    <td width="22" style="width:22px;padding:0 7px 0 0;vertical-align:middle;line-height:0;">
      <table cellpadding="0" cellspacing="0" border="0" width="22" height="22" style="border-collapse:collapse;width:22px;height:22px;background:#e6394a;border-radius:50%;"><tbody><tr>
        <td align="center" valign="middle" style="line-height:0;text-align:center;vertical-align:middle;">
          <img src="${img(asset)}" alt="" width="13" height="13" style="display:block;border:0;filter:brightness(0) invert(1);margin:0 auto;" />
        </td>
      </tr></tbody></table>
    </td>`;

  const latestEmail = esc(emailAddr).replace("@", "<span style=\"font-family:'Geraldton Bold',Arial,Helvetica,sans-serif;font-weight:700;\">@</span>");

  const phoneRow = `<tr>
    ${contactIcon("/assets/phone-new.svg")}
    <td style="padding:0 0 5px;vertical-align:middle;font-family:Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:18px;color:#101010;white-space:nowrap;">
      <a href="tel:+552433551389" style="color:#101010;text-decoration:none;">(24) 3355 - 1389</a>
    </td>
  </tr>`;

  return `
<style type="text/css">
  @font-face { font-family: 'Facundo Black'; src: url('${img("/assets/facundo-black.otf")}') format('opentype'); font-weight: 800; }
  @font-face { font-family: 'Facundo Bold'; src: url('${img("/assets/facundo-bold.otf")}') format('opentype'); font-weight: 700; }
  @font-face { font-family: 'Geraldton Bold'; src: url('${img("/assets/geraldton-bold.otf")}') format('opentype'); font-weight: 700; }
</style>
<table cellpadding="0" cellspacing="0" border="0" width="650" style="width:650px;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;background:#ffffff;">
  <tbody>
    <tr>
      <td width="270" style="width:270px;padding:14px 28px 20px 30px;vertical-align:middle;text-align:center;">
        <a href="${WEBSITE_URL}" target="_blank" style="text-decoration:none;">
          <img src="${img("/assets/logo-salesiano-resende.png")}" alt="Salesiano Resende" width="205" style="display:block;width:205px;height:auto;border:0;margin:0 auto;" />
        </a>
      </td>
      <td width="3" style="width:3px;background:#175092;font-size:0;line-height:0;">&nbsp;</td>
      <td width="1" style="width:1px;font-size:0;line-height:0;">&nbsp;</td>
      <td style="padding:38px 12px 16px 44px;vertical-align:top;">
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;">
          <tbody>
            <tr>
              <td colspan="2" style="padding:0 0 1px;font-family:'Facundo Black',Arial,Helvetica,sans-serif;font-size:27px;font-weight:800;line-height:30px;color:#00518e;white-space:nowrap;">${esc(data.name)}</td>
            </tr>
            ${data.role.trim() ? `<tr><td colspan="2" style="padding:0 0 8px;font-family:'Facundo Black',Arial,Helvetica,sans-serif;font-size:17px;font-weight:800;line-height:19px;color:#101010;">${esc(data.role)}</td></tr>` : ""}
            <tr>
              ${contactIcon("/assets/map-pin.svg")}
              <td style="padding:0 0 6px;vertical-align:middle;font-family:'Facundo Bold',Arial,Helvetica,sans-serif;font-size:14px;font-weight:700;line-height:18px;color:#101010;">${location}</td>
            </tr>
            ${phoneRow}
            <tr>
              ${contactIcon("/assets/mail-new.svg")}
              <td style="padding:0 0 10px;vertical-align:middle;font-family:'Facundo Bold',Arial,Helvetica,sans-serif;font-size:15px;font-weight:700;line-height:18px;white-space:nowrap;">
                <a href="mailto:${emailAddr}" style="color:#145596;text-decoration:none;">${latestEmail}</a>
              </td>
            </tr>
            <tr>
              <td colspan="2" style="padding:0;line-height:0;">
                <a href="https://www.salesianos.br" target="_blank" style="text-decoration:none;">
                  <img src="${img("/assets/salesianos.br.png")}" alt="salesianos.br" width="164" style="display:block;width:164px;height:auto;border:0;" />
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
    <tr>
      <td colspan="4" style="padding:20px 0 0;">
        <table cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 auto;">
          <tbody>
            <tr>
              <td style="padding:0 8px 0 0;"><img src="${img("/assets/melhores-ongs-2017.png")}" alt="Melhores ONGs 2017" width="72" height="72" style="display:block;border:0;" /></td>
              <td style="padding:0 8px 0 0;"><img src="${img("/assets/melhores-ongs-2018.png")}" alt="Melhores ONGs 2018" width="72" height="72" style="display:block;border:0;" /></td>
              <td style="padding:0 8px 0 0;"><img src="${img("/assets/melhores-ongs-2021.png")}" alt="Melhores ONGs 2021" width="72" height="72" style="display:block;border:0;" /></td>
              <td style="padding:0 8px 0 0;"><img src="${img("/assets/melhores-ongs-2022.png")}" alt="Melhores ONGs 2022" width="72" height="72" style="display:block;border:0;" /></td>
              <td style="padding:0 30px 0 0;"><img src="${img("/assets/melhores-ongs-2023.png")}" alt="Melhores ONGs 2023" width="72" height="72" style="display:block;border:0;" /></td>
              <td style="padding:0;"><img src="${img("/assets/logo_selo.png")}" alt="Selo Social" width="142" style="display:block;border:0;" /></td>
            </tr>
          </tbody>
        </table>
      </td>
    </tr>
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
