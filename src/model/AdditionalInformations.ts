export type AdditionalInformations = {
  agentOfPublicService: boolean;
  agentOfPublicServiceNote: string;
  belongRegulatedMarket: boolean;
  regulatedMarketNote: string;
  establishedByRegulatoryProvision: boolean;
  establishedByRegulatoryProvisionNote: string;
  ipa: boolean;
  ipaCode: string;
  otherNote: string;
};

export type AdditionalData = {
  openTextField: string;
  textFieldValue: string;
  choice: boolean;
};
