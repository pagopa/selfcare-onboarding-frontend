export type DocumentGroup = 'naturaGiuridica' | 'visura' | 'servizioPubblico';
export type UploadedDocument = {
  id: string;
  group: DocumentGroup;
  name: string;
  title: string;
  file?: File;
};

export type ContractSummaryDocument = [
  naturaGiuridica: UploadedDocument | undefined,
  visura: UploadedDocument | undefined,
  servizioPubblico: Array<UploadedDocument>,
];

export type DocumentType = 'REQUIRED' | 'GENERIC';

export type RequiredDocument = {
  id: string;
  name: string;
  labelKey: string;
  required: boolean;
  mimeType: string;
  maxDocumentsRequired?: number;
  filter?: {
    institutionType?: Array<string>;
    origin?: Array<string>;
  };
  storageOrigin: 'USER' | 'SYSTEM';
};
