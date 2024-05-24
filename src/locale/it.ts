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
    searchLabel: 'Cerca ente',
    aooLabel: 'Inserisci il codice univoco AOO',
    uoLabel: 'Inserisci il codice univoco UO',
    ariaLabel: `Seleziona la tipologia di ricerca dell'ente`,
    businessName: 'Ragione Sociale',
    taxcode: 'Codice Fiscale ente',
    ivassCode: 'Codice IVASS',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Cerca per',
    businessName: 'Ragione Sociale',
    ivassCode: 'Codice IVASS',
    taxCode: 'Codice Fiscale ente',
    aooCode: 'Codice univoco AOO',
    uoCode: 'Codice univoco UO',
  },
  confirmRegistrationStep0: {
    download: {
      title: 'Scarica l’accordo di adesione',
      description: `Per completare l’adesione, scarica l’accordo e fai apporre la firma digitale in <1 /><2>formato p7m</2> dal Legale Rappresentante dell’ente o da un suo procuratore.`,
      downloadContract: 'Scarica l’accordo',
      disclaimer:
        'Firmando l’accordo, il Legale Rappresentante dell’ente, o un suo procuratore, accetta espressamente e specificamente anche le singole clausole indicate nel paragrafo “Clausole ai sensi degli artt. 1341 e 1342 c.c.”',
    },
    upload: {
      title: 'Carica l’accordo firmato',
      description: `Una volta firmato l’accordo, segui le istruzioni per inviarlo e completare <1 />
    l’adesione al prodotto scelto. Ricorda di caricare l’accordo
    <3>entro 30 giorni.</3>`,
      goToUpload: 'Vai al caricamento',
    },
  },
  confirmRegistrationStep1: {
    errorAlertTitle: 'Caricamento non riuscito',
    errorAlertDescription:
      'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
    errorAlertRetryLabel: 'Carica di nuovo',
    errorAlertCloseLabel: 'Esci',
    pageTitle: "Carica l'accordo di adesione",
    pageSubtitle: `Carica l’accordo di adesione firmato digitalmente <1 /> in p7m dal Legale Rappresentante.`,
    fileUploaderTitle: 'Trascina qui l’accordo di Adesione firmato oppure',
    fileUploaderDescriptionLink: 'carica il file',
    confirmAction: 'Continua',
  },
  fileUploadPreview: {
    loadingStatus: 'Caricamento...',
    labelStatus: 'Pronto per l’invio',
  },
  inlineSupportLink: {
    assistanceLink: "contatta l'assistenza",
  },
  moreInformationOnRoles: 'Più informazioni sui ruoli',
  onboardingStep0: {
    title: 'Benvenuto sul Portale Self-care',
    description: 'In pochi passaggi il tuo Ente potrà aderire e gestire tutti i prodotti PagoPA.',
    privacyPolicyDescription: 'Ho letto e compreso',
    privacyPolicyLink: 'l’Informativa Privacy e i Termini e Condizioni d’Uso del servizio',
    actionLabel: 'Continua',
  },
  onboardingStep1_5: {
    loadingText: 'Stiamo verificando i tuoi dati',
    ptAlreadyOnboarded: {
      title: 'Il Partner è già registrato',
      description:
        'Per operare su un prodotto, chiedi a un Amministratore di <1/> aggiungerti nella sezione Utenti.',
      backAction: 'Chiudi',
    },
    alreadyOnboarded: {
      title: "L’ente selezionato ha già aderito",
      description:
        'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.',
      backHome: 'Torna alla home',
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
      description: `Al momento, l'ente <1>{{partyName}}</1> non può aderire a <3>{{productTitle}}</3>. <5 /> Per maggiori dettagli contatta <7>l'assistenza</7>.`,
      noSelectedParty: 'indicato',
      backToHome: 'Torna alla home',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'Stiamo verificando i tuoi dati',
    onboarding: {
      bodyTitle: 'Cerca il tuo ente',
      codyTitleSelected: 'Conferma l’ente selezionato',
      disclaimer: {
        description: `Al momento possono aderire a SEND tramite Area Riservata solo le <1>Pubbliche <3 /> Amministrazioni Locali </1> presenti su IPA che trovi a <5>questo link</5>.`,
      },
      bodyDescription:
        'Inserisci uno dei dati richiesti e cerca dall’Indice della Pubblica <1/> Amministrazione (IPA) l’ente per cui vuoi richiedere l’adesione a <3/><4>{{productTitle}}</4>.',
      ipaDescription: `Non trovi il tuo ente nell'IPA? In <1>questa pagina</1> trovi maggiori <3/> informazioni sull'indice e su come accreditarsi `,
      selectedInstitution:
        'Prosegui con l’adesione a <1>{{productName}}</1> per l’ente selezionato',
      gpsDescription: `Non trovi il tuo ente nell'IPA?<1 /><2>Inserisci manualmente i dati del tuo ente.</2>`,
      saSubTitle:
        'Se sei tra i gestori privati di piattaforma e-procurement e hai <1/> già ottenuto la <3>certificazione da AgID</3>, inserisci uno dei dati <5/> richiesti e cerca l’ente per cui vuoi richiedere l’adesione a <7/> <8>Interoperabilità.</8>',
      asSubTitle:
        'Se sei una società di assicurazione presente nell’Albo delle <1/>imprese IVASS, inserisci uno dei dati richiesti e cerca l’ente per<3/> cui vuoi richiedere l’adesione a <5>Interoperabilità.</5>',
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
    bodyTitle: 'Indica il Legale Rappresentante',
    bodyDescription: `Inserisci i dati del Legale Rappresentante o del procuratore del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3> <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`,
    premiumBodyDescription: `Inserisci i dati del Legale Rappresentante o del procuratore del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.`,
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
  },
  onboardingStep3: {
    bodyTitle: "Indica l'Amministratore",
    bodyDescription1: `Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di <3>{{productTitle}}</3> e presenti nel contratto di <4 />adesione come delegati dal Legale Rappresentante.`,
    bodyDescriptionPt:
      'Puoi aggiungere da uno a tre Amministratori o suoi delegati.<1/> Si occuperanno della gestione degli utenti e dei prodotti per conto degli enti.',
    addUserLabel: 'AGGIUNGI UN ALTRO AMMINISTRATORE',
    addUserLink: 'Aggiungi un altro Amministratore',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
    formControl: {
      label: 'Aggiungi me come Amministratore',
    },
  },
  additionalDataPage: {
    title: 'Inserisci ulteriori dettagli',
    subTitle:
      'Scegli l’opzione che descrive il tuo ente. Se nessuna è appropriata, seleziona “Altro” e <1 /> inserisci maggiori dettagli.',
    formQuestions: {
      textFields: {
        labels: {
          note: 'Note',
          ipa: 'Inserisci il codice IPA di riferimento',
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'Non hai inserito nessuna nota',
          fromBelongsRegulatedMarket: 'Non hai inserito nessuna nota',
          isFromIPA: 'Inserisci il codice IPA di riferimento',
          isConcessionaireOfPublicService: 'Non hai inserito nessuna nota',
          optionalPartyInformations: 'Campo obbligatorio',
        },
      },
      estabilishedRegulatoryProvision:
        'L’ente è una società costituita ex lege da un provvedimento normativo',
      belongsRegulatedMarket:
        'L’ente appartiene ad un mercato regolamentato (es. energia, gas, acqua, <1 />trasporti, servizi postali ecc…)',
      registratedOnIPA: 'L’ente è censito su IPA',
      concessionaireOfPublicService: 'L’ente è una concessionaria di un pubblico servizio',
      other: 'Altro',
      optionalPartyInformations: 'Scrivi qui le informazioni sul tuo ente',
    },
    options: {
      yes: 'Sì',
      no: 'No',
    },
    addNote: 'Aggiungi una nota',
    allowedCharacters: 'Massimo 300 caratteri',
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
    request: {
      notFound: {
        title: 'La pagina che cercavi non è disponibile',
        description:
          'Al momento non è possibile procedere. Riprova tra qualche <1 />minuto, o contatta l’assistenza',
        contactAssistanceButton: 'Contatta l’assistenza',
      },
      expired: {
        title: 'La richiesta di adesione è scaduta',
        description: `Sono trascorsi oltre 30 giorni dalla richiesta di adesione. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        backHome: 'Torna alla home',
      },
      alreadyCompleted: {
        title: 'La richiesta di adesione è stata accettata',
        description: `Per gestire il prodotto, accedi tramite SPID o CIE`,
        logIn: 'Accedi',
      },
      alreadyRejected: {
        title: 'La richiesta di adesione è stata annullata',
        description: `La richiesta di adesione non è andata a buon fine. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        backHome: 'Torna alla home',
      },
    },
    outcomeContent: {
      success: {
        title: 'Adesione completata!',
        description: `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento, gli Amministratori <3/> inseriti in fase di richiesta possono accedere all'Area <5 />Riservata.`,
        backHome: 'Torna alla home',
      },
      error: {
        title: 'Caricamento non riuscito',
        description: 'Il caricamento del documento non è andato a buon fine.',
        backToUpload: 'Carica di nuovo',
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
      ALREADY_ONBOARDED: {
        title: `L’ente selezionato ha già aderito`,
        message:
          'Per operare sul prodotto, chiedi a un Amministratore di <1 />aggiungerti nella sezione Utenti.',
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
  },
  noProductPage: {
    title: 'Spiacenti, qualcosa è andato storto.',
    description: 'Impossibile individuare il prodotto desiderato',
  },
  onboarding: {
    outcomeContent: {
      ptSuccess: {
        title: 'Richiesta di registrazione inviata',
        description:
          'Invieremo un’email con l’esito della richiesta all’indirizzo  <1 /> PEC indicato.',
      },
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
    sessionModal: {
      title: 'Vuoi davvero uscire?',
      message: 'Se esci, la richiesta di adesione andrà persa.',
      onConfirmLabel: 'Esci',
      onCloseLabel: 'Annulla',
    },
    confirmationModal: {
      title: 'Confermi la richiesta di invio?',
      description:
        'Stai inviando una richiesta di adesione al prodotto <1>{{productName}}</1> per l’ente <3>{{institutionName}}</3>. <5 /> L’accordo di adesione arriverà alla PEC istituzionale dell’ente e dovrà essere sottoscritta dal Legale Rappresentante. Assicurati di essere autorizzato come dipendente a effettuare questa richiesta.',
      confirmLabel: 'Conferma',
      cancelLabel: 'Annulla',
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
      message:
        "L'ente che hai selezionato ha già sottoscritto l'offerta <1 /><strong>Premium</strong>.",
      closeButton: 'Chiudi',
    },
    notBasicProductError: {
      title: "L'ente non ha aderito a {{selectedProduct}}",
      message:
        "Per poter sottoscrivere l'offerta <strong>Premium</strong>, l'ente che hai <3 />selezionato deve prima aderire al prodotto <strong>{{selectedProduct}}</strong>.",
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
      pricingPlanExitModal: {
        title: 'Vuoi rinunciare alle offerte Premium?',
        subtitle: 'Se esci, proseguirai con l’accesso all’Area Riservata.',
        closeBtnLabel: 'Esci',
        confirmBtnLabel: 'Torna alle offerte Premium',
      },
      headerPlanCard: {
        from: 'Da',
        to: 'a',
        beyond: 'Oltre',
        mess: '/ mess',
      },
      carnetPlan: {
        caption: 'PIANO A CARNET - UNA TANTUM',
        discountBoxLabel: '25% di sconto',
        title: 'Scegli tra i {{carnetCount}} carnet differenti pensati per ogni tua esigenza',
        showMore: 'Scopri di più',
        showLess: 'Mostra meno',
        description:
          'Una volta selezionato il carnet non potrà essere modificato per via della sottoscrizione del contratto.',
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
        showMore: 'Scopri di più',
        showLess: 'Mostra meno',
        description:
          'Attivando il piano a consumo, non sarà più possibile attivare il piano carnet.',
        rangeLabelsDiscount: '25% di sconto',
        btnActionLabel: 'Attiva il piano',
      },
    },
    subProductStepUserUnrelated: {
      title: 'Non puoi aderire a {{selectedProduct}} Premium',
      description:
        'Il tuo ente non ha aderito ad <strong>{{selectedProduct}}</strong>, o non hai un ruolo per <3/>gestire il prodotto. <5/> Chiedi ad un Amministratore di <1/>aggiungerti nella sezione <7/>Utenti, oppure richiedi l’adesione ad <strong>{{selectedProduct}}</strong> per il tuo ente.',
      backHomeLabelBtn: 'Torna alla home',
      goToBtnLabel: 'Vai all’adesione',
    },
    selectUserPartyStep: {
      title: 'Seleziona il tuo ente',
      subTitle:
        "Seleziona l'ente per il quale stai richiedendo la sottoscrizione <1 />all'offerta <3>Premium</3>",
      searchLabel: 'Cerca ente',
      notFoundResults: 'Nessun risultato',
      IPAsubTitle:
        "Seleziona dall'Indice della Pubblica Amministrazione (IPA) l'ente <1/> per cui vuoi richiedere l'adesione a {{baseProduct}} Premium",
      helperLink: 'Non trovi il tuo ente? <1>Scopri perché</1>',
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
        "Riceverai una PEC all’indirizzo istituzionale dell’ente.<1 />Al suo interno troverai le istruzioni per completare la <3 /> sottoscrizione all'offerta <strong>Premium</strong>.",
      closeButton: 'Chiudi',
    },
    billingData: {
      subTitle:
      `Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti.<1 /> Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`,
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
    subtitle: 'Indica il tipo di ente che aderirà a <1>{{productName}}</1>',
    institutionTypeValues: {
      pa: 'Pubblica Amministrazione',
      gsp: 'Gestore di servizi pubblici',
      scp: 'Società a controllo pubblico',
      pt: 'Partner tecnologico',
      psp: 'Prestatori Servizi di Pagamento',
      sa: 'Gestore privato di piattaforma e-procurement',
      as: 'Società di assicurazione',
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
    pspAndProdPagoPATitle: 'Inserisci i dati',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
    closeBtnLabel: 'Chiudi',
    billingDataPt: {
      title: 'Inserisci i dati',
      subTitle:
        'Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3 /> prodotto <5>{{nameProduct}}</5>.',
    },
    billingDataSection: {
      invalidFiscalCode: 'Il Codice Fiscale non è valido',
      invalidTaxCodeInvoicing: 'Il Codice Fiscale inserito non è relativo al tuo ente',
      invalidZipCode: 'Il CAP non è valido',
      invalidVatNumber: 'La Partita IVA non è valida',
      invalidEmail: 'L’indirizzo email non è valido',
      invalidReaField: 'Il Campo REA non è valido',
      invalidMailSupport: 'L’indirizzo email non è valido',
      invalidShareCapitalField: 'Il campo capitale sociale non è valido',
      vatNumberAlreadyRegistered: 'La P. IVA che hai inserito è già stata registrata.',
      vatNumberVerificationErrorTitle: 'La verifica non è andata a buon fine',
      vatNumberVerificationErrorDescription:
        'Non è stato possibile verificare la P.IVA al momento. Riprova più tardi.',
      centralPartyLabel: 'Ente centrale',
      businessName: 'Ragione sociale',
      aooName: 'Denominazione AOO',
      uoName: 'Denominazione UO',
      aooUniqueCode: 'Codice Univoco AOO',
      uoUniqueCode: 'Codice Univoco UO',
      registeredOffice: 'Sede legale',
      fullLegalAddress: 'Indirizzo e numero civico della sede legale',
      zipCode: 'CAP',
      city: 'Città',
      noResult: 'Nessun risultato',
      county: 'Provincia',
      country: 'Nazione',
      digitalAddress: 'Indirizzo PEC',
      taxCodeEquals2PIVAdescription: 'La Partita IVA coincide con il Codice Fiscale',
      partyWithoutVatNumber: 'Il mio ente non ha la partita IVA',
      partyWIthoutVatNumberSubtitle: `Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,
      arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)`,
      vatNumberGroup: 'La Partita IVA è di gruppo',
      taxCode: 'Codice Fiscale',
      taxCodeCentralParty: 'Codice Fiscale ente centrale',
      vatNumber: 'Partita IVA',
      taxCodeInvoicing: 'Codice Fiscale SFE',
      ivassCode: 'Codice IVASS',
      sdiCode: 'Codice SDI',
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
        requiredCommercialRegisterNumber: 'Luogo di iscrizione al Registro delle Imprese',
        requiredShareCapital: 'Capitale sociale',
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
      verify: {
        loadingText: 'Stiamo verificando i tuoi dati',
      },
      delete: {
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
