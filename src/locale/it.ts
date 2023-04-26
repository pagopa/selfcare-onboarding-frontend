export default {
  alertDialog: {
    title: 'Titolo',
    description: 'Descrizione',
    confirmLabel: 'Carica di nuovo',
    cancelLabel: 'Esci',
  },
  asyncAutocomplete: {
    noResultsLabel: 'Nessun risultato',
    lessThen3CharacterLabel: 'Digita almeno 3 caratteri',
    lessThen11CharacterLabel: 'Digita almeno 11 caratteri',
    serachLabel: 'Cerca ente',
    ariaLabel: `Seleziona la tipologia di ricerca dell'ente`,
    businessName: 'Ragione Sociale',
    taxcode: 'Codice Fiscale ente',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Cerca per',
    businessName: 'Ragione Sociale',
    taxCode: 'Codice Fiscale dell’ente',
    ipaCode: 'Codice IPA',
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
      bodyTitle: 'Cerca il tuo ente',
      codyTitleSelected: 'Conferma l’ente selezionato',
      bodyDescription:
        'Inserisci uno dei dati richiesti e cerca dall’Indice della Pubblica <1/> Amministrazione (IPA) l’ente per cui vuoi richiedere l’adesione a <3/>{{productTitle}}',
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
    bodyDescription: `Inserisci i dati del Legale Rappresentante o del procuratore del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/>.`,
    premiumBodyDescription: `Inserisci i dati del Legale Rappresentante o del procuratore del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> Premium.`,
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
  },
  onboardingStep3: {
    bodyTitle: "Indica l'Amministratore",
    bodyDescription1: `Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di {{productTitle}} e presenti nel contratto di adesione come delegati dal Legale Rappresentante.`,
    addUserLabel: 'AGGIUNGI UN ALTRO AMMINISTRATORE',
    addUserLink: 'Aggiungi un altro Amministratore',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
    formControl: {
      label: "Sono io l'Amministratore",
    },
  },
  platformUserForm: {
    helperText: 'Il Campo non è valido',
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
        title: 'Richiesta di adesione inviata',
        notPaDescription:
          "Invieremo un'email all'indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l'adesione.",
        paDescription:
          "Invieremo un'email all'indirizzo PEC primario dell'ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l'adesione.",
        backHome: 'Torna alla home',
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
    phaseOutError: {
      title: 'Qualcosa è andato storto',
      description:
        'Non puoi aderire al prodotto scelto poiché a breve non sarà <1 /> più disponibile.',
      backAction: 'Torna alla home',
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
    subProductStepSelectPricingPlan: {
      discountLabelData: '25% di sconto Fino al 30 giugno 2023 ',
      title: 'Passa a IO Premium e migliora le <1/> performance dei messaggi',
      firstCheckLabel: 'Riduci i tempi di incasso',
      secondCheckLabel: 'Migliori le performance di riscossione',
      thirdCheckLabel: 'Riduci i crediti insoluti',
      infoSectionLabel: `Se il tuo ente ha già aderito ad app IO, scegli qual è il piano che più soddisfa le sue esigenze. <1/> Il piano a carnet è attivabile una sola volta. Una volta terminato il numero di messaggi del piano a  <3/> carnet, si attiverà automaticamente il piano a consumo. `,
      btnRejectLabel: 'Non mi interessa',
      carnetPlan: {
        caption: 'PIANO A CARNET - UNA TANTUM',
        discountBoxLabel: '25% di sconto',
        title: 'Scegli tra i 7 carnet differenti pensati per ogni tua esigenza',
        infoLabel: `<0>Da</0><1>0,</1><2>15€</2><3>a</3><4>0,</4><5>165€</5><6>/mess</6>`,
        showMore: 'Scopri di più',
        showLess: 'Mostra meno',
        description:
          'Una volta selezionato il carnet non potrà essere modificato per via della sottoscrizione del contratto.',
        carnetLabelsWithScount: {
          c1: '1.000 <1> mess</1> <2/> <3>0,165 €/mess</3>',
          c2: '10.000 <1> mess</1> <2/> <3>0,163 €/mess</3>',
          c3: '50.000 <1> mess</1> <2/> <3>0,161 €/mess</3>',
          c4: '100.000 <1> mess</1> <2/> <3>0,159 €/mess</3>',
          c5: '250.000 <1> mess</1> <2/> <3>0,157 €/mess</3>',
          c6: '500.000 <1> mess</1> <2/> <3>0,153 €/mess</3>',
          c7: '1.000.000 <1> mess</1> <2/> <3>0,150 €/mess</3>',
        },
        carnetLabelsWithoutScount: {
          c1: '1.000 <1> mess</1> <2/> <3>0,22 €/mess</3>',
          c2: '10.000 <1> mess</1> <2/> <3>0,217 €/mess</3>',
          c3: '50.000 <1> mess</1> <2/> <3>0,215 €/mess</3>',
          c4: '100.000 <1> mess</1> <2/> <3>0,212 €/mess</3>',
          c5: '250.000 <1> mess</1> <2/> <3>0,21 €/mess</3>',
          c6: '500.000 <1> mess</1> <2/> <3>0,205 €/mess</3>',
          c7: '1.000.000 <1> mess</1> <2/> <3>0,20 €/mess</3>',
        },
        carnetValuesDiscounted: {
          c1: '<0>165,</0> <1> 00 € </1>',
          c2: '<0>1.631,</0> <1> 25 € </1>',
          c3: '<0>8.062,</0> <1> 50 € </1>',
          c4: '<0>15.937,</0> <1> 50 € </1>',
          c5: '<0>39.375,</0> <1> 00 € </1>',
          c6: '<0>76.875,</0> <1> 00 € </1>',
          c7: '<0>150.000,</0> <1> 00 € </1>',
        },
        carnetValues: {
          c1: '<0>220,</0> <1> 00 € </1>',
          c2: '<0>2.175,</0> <1> 25 € </1>',
          c3: '<0>10.750,</0> <1> 50 € </1>',
          c4: '<0>21.250,</0> <1> 50 € </1>',
          c5: '<0>52.500,</0> <1> 00 € </1>',
          c6: '<0>102.500,</0> <1> 00 € </1>',
          c7: '<0>200.000,</0> <1> 00 € </1>',
        },
        carnetValuesDiscount: {
          c1: '220 €',
          c2: '2.175 €',
          c3: '10.750 €',
          c4: '21.250 €',
          c5: '52.500 €',
          c6: '102.500 €',
          c7: '200.000 €',
        },
        carnetLabelsDiscount: {
          c1: 'Risparmia 55 €',
          c2: 'Risparmia 543,75 €',
          c3: 'Risparmia 2.687,50 €',
          c4: 'Risparmia 5.312,50 €',
          c5: 'Risparmia 13.125 €',
          c6: 'Risparmia 25.625 €',
          c7: 'Risparmia 50.000 €',
        },
        btnActionLabel: 'Attiva il piano',
      },
      consumptionPlan: {
        caption: 'PIANO A CONSUMO',
        discountBoxLabel: '25% di sconto',
        title: 'Scegli di pagare solo i messaggi <1/> effettivi che invii',
        infoLabel: `<0>Da</0><1>0,</1><2>15€</2><3>a</3><4>0,</4><5>187€</5><6>/mess</6>`,
        showMore: 'Scopri di più',
        showLess: 'Mostra meno',
        description:
          'Attivando il piano a consumo, non sarà più possibile attivare il piano carnet.',
        rangeLabelsWithScount: {
          r1: '<0>Da 1 a <1/>100.000 <3>mess</3></0> ',
          r2: '<0>Da 100.001 a <1/>500.000 <3>mess</3></0> ',
          r3: '<0>Da 500.001 a <1/>1.000.000 <3>mess</3></0> ',
          r4: '<0>Oltre <1/>1.000.000 <3>mess</3></0> ',
        },
        rangeValuesDiscounted: {
          r1: '<0>0,</0> <1> 187 € / mess </1>',
          r2: '<0>0,</0> <1> 18 € / mess </1>',
          r3: '<0>0,</0> <1> 165 € / mess </1>',
          r4: '<0>0,</0> <1> 15 € / mess </1>',
        },
        rangeValues: {
          r1: '<0>0,</0> <1> 25 €  / mess</1>',
          r2: '<0>0,</0> <1> 24 €  / mess</1>',
          r3: '<0>0,</0> <1> 22 €  / mess</1>',
          r4: '<0>0,</0> <1> 20 €  / mess</1>',
        },
        rangeValuesDiscount: {
          r1: '0,25 € / mess',
          r2: '0,24 € / mess',
          r3: '0,22 € / mess',
          r4: '0,20 € / mess',
        },
        rangeLabelsDiscount: '25% di sconto',
        btnActionLabel: 'Attiva il piano',
      },
    },
    selectUserPartyStep: {
      title: 'Seleziona il tuo ente',
      subTitle:
        "Seleziona l'ente per il quale stai richiedendo la sottoscrizione <1 />all'offerta Premium",
      searchLabel: 'Cerca ente',
      notFoundResults: 'Nessun risultato',
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
  invalidPricingPlan: {
    title: 'Qualcosa è andato storto',
    description:
      'Non riusciamo a trovare la pagina che stai cercando. <1 />Assicurati che l’indirizzo sia corretto o torna alla home.',
    backButton: 'Torna alla home',
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
  onboardingFormData: {
    title: 'Indica i dati del tuo ente',
    pspAndProdPagoPATitle: 'Indica i dati',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
    billingDataSection: {
      invalidFiscalCode: 'Il Codice Fiscale non è valido',
      invalidZipCode: 'Il CAP non è valido',
      invalidVatNumber: 'La Partita IVA non è valida',
      invalidEmail: 'L’indirizzo email non è valido',
      invalidReaField: 'Il Campo REA non è valido',
      invalidMailSupport: 'L’indirizzo email non è valido',
      invalidShareCapitalField: 'Il campo capitale sociale non è valido',
      businessName: 'Ragione sociale',
      registeredOffice: 'Sede legale',
      zipCode: 'CAP',
      digitalAddress: 'Indirizzo PEC',
      taxCodeEquals2PIVAdescription: 'La Partita IVA coincide con il Codice Fiscale',
      vatNumberGroup: 'La Partita IVA è di gruppo',
      taxCode: 'Codice Fiscale',
      vatNumber: 'Partita IVA',
      recipientCode: 'Codice destinatario',
      recipientCodeForPa: 'Codice univoco',
      recipientCodeDescription: 'È il codice necessario per ricevere le fatture elettroniche',
      gspDescription: 'Sono gestore di almeno uno dei pubblici servizi: Gas, Energia, Telco.',
      pspDataSection: {
        commercialRegisterNumber: 'n. Iscrizione al Registro delle Imprese',
        invalidCommercialRegisterNumber: 'Il n. Iscrizione al Registro delle Imprese non è valido',
        registrationInRegister: 'Iscrizione all’Albo',
        registerNumber: 'Numero dell’Albo',
        invalidregisterNumber: 'Il Numero dell’Albo non è valido',
        abiCode: 'Codice ABI',
        invalidabiCode: 'Il Codice ABI non è valido',
      },
      informationCompanies: {
        commercialRegisterNumber: 'Luogo di iscrizione al Registro delle Imprese (facoltativo)',
        rea: 'REA',
        shareCapital: 'Capitale sociale (facoltativo)',
      },
      assistanceContact: {
        supportEmail: 'Indirizzo email visibile ai cittadini',
        supportEmailDescriprion:
          'È il contatto che i cittadini visualizzano per richiedere assistenza all’ente',
      },
    },
    taxonomySection: {
      title: 'INDICA L’AREA GEOGRAFICA',
      nationalLabel: 'Nazionale',
      localLabel: 'Locale',
      infoLabel:
        'Seleziona il territorio in cui opera il tuo ente. Se locale, puoi scegliere una o più aree di competenza. Se l’ente ha già aderito ad altri prodotti PagoPA, troverai l’area già impostata.',
      localSection: {
        addButtonLabel: 'Aggiungi area',
        inputLabel: 'Comune, Provincia o Regione',
      },
      error: {
        notMatchedArea: 'Scegli una località presente nell’elenco',
      },
      modal: {
        addModal: {
          title: 'Stai aggiungendo altre aree per il tuo ente',
          description: `Le aree geografiche verrano aggiunte a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?`,
          confirmButton: 'Continua',
          backButton: 'Indietro',
        },
        modifyModal: {
          title: 'Stai modificando l’area geografica del tuo ente',
          description:
            'La modifica verrà applicata a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?',
          confirmButton: 'Continua',
          backButton: 'Indietro',
        },
      },
    },
    dpoDataSection: {
      dpoTitle: 'CONTATTI DEL RESPONSABILE DELLA PROTEZIONE DEI DATI',
      dpoAddress: 'Indirizzo',
      dpoPecAddress: 'Indirizzo PEC',
      dopEmailAddress: 'Indirizzo email',
    },
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
