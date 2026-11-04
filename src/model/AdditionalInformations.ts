// Fields are missing when the user never answered the related question.
export type AdditionalInformations = {
  agentOfPublicService?: boolean;
  agentOfPublicServiceNote?: string;
  belongRegulatedMarket?: boolean;
  regulatedMarketNote?: string;
  establishedByRegulatoryProvision?: boolean;
  establishedByRegulatoryProvisionNote?: string;
  ipa?: boolean;
  ipaCode?: string;
  otherNote: string;
};

export type AdditionalData = {
  openTextField: boolean;
  textFieldValue: string;
  choice?: boolean;
};
