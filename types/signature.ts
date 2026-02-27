export interface SignatureData {
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
  name: "",
  role: "",
  department: "",
  phone: "",
  email: "",
  facebookUrl: "",
  instagramUrl: "",
  linkedinUrl: "",
};
