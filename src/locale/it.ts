export default {
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
    originId: 'Codice IVASS',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Cerca per',
    businessName: 'Ragione Sociale',
    ivassCode: 'Codice IVASS',
    taxCode: 'Codice Fiscale ente',
    aooCode: 'Codice univoco AOO',
    uoCode: 'Codice univoco UO',
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Scarica l’accordo di adesione',
          description: `Per completare l’adesione, scarica l’accordo e fai apporre la firma digitale in <1 /><2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Scarica l’accordo',
        },
        user: {
          title: 'Scarica il Modulo di aggiunta',
          description: `Per completare l’adesione, scarica il Modulo di aggiunta e fai apporre la <1 />firma digitale in <2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Scarica il Modulo',
        },
        disclaimer:
          'Firmando l’accordo, il Legale Rappresentante dell’ente, accetta espressamente e specificamente anche le singole clausole indicate nel paragrafo “Clausole ai sensi degli artt. 1341 e 1342 c.c.”',
      },
      upload: {
        product: {
          title: 'Carica l’accordo firmato',
          description: `Una volta firmato l’accordo, segui le istruzioni per inviarlo e completare <1 /> l’adesione al prodotto scelto. Ricorda di caricare l’accordo <3>entro 30 giorni.</3>`,
        },
        user: {
          title: 'Carica il Modulo firmato',
          description: `Una volta firmato il Modulo, segui le istruzioni per inviarlo e completare <1 /> l’aggiunta di uno o più Amministratori.`,
        },
        goToUpload: 'Vai al caricamento',
      },
    },
    upload: {
      product: {
        title: "Carica l'accordo di adesione",
        description: `Carica l’accordo di adesione, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Trascina qui l’accordo di Adesione firmato oppure',
          link: 'carica il file',
        },
      },
      user: {
        title: 'Carica il modulo',
        description: `Carica il Modulo di aggiunta, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Trascina qui il modulo firmato oppure',
          link: 'carica il file',
        },
        continue: 'Continua',
      },
      continue: 'Continua',
      error: {
        title: 'Caricamento non riuscito',
        description:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
        close: 'Esci',
        retry: 'Carica di nuovo',
      },
    },
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
  stepVerifyOnboarding: {
    loadingText: 'Stiamo verificando i tuoi dati',
    ptAlreadyOnboarded: {
      title: 'Il Partner è già registrato',
      description:
        'Per operare su un prodotto, chiedi a un Amministratore di <1/> aggiungerti nella sezione Utenti.',
      backAction: 'Chiudi',
    },
    alreadyOnboarded: {
      title: 'L’ente selezionato ha già aderito',
      description:
        'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.',
      addNewAdmin:
        'Gli attuali Amministratori non sono più disponibili e hai l’esigenza <1 />di gestire i prodotti? <3>Aggiungi un nuovo Amministratore</3>',
      backHome: 'Torna alla home',
    },
    genericError: {
      title: 'Qualcosa è andato storto',
      description: `A causa di un errore del sistema non è possibile completare <br />la procedura. Ti chiediamo di riprovare più tardi.`,
      backHome: 'Torna alla home',
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
      aggregator: 'Sono un ente aggregatore',
      aggregatorModal: {
        title: 'Ente aggregatore',
        message: `Stai richiedendo l’adesione come ente aggregatore per <1>{{partyName}}</1>.<3 />Per completare l’adesione, dovrai indicare gli enti da aggregare.`,
        back: 'Indietro',
        forward: 'Continua',
      },
      ipaDescription: `Non trovi il tuo ente nell'IPA? <1>In questa pagina</1> trovi maggiori <3/> informazioni sull'indice e su come accreditarsi `,
      selectedInstitution:
        'Prosegui con l’adesione a <1>{{productName}}</1> per l’ente selezionato',
      gpsDescription: `Non trovi il tuo ente nell'IPA?<1 /><2>Inserisci manualmente i dati del tuo ente.</2>`,
      saSubTitle:
        'Se sei tra i gestori privati di piattaforma e-procurement e hai <1/> già ottenuto la <3>certificazione da AgID</3>, inserisci uno dei dati <5/> richiesti e cerca l’ente per cui vuoi richiedere l’adesione a <7/> <8>Interoperabilità.</8>',
      asSubTitle:
        'Se sei una società di assicurazione presente nell’Albo delle <1/>imprese IVASS, inserisci uno dei dati richiesti e cerca l’ente per<3/> cui vuoi richiedere l’adesione a <5>Interoperabilità.</5>',
      scpSubtitle:
        'Inserisci uno dei dati richiesti e cerca da InfoCamere l’ente <3/> per cui vuoi richiedere l’adesione a <5>Interoperabilità.</5>',
      asyncAutocomplete: {
        placeholder: 'Cerca',
      },
      onboardingStepActions: {
        confirmAction: 'Continua',
        backAction: 'Indietro',
      },
    },
  },
  stepUploadAggregates: {
    title: `Indica i soggetti aggregati per {{productName}}`,
    subTitle:
      'Scarica il file di esempio, compilalo seguendo le indicazioni e carica il documento per aggiungere/dichiarare gli enti da aggregare.',
    findOutMore: 'Dubbi? Vai al manuale',
    errors: {
      onCsv: {
        title: 'Il file contiene uno o più errori',
        description:
          '<1>Scarica il report</1> per verificare le informazioni e carica di nuovo il file.',
      },
      invalidFormat: {
        title: 'Il formato del file non è valido',
        description: 'È possibile caricare solo file in formato .csv',
      },
    },
    dropArea: {
      title: "Trascina qui il file .csv con l'elenco degli enti aggregati oppure",
      button: 'carica il file',
    },
    downloadExampleCsv: 'Non sai come preparare il file? <1>Scarica l’esempio</1>',
    back: 'Indietro',
    forward: 'Continua',
  },
  stepAddManager: {
    title: 'Indica il Legale Rappresentante',
    subTitle: {
      flow: {
        base: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3> <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`,
        premium: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.`,
        addNewUser: `La persona indicata firmerà il Modulo di aggiunta per il nuovo Amministratore e lo <1 />autorizzerà ad operare sul prodotto <3>{{productTitle}}</3> per il tuo ente.`,
      },
    },
    changedManager: {
      title: 'Stai aggiungendo un Legale Rappresentante',
      message:
        'I dati del Legale Rappresentante inseriti sono diversi da quelli indicati in <1 />precedenza. Vuoi continuare?',
    },
    back: 'Indietro',
    continue: 'Continua',
  },
  stepAddDelegates: {
    title: "Indica l'Amministratore",
    description: {
      flow: {
        onboarding: `Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di <3>{{productTitle}}</3> e presenti nel contratto di <4 />adesione come delegati dal Legale Rappresentante.`,
        pt: 'Puoi aggiungere da uno a tre Amministratori o suoi delegati.<1/> Si occuperanno della gestione degli utenti e dei prodotti per conto degli enti.',
        addNewUser: `Puoi aggiungere un Amministratore o un suo delegato. Puoi inserire anche la persona che <1 />hai già indicato come Legale Rappresentante. Se aggiungi una persona già presente con un <3 />ruolo diverso per questo prodotto, verrà inserita come Amministratore.`,
      },
    },
    addUserLabel: 'AGGIUNGI UN ALTRO AMMINISTRATORE',
    addUserLink: 'Aggiungi un altro Amministratore',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
    formControl: {
      label: 'Aggiungi me come Amministratore',
    },
  },
  additionalGpuDataPage: {
    title: 'Inserisci ulteriori dettagli',
    subTitle: 'Seleziona tra le opzioni quella che descrive il tuo ente.',
    firstBlock: {
      yes: 'Si',
      no: 'No',
      question: {
        isPartyRegistered: 'L’ente è iscritto a un Albo, Registro o Elenco?',
        subscribedTo: 'Iscritto a:',
        isPartyProvidingAService: 'L’ente eroga un servizio rivolto ai cittadini?',
        gpuRequestAccessFor:
          'Per quali servizi di pubblica utilità e/o di interesse generale l’ente richiede l’accesso?',
        longTermPayments: 'La frequenza dei pagamenti è continuativa?',
      },
      placeholder: {
        registerBoardList: 'Registro/Albo/Elenco',
        answer: 'Risposta',
        numberOfSubscription: 'Numero iscrizione',
      },
      errors: {
        requiredField: 'Campo obbligatorio',
      },
    },
    secondBlock: {
      title:
        'Il legale rappresentante dell’Ente Richiedente dichiara e rappresenta irrevocabilmente:',
      boxes: {
        first: 'di avere il potere di agire in nome e per conto dell’Ente Richiedente;',
        second:
          'che l’Ente, per il tramite del proprio legale rappresentante, il legale rappresentante e i propri Dirigenti sono in possesso di tutte le autorizzazioni previste dalla legge per lo svolgimento delle attività ad oggetto della richiesta e sottese alla stessa;',
        third:
          'che esso legale rappresentante e i dirigenti dell’Ente Richiedente non si trovano in una delle circostanze indicate nell’articolo 94 e 95 D.Lgs. n. 36/2023;',
        fourth:
          'che nei confronti dello stesso e dei dirigenti dell’Ente Richiedente non è pendente alcun procedimento per l’applicazione di una delle misure di prevenzione di cui all’art. 6 del D.Lgs. 159/2011 e che non sussiste nessuna delle cause ostative previste dall’art. 67 del D.Lgs. 159/2011;',
        fifth:
          'che l’Ente richiedente non è destinatario di provvedimenti giudiziari, né coinvolto in procedimenti pendenti che comportano l’applicazione di sanzioni amministrative di cui al decreto legislativo 8 giugno 2001, n. 231.',
      },
      legalBlockFooterInfo:
        'Le dichiarazioni di cui al presente documento sono rilasciate ai sensi dell’art. 46 del D.P.R. 28.12.2000 n. 445. In caso di dichiarazioni mendaci si applicano le sanzioni, anche di natura penale, applicabili, tra cui le fattispecie previste e punite di cui al D.P.R. 28.12.2000 n. 445.',
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
  addUser: {
    title: `Aggiungi un nuovo <1 /> Amministratore`,
    subTitle: `Indica per quale prodotto vuoi aggiungere un nuovo<1 />Amministratore`,
    stepSelectProduct: {
      title: 'SELEZIONA IL PRODOTTO',
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
        product: {
          title: 'La richiesta di adesione è scaduta',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di adesione. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'La richiesta è scaduta',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di aggiunta di <2 />un Amministratore. Per procedere, invia una nuova <2 /> richiesta.`,
        },
        backHome: 'Torna alla home',
      },
      alreadyCompleted: {
        product: {
          title: 'La richiesta di adesione è stata accettata',
        },
        user: {
          title: 'La richiesta è già stata accettata',
        },
        description: `Per gestire il prodotto, accedi tramite SPID o CIE`,
        logIn: 'Accedi',
      },
      alreadyRejected: {
        product: {
          title: 'La richiesta di adesione è stata annullata',
          description: `La richiesta di adesione non è andata a buon fine. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'La richiesta non è più valida',
          description: `Il tuo ente ha annullato la richiesta. Per aggiungere un <2 />nuovo Amministratore, inviane una nuova.`,
        },
        backHome: 'Torna alla home',
      },
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Adesione completata!',
          description: `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento è possibile <3 />accedere all'Area Riservata.`,
        },
        user: {
          title: 'Richiesta completata',
          description: `Da questo momento gli Amministratori indicati possono <1 />accedere all’Area Riservata.`,
        },
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
        product: {
          message:
            "Il documento caricato non corrisponde all'Atto di Adesione. Verifica che sia corretto e caricalo di nuovo.",
        },
        user: {
          message:
            'Il documento caricato non corrisponde al modulo che hai ricevuto via email. Verifica che sia corretto e caricalo di nuovo.',
        },
      },
      INVALID_SIGN: {
        title: 'Controlla il documento',
        product: {
          message:
            'La Firma Digitale non è riconducibile al Legale Rappresentante indicato in fase di adesione. Verifica la corrispondenza e carica di nuovo il documento.',
        },
        user: {
          message:
            'La Firma Digitale non è riconducibile al Legale Rappresentante indicato in fase di richiesta. Verifica la corrispondenza e carica di nuovo il documento.',
        },
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
    success: {
      flow: {
        product: {
          title: 'Richiesta di adesione inviata',
          publicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
          notPublicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
        },
        techPartner: {
          title: 'Richiesta di registrazione inviata',
          description: `Invieremo un’email con l’esito della richiesta all’indirizzo <1 />PEC indicato.`,
        },
        user: {
          title: 'Hai inviato la richiesta',
          description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’operazione.`,
        },
      },
    },
    error: {
      title: 'Qualcosa è andato storto.',
      description: `A causa di un errore del sistema non è possibile completare <1 />la procedura. Ti chiediamo di riprovare più tardi.`,
    },
    backHome: 'Torna alla home',
    sessionModal: {
      title: 'Vuoi davvero uscire?',
      message: 'Se esci, la richiesta di adesione andrà persa.',
      onConfirmLabel: 'Esci',
      onCloseLabel: 'Annulla',
    },
    confirmationModal: {
      title: 'Confermi la richiesta di invio?',
      description: {
        flow: {
          base: 'Stai inviando una richiesta di adesione al prodotto <1>{{productName}}</1> per l’ente <3>{{institutionName}}</3>. <5 /> L’accordo di adesione arriverà alla PEC istituzionale dell’ente e dovrà essere sottoscritta dal Legale Rappresentante. Assicurati di essere autorizzato come dipendente a effettuare questa richiesta.',
          addNewUser: `Stai aggiungendo un nuovo Amministratore per l’ente <1>{{institutionName}}</1>. <3 />L’ente riceverà un modulo alla PEC istituzionale e dovrà essere firmato dal Legale Rappresentante che hai indicato. <3 />Assicurati di essere autorizzato dall’ente a effettuare questa richiesta.`,
        },
      },
      confirm: 'Conferma',
      back: 'Indietro',
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
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Sottoscrizione già avvenuta',
      message:
        "L'ente che hai selezionato ha già sottoscritto l'offerta <1 /><strong>Premium</strong>.",
      closeButton: 'Chiudi',
    },
    subProductStepSelectPricingPlan: {
      discountLabelData: '25% di sconto Fino al 30 giugno 2023 ',
      title: 'Passa a IO Premium e migliora le <1/> performance dei messaggi',
      firstCheckLabel: 'Riduci i tempi di incasso',
      secondCheckLabel: 'Migliori le performance di riscossione',
      thirdCheckLabel: 'Riduci i crediti insoluti',
      infoSectionLabel: `Se il tuo ente ha già aderito ad IO, scegli qual è il piano che più soddisfa le sue esigenze. <1/> Il piano a carnet è attivabile una sola volta. Una volta terminato il numero di messaggi del piano a  <3/> carnet, si attiverà automaticamente il piano a consumo. `,
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
        "Seleziona l'ente per il quale stai richiedendo la sottoscrizione <1 />all'offerta <3>{{productName}}</3>",
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
      subTitle: `Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti.<1 /> Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`,
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
    institutionTypes: {
      pa: {
        title: 'Pubblica Amministrazione',
        description: 'art. 2, comma 2, lettera A del CAD',
      },
      gsp: {
        title: 'Gestore di servizi pubblici',
        description: 'art. 2, comma 2, lettera B del CAD',
      },
      gpu: {
        title: 'Gestore di pubblica utilità e/o di interesse generale',
        description: 'Enti creditori aderenti in via facoltativa',
      },
      scp: {
        title: 'Società a controllo pubblico',
        description: 'art. 2, comma 2, lettera C del CAD',
      },
      pt: {
        title: 'Partner tecnologico',
        description:
          'Ai sensi di IO - Paragrafo 6.1.3 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” emanate da AgID ai sensi dell’art- 64-bis del CAD',
      },
      psp: {
        title: 'Prestatori Servizi di Pagamento',
      },
      sa: {
        title: 'Gestore privato di piattaforma e-procurement',
      },
      as: {
        title: 'Società di assicurazione',
      },
      prv: {
        title: 'Privati',
      },
      oth: {
        title: 'Altro',
        description: 'Enti creditori aderenti in via facoltativa',
      },
    },
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
  },
  onboardingFormData: {
    title: 'Inserisci i dati dell’ente',
    pspAndProdPagoPATitle: 'Inserisci i dati',
    backLabel: 'Indietro',
    confirmLabel: 'Continua',
    closeBtnLabel: 'Chiudi',
    billingDataPt: {
      title: 'Inserisci i dati',
      subTitle:
        'Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3 /> prodotto <5>{{nameProduct}}</5>.',
    },
    pspDashboardWarning: 'Per aggiornare i dati presenti, contatta il servizio di <1>Assistenza</1>',
    billingDataSection: {
      invalidFiscalCode: 'Il Codice Fiscale non è valido',
      invalidTaxCodeInvoicing: 'Il Codice Fiscale inserito non è relativo al tuo ente',
      invalidZipCode: 'Il CAP non è valido',
      invalidVatNumber: 'La Partita IVA non è valida',
      invalidEmail: 'L’indirizzo email non è valido',
      invalidReaField: 'Il Campo REA non è valido',
      invalidMailSupport: 'L’indirizzo email non è valido',
      invalidShareCapitalField: 'Il campo capitale sociale non è valido',
      recipientCodeMustBe6Chars: 'Il codice deve essere di minimo 6 caratteri',
      invalidRecipientCodeNoAssociation: 'Il codice inserito non è associato al tuo ente',
      invalidRecipientCodeNoBilling:
        'Il codice inserito è associato al codice fiscale di un ente che non ha il servizio di fatturazione attivo',
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
      originId: 'Codice IVASS',
      sdiCode: 'Codice SDI',
      sdiCodePaAooUo: 'Codice univoco o SDI',
      sdiCodePaAooUoDescription:
        'È il codice univoco necessario per ricevere le fatture elettroniche. Può essere del tuo ente o della sua Unità Organizzativa di riferimento.',
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
        requiredRea: 'REA',
        rea: 'REA (facoltativo)',
        shareCapital: 'Capitale sociale (facoltativo)',
        requiredCommercialRegisterNumber: 'Luogo di iscrizione al Registro delle Imprese',
        requiredShareCapital: 'Capitale sociale',
      },
      assistanceContact: {
        supportEmail: 'Indirizzo email visibile ai cittadini',
        supportEmailOptional: 'Indirizzo email visibile ai cittadini (facoltativo)',
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
      dpoEmailAddress: 'Indirizzo email',
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
