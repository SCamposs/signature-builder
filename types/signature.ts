export interface SignatureData {
  name: string;
  role: string;
  department: string;
  phone: string;
  email: string;
}

export const emptySignature: SignatureData = {
  name: "",
  role: "",
  department: "",
  phone: "",
  email: "",
};
