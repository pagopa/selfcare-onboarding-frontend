export default {
  alertDialog: {
    title: 'Titolo',
    description: 'Descrizione',
    confirmLabel: 'Carica di nuovo',
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
    errorAlertTitle: 'Caricamento non riuscito',
    errorAlertDescription:
      'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
    errorAlertRetryLabel: 'Carica di nuovo',
    errorAlertCloseLabel: 'Esci',
    pageTitle: "Carica l'Accordo di Adesione",
    pageSubtitle: `Carica l’Accordo di Adesione ricevuto all’indirizzo PEC <1 />primario dell’ente, firmato digitalmente in p7m dal Legale <3 />Rappresentante.`,
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
    actionLabel: 'Continua',
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
    userNotAllowedError: {
      title: 'Non puoi aderire a questo prodotto',
      description:
        'Al momento, l’ente <1>{{partyName}}</1> non ha il permesso di aderire a <3>{{productName}}</3>',
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
        confirmAction: 'Continua',
        backAction: 'Indietro',
      },
    },
  },
  onboardingStep2: {
    bodyTitle: 'Indica il Legale <1/> Rappresentante',
    bodyDescription: `Inserisci i dati del Legale Rappresentante. <1/> La persona che indicherai sarà firmataria del contratto per <3/><4/>`,
    premiumBodyDescription: `Inserisci i dati del Legale Rappresentante. <1/> La persona che indicherai sarà firmataria del contratto per <3/><4/> Premium`,
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
  },
  onboardingStep3: {
    bodyTitle: "Indica l'Amministratore",
    bodyDescription1: 'Inserisci i dati del Referente Amministrativo o di un suo delegato.',
    bodyDescription2:
      'La persona che indicherai sarà responsabile della gestione di {{productTitle}}',
    addUserLabel: 'Aggiungi un altro Amministratore',
    addUserLink: 'Aggiungi un altro Amministratore',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
    formControl: {
      label: "Sono io l'Amministratore",
    },
  },
  platformUserForm: {
    helperText: 'Campo non valido',
    fields: {
      name: {
        label: 'Nome',
        errors: {
          conflict: 'Nome non corretto o diverso dal Codice Fiscale',
        },
      },
      surname: {
        label: 'Cognome',
        errors: {
          conflict: 'Cognome non corretto o diverso dal Codice Fiscale',
        },
      },
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
        description: 'Inserisci l’indirizzo email istituzionale utilizzato per l’ente',
      },
    },
  },
  completeRegistration: {
    title: 'Qualcosa è andato storto.',
    description: `Non siamo riusciti a indirizzarti alla pagina di caricamento<1 />per completare la procedura.`,
    contactAssistanceButton: 'Contatta l’assistenza',
    sessionModal: {
      onConfirmLabel: 'Carica di nuovo',
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
        message:
          'Il caricamento del documento non è andato a buon fine. Torna indietro e caricalo di nuovo.',
      },
      INVALID_SIGN_FORMAT: {
        title: 'Caricamento non riuscito',
        message:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
      },
    },
    jwtNotValid: {
      title: 'Richiesta di adesione non più <1 /> valida',
      subtitle: 'Questa richiesta è stata accolta, annullata o è scaduta.',
      backHome: 'Torna alla home',
    },
  },
  noProductPage: {
    title: 'Spiacenti, qualcosa è andato storto.',
    description: 'Impossibile individuare il prodotto desiderato',
  },
  onboarding: {
    outcomeContent: {
      success: {
        title: 'La richiesta di adesione è stata <1/>inviata con successo',
        baseDescription:
          "Riceverai una PEC all’indirizzo istituzionale che hai indicato. <1 /> Al suo interno troverai le istruzioni per completare <3 />l'adesione.",
        pspDescription:
          "Procederemo al controllo dei dati inseriti e invieremo una <1 />mail di cortesia e una PEC con l'esito di tale verifica.",
        backActionLabel: 'Chiudi',
      },
      error: {
        title: 'Spiacenti, qualcosa è andato storto.',
        description:
          'A causa di un errore del sistema non è possibile completare la procedura. <1 /> Ti chiediamo di riprovare più tardi.',
        backActionLabel: 'Chiudi',
      },
    },
    userNotAllowedError: {
      title: 'Non puoi aderire a questo prodotto',
      description:
        'Al momento, l’ente <1>{{partyName}}</1> non ha il permesso di aderire a <3>{{productName}}</3>',
      backAction: 'Chiudi',
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
      title: 'Seleziona il tuo ente',
      subTitle:
        "Seleziona l'ente per il quale stai richiedendo la sottoscrizione <1 />all'offerta Premium",
      IPAsubTitle:
        "Seleziona dall'Indice della Pubblica Amministrazione (IPA) l'ente <1/> per cui vuoi richiedere l'adesione a {{baseProduct}} Premium",
      helperLink: 'Non lo trovi? <1>Registra un nuovo ente</1>',
      confirmButton: 'Continua',
    },
    genericError: {
      title: 'Qualcosa è andato storto',
      subTitle:
        'A causa di un errore del sistema non è possibile completare<0 /> la procedura. Ti chiediamo di riprovare più tardi.',
      homeButton: 'Torna alla home',
    },
    successfulAdhesion: {
      title: 'La richiesta di adesione è stata <1/>inviata con successo',
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
      psp: 'Prestatori Servizi di Pagamento',
    },
    cadArticle2A: 'art. 2, comma 2, lettera A del CAD',
    cadArticle2B: 'art. 2, comma 2, lettera B del CAD',
    cadArticle2C: 'art. 2, comma 2, lettera C del CAD',
    cadArticle165: 'articolo 1, comma 2, del decreto legislativo 30 marzo 2001, n. 165',
    cadArticle6AppIo:
      'Ai sensi di IO - Paragrafo 6.1.3 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” emanate da AgID ai sensi dell’art- 64-bis del CAD',
    cadArticle6:
      'par. 6 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” ( art. 64bis del CAD)',
    cadPsp: '',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
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
    taxCodeEquals2PIVAdescription: 'La Partita IVA coincide con il Codice Fiscale',
    taxCode: 'Codice Fiscale',
    vatNumber: 'Partita IVA',
    recipientCode: 'Codice destinatario',
    recipientCodeDescription: 'È il codice necessario per ricevere le fatture elettroniche',
    gspDescription: 'Sono gestore di almeno uno dei pubblici servizi: Gas, Energia, Telco.',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Richiesta di adesione eliminata',
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
      jwtNotValid: {
        title: 'Richiesta di adesione non più <1 /> valida',
        subtitle: 'Questa richiesta è stata accolta, annullata o è scaduta.',
        backActionLabel: 'Torna alla home',
      },
    },
    confirmCancellatione: {
      title: 'Vuoi eliminare la richiesta di <1 /> adesione?',
      subtitle: 'Se la elimini, tutti i dati inseriti verranno persi. ',
      confirmActionLabel: 'Elimina la richiesta',
      backActionLabel: 'Torna alla home',
    },
  },
  app: {
    sessionModal: {
      title: 'Sessione scaduta',
      message: 'Stai per essere rediretto alla pagina di login...',
    },
  },
};
