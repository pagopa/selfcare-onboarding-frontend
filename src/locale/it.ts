export default {
  alertDialog: {
    title: 'Titolo',
    description: 'Descrizione',
    confirmLabel: 'Torna alla pagina di caricamento',
    cancelLabel: 'Esci',
  },
  asyncAutocomplete: {
    noResultsLabel: 'No risultati',
    lessThen3CharacterLabel: 'Digita almeno 3 caratteri',
  },
  confirmRegistrationStep0: {
    title: "Carica l'Accordo di Adesione",
    description: `<0>Segui le istruzioni</0> per inviare il documento firmato,<2/> servirà a completare l'adesione al prodotto scelto.`,
    confirmAction: 'Continua',
  },
  confirmRegistrationStep1: {
    errorAlertTitle: 'Controlla il Documento',
    errorAlertDescription: "E' possibile caricare un solo file di tipo PDF",
    pageTitle: "Carica l'Accordo di Adesione",
    pageSubtitle: `Carica l’Accordo di Adesione ricevuto all’indirizzo PEC <1 />primario dell’ente, firmato digitalmente dal Legale <3 />Rappresentante.`,
    fileUploaderTitle: 'Trascina qui l’Accordo di Adesione firmato oppure',
    fileUploaderDescriptionLink: 'selezionalo dal tuo computer',
    confirmAction: 'Continua',
  },
  fileUploadPreview: {
    loadingStatus: 'Caricamento...',
    labelStatus: 'Pronto per l’invio',
  },
  inlineSupportLink: {
    assistanceLink: "contatta l'assistenza",
  },
  onboardingStep0: {
    title: 'Benvenuto sul Portale Self-care',
    description: 'In pochi passaggi il tuo Ente potrà aderire e gestire tutti i prodotti PagoPA.',
    privacyPolicyDescription: 'Ho letto e compreso',
    privacyPolicyLink: 'l’Informativa Privacy e i Termini e Condizioni d’Uso del servizio',
    actionLabel: 'Conferma',
  },
  onboardingStep1_5: {
    loadingText: 'Stiamo verificando i tuoi dati',
    alreadyOnboarded: {
      title: "L'Ente che hai scelto ha già aderito",
      description:
        'Per accedere, chiedi al Referente incaricato di abilitarti nella sezione Referenti del portale.',
      backAction: 'Chiudi',
    },
    genericError: {
      title: 'Spiacenti, qualcosa è andato storto.',
      description: `A causa di un errore del sistema non è possibile completare la procedura.
      <1/>
      Ti chiediamo di riprovare più tardi.`,
      backAction: 'Chiudi',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'Stiamo verificando i tuoi dati',
    onboarding: {
      bodyTitle: 'Seleziona il tuo ente',
      bodyDescription:
        "Seleziona dall'Indice della Pubblica Amministrazione (IPA) l'ente <1/> per cui vuoi richiedere l'adesione a {{productTitle}}",
      ipaDescription: `Non trovi il tuo ente nell'IPA? In <1>questa pagina</1> trovi maggiori <3/> informazioni sull'indice e su come accreditarsi `,
      asyncAutocomplete: {
        placeholder: 'Cerca',
      },
      onboardingStepActions: {
        confirmAction: 'Conferma',
        backAction: 'Indietro',
      },
    },
  },
  onboardingStep2: {
    bodyTitle: 'Indica il Legale <1/> rappresentante',
    bodyDescription: `Conferma, modifica o inserisci i dati del Legale rappresentante. <1/> La persona indicata sarà firmataria del contratto per <3/>`,
    backLabel: 'Indietro',
    confirmLabel: 'Conferma',
  },
  onboardingStep3: {
    bodyTitle: "Indica l'Amministratore",
    bodyDescription1: 'Inserisci i dati del Referente Amministrativo o di un suo delegato.',
    bodyDescription2: 'La persona che indicherai sarà responsabile della gestione di',
    addUserLabel: 'Aggiungi un altro Amministratore',
    addUserLink: 'Aggiungi un altro Amministratore',
    backLabel: 'Indietro',
    confirmLabel: 'Conferma',
    formControl: {
      label: "Sono io l'Amministratore",
    },
  },
  platformUserForm: {
    helperText: 'Campo non valido',
    fields: {
      name: {
        label: 'Nome',
      },
      surname: { label: 'Cognome' },
      taxCode: {
        label: 'Codice Fiscale',
        errors: {
          invalid: 'Il Codice Fiscale inserito non è valido',
          duplicate: 'Il codice fiscale inserito è già presente',
        },
      },
      email: {
        label: 'Email istituzionale',
        errors: {
          invalid: "L'indirizzo email non è valido",
          duplicate: "L'indirizzo email inserito è già presente",
        },
        description: 'Inserisci l’indirizzo email istituzionale dell’Amministratore',
      },
    },
  },
  completeRegistration: {
    title: 'Qualcosa è andato storto.',
    description: `Non siamo riusciti a indirizzarti alla pagina di caricamento<1 />per completare la procedura.`,
    contactAssistanceButton: 'Contatta l’assistenza',
    sessionModal: {
      onConfirmLabel: 'Torna alla pagina di caricamento',
      onCloseLabel: 'Esci',
    },
    steps: {
      step0: {
        label: "Carica l'Atto di Adesione",
      },
      step1: {
        label: "Carica l'Atto di Adesione",
      },
    },
    outcomeContent: {
      success: {
        title: 'Adesione completata!',
        description: `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento, gli Amministratori <3/> inseriti in fase di richiesta possono accedere all'Area <5 />Riservata.`,
        backActionLabel: 'Torna alla home',
      },
      error: {
        alt: 'Error',
        title: 'Richiesta di adesione in errore',
        descriptionWithoutToken: 'Il link usato non è valido!',
        descriptionWithToken: 'Il salvataggio dei dati inseriti non è andato a buon fine.',
      },
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Controlla il documento',
        message:
          "Il documento caricato non corrisponde all'Atto di Adesione. Verifica che sia corretto e caricalo di nuovo.",
      },
      INVALID_SIGN: {
        title: 'Controlla il documento',
        message:
          'La Firma Digitale non è riconducibile al Legale Rappresentante indicato in fase di adesione. Verifica la corrispondenza e carica di nuovo il documento.',
      },
      GENERIC: {
        title: 'Caricamento non riuscito',
        message: 'Il caricamento del documento non è andato a buon fine.',
      },
    },
  },
  noProductPage: {
    title: 'Spiacenti, qualcosa è andato storto.',
    description: 'Impossibile individuare il prodotto desiderato',
  },
  onboarding: {
    outcomeContent: {
      success: {
        title: 'La tua richiesta è stata inviata <1/> con successo',
        description:
          "Riceverai una PEC all’indirizzo istituzionale che hai indicato. <1 /> Al suo interno troverai le istruzioni per completare <3 />l'adesione.",
        backActionLabel: 'Chiudi',
      },
      error: {
        title: 'Spiacenti, qualcosa è andato storto.',
        description:
          'A causa di un errore del sistema non è possibile completare la procedura. <1 /> Ti chiediamo di riprovare più tardi.',
        backActionLabel: 'Chiudi',
      },
    },
    sessionModal: {
      title: 'Vuoi davvero uscire?',
      message: 'Se esci, la richiesta di adesione andrà persa.',
      onConfirmLabel: 'Esci',
      onCloseLabel: 'Annulla',
    },
    loading: {
      loadingText: 'Stiamo verificando i tuoi dati',
    },
  },
  onBoardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Sottoscrizione già avvenuta',
      message: "L'ente che hai selezionato ha già sottoscritto l'offerta <1 />Premium.",
      closeButton: 'Chiudi',
    },
    notBasicProductError: {
      title: "L'ente non ha aderito a {{selectedProduct}}",
      message:
        "Per poter sottoscrivere l'offerta Premium, l'ente che hai <1 />selezionato deve prima aderire al prodotto {{selectedProduct}}",
      adhesionButton: 'Aderisci',
    },
    selectUserPartyStep: {
      title: "Seleziona l'ente",
      subTitle:
        "Seleziona l'ente per il quale stai richiedendo la sottoscrizione <1 />all'offerta Premium",
      helperLink: 'Non lo trovi? <1>Registra un nuovo ente</1>',
      confirmButton: 'Conferma',
    },
    genericError: {
      title: 'Richiesta di adesione premium in errore',
      subTitle:
        'A causa di un errore del sistema non è possibile completare la procedura.<0 /> Ti chiediamo di riprovare più tardi.',
      homeButton: 'Torna alla home',
    },
    successfulAdhesion: {
      title: 'La tua richiesta è stata inviata <1 /> con successo',
      message:
        "Riceverai una PEC all’indirizzo istituzionale dell’ente.<1 />Al suo interno troverai le istruzioni per completare la <3 /> sottoscrizione all'offerta Premium.",
      closeButton: 'Chiudi',
    },
    billingData: {
      subTitle:
        'Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti. Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione',
    },
    exitModal: {
      title: 'Vuoi davvero uscire?',
      message: 'Se esci, la richiesta di adesione andrà persa.',
      backButton: 'Esci',
      cancelButton: 'Annulla',
    },
    loading: {
      loadingText: 'Stiamo verificando i tuoi dati',
    },
  },
  stepInstitutionType: {
    title: 'Seleziona il tipo di ente che <1/> rappresenti',
    institutionTypeValues: {
      pa: 'Pubblica Amministrazione',
      gsp: 'Gestore di servizi pubblici',
      scp: 'Società a controllo pubblico',
      pt: 'Partner tecnologico',
    },
    cadArticle2: 'art. 2, comma 2, lett. a del CAD',
    cadArticle6:
      'par. 6 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” ( art. 64bis del CAD)',
    backLabel: 'Indietro',
    confirmLabel: 'Conferma',
  },
  stepBillingData: {
    title: 'Indica i dati del tuo ente',
    invalidFiscalCode: 'Codice fiscale non valido',
    invalidZipCode: 'CAP non valido',
    invalidVatNumber: 'Partita IVA non valida',
    invalidEmail: 'L’indirizzo email non è valido',
    businessName: 'Ragione sociale',
    registeredOffice: 'Sede legale',
    zipCode: 'CAP',
    digitalAddress: 'Indirizzo PEC',
    taxCodeNotEquals2PIVAdescription: 'La Partita IVA non coincide con il Codice fiscale',
    taxCode: 'Codice fiscale',
    taxCodeAndVatNumber: 'Codice fiscale / Partita IVA',
    vatNumber: 'Partita IVA',
    recipientCode: 'Codice destinatario',
    recipientCodeDescription: 'È il codice necessario per ricevere le fatture elettroniche',
    gspDescription: 'Sono gestore di almeno uno dei pubblici servizi: Gas, Energia, Telco.',
    backLabel: 'Indietro',
    confirmLabel: 'Conferma',
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'La tua richiesta di adesione è <1 />stata annullata',
        description:
          'Nella home dell’Area Riservata puoi vedere i prodotti<1 />disponibili e richiedere l’adesione per il tuo ente.',
        backActionLabel: 'Torna alla home',
      },
      error: {
        title: 'Qualcosa è andato storto.',
        description:
          'A causa di un errore del sistema non è possibile completare la procedura. <1 /> Ti chiediamo di riprovare più tardi.',
        backActionLabel: 'Torna alla home',
      },
      loading: {
        loadingText: 'Stiamo verificando i tuoi dati',
      },
      notOutcome: {
        loadingText: 'Stiamo cancellando la tua iscrizione',
      },
    },
  },
  app: {
    sessionModal: {
      title: 'Sessione scaduta',
      message: 'Stai per essere rediretto alla pagina di login...',
    },
  },
};
