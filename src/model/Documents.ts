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
    servizioPubblico: Array<UploadedDocument>
];