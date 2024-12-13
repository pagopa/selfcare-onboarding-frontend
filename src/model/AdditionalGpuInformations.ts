export type AdditionalGpuInformations = {
    businessRegisterNumber?: string;
    legalRegisterNumber?: string;
    legalRegisterName?: string;
    longTermPayments?: boolean;
    manager: boolean;
    managerAuthorized: boolean;
    managerEligible: boolean;
    managerProsecution: boolean;
    institutionCourtMeasures: boolean;
};

export type AdditionalGpuInformationsRadio = {
    isPartyRegistered: boolean | null;
    isPartyProvidingAService: boolean | null;
    longTermPayments: boolean | null;
};