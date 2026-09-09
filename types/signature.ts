export type SignatureTemplate = "standard" | "compact" | "latest";

export interface SignatureData {
  template: SignatureTemplate;
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
  facebookUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
}

export const emptySignature: SignatureData = {
  template: "standard",
  name: "",
  role: "",
  department: "",
  phone: "",
  email: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};
