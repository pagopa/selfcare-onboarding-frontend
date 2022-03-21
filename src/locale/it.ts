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
    description:
      "Segui le istruzioni per inviare il documento firmato, servirà a completare l'inserimento del tuo Ente nel portale Self Care.",
    confirmAction: 'Continua',
  },
  confirmRegistrationStep1: {
    errorAlertTitle: 'Controlla il Documento',
    errorAlertDescription: "E' possibile caricare un solo file di tipo PDF",
    pageTitle: "Carica l'Accordo di Adesione",
    pageSubtitle1:
      "Per completare l'adesione, carica l'atto ricevuto via PEC, firmato digitalmente ",
    pageSubtitle2: 'dal Legale Rappresentante.',
    fileUploaderTitle: 'Trascina qui l’Accordo di Adesione firmato',
    fileUploaderDescription: `oppure `,
    fileUploaderDescriptionLink: 'selezionalo dal tuo computer',
    confirmAction: 'Invia',
  },
  fileUploadPreview: {
    loadingStatus: 'Invio in corso...',
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
      backAction: 'Torna alla home',
    },
    genericError: {
      title: 'Spiacenti, qualcosa è andato storto.',
      description: `A causa di un errore del sistema non è possibile completare la procedura.
      <1/>
      Ti chiediamo di riprovare più tardi.`,
      backAction: 'Torna alla home',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'Stiamo verificando i tuoi dati',
    onboarding: {
      bodyTitle: 'Seleziona il tuo Ente',
      bodyDescription:
        "Seleziona dall'Indice della Pubblica Amministrazione (IPA) l'Ente per cui vuoi richiedere l'adesione a",
      ipaDescription: "Non trovi il tuo ente nell'IPA? In ",
      ipaMoreInfoDescription: " trovi maggiori informazioni sull'indice e su come accreditarsi.",
      ipaLink: 'questa pagina',
      asyncAutocomplete: {
        placeholder: 'Cerca',
      },
      onboardingStepActions: {
        confirmAction: 'Conferma',
      },
    },
  },
  onboardingStep2: {
    bodyTitle: 'Indica il Legale Rappresentante',
    bodyDescription: `Inserisci i dati del Legale Rappresentante. <1 /> La persona che indicherai sarà firmataria del contratto per <2 />`,
    backLabel: 'Indietro',
    confirmLabel: 'Conferma',
  },
  onboardingStep3: {
    bodyTitle: 'Indica il Referente Amministrativo',
    bodyDescription1: 'Inserisci i dati del Referente Amministrativo o di un suo delegato.',
    bodyDescription2: 'La persona che indicherai sarà responsabile della gestione di',
    addUserLabel: 'Aggiungi un altro Referente Amministrativo',
    addUserLink: 'Aggiungi un altro referente',
    backLabel: 'Indietro',
    confirmLabel: 'Conferma',
    formControl: {
      label: 'Sono io il Referente Amministrativo',
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
        description: "Inserisci l'indirizzo email istituzionale utilizzato per l'Ente",
      },
    },
  },
  completeRegistration: {
    title: 'Spiacenti, qualcosa è andato storto.',
    description: `A causa di un errore del sistema non è possibile completare la procedura. <1 /> Ti chiediamo di riprovare più tardi.`,
    backActionLabel: 'Torna alla home',
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
        alt: "Icona dell'email",
        title: 'Adesione completata',
        description: `Comunicheremo l'avvenuta adesione all'indirizzo PEC dell'Ente. <1/> Da questo momento in poi, i Referenti Amministrativi inseriti in fase di richiesta <2/> potranno accedere al portale.`,
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
          "Il documento caricato non è riconducibile all'Atto di adesione del tuo Ente. Verifica che sia quello corretto e caricalo di nuovo.",
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
    },
  },
  noProductPage: {
    title: 'Spiacenti, qualcosa è andato storto.',
    description: 'Impossibile individuare il prodotto desiderato',
  },
};
