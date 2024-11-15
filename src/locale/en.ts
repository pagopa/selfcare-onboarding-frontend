export default {
  asyncAutocomplete: {
    noResultsLabel: 'No result',
    lessThen3CharacterLabel: 'Enter at least 3 characters',
    lessThen11CharacterLabel: 'Enter at least 11 characters',
    searchLabel: 'Search for the institution',
    aooLabel: 'Enter the univocal AOO (Homogeneous Organizational Area) code',
    uoLabel: 'Enter the univocal UO (Homogeneous Organizational Area) code',
    ariaLabel: `Seleziona la tipologia di ricerca dell'ente`,
    businessName: 'Company name',
    taxcode: 'Company Fiscal Code',
    originId: 'IVASS code',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Search by',
    businessName: 'Company name',
    ivassCode: 'IVASS code',
    taxCode: 'Company Fiscal Code',
    aooCode: 'Univocal AOO code',
    uoCode: 'Univocal UO code',
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Download the standard contract',
          description: `Per completare l’adesione, scarica l’accordo e fai apporre la firma digitale in <1 /><2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Download the contract',
        },
        user: {
          title: 'Download the additional module',
          description: `Per completare l’adesione, scarica il Modulo di aggiunta e fai apporre la <1 />firma digitale in <2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Download the module',
        },
        disclaimer:
          'Firmando l’accordo, il Legale Rappresentante dell’ente, accetta espressamente e specificamente anche le singole clausole indicate nel paragrafo “Clausole ai sensi degli artt. 1341 e 1342 c.c.”',
      },
      upload: {
        product: {
          title: 'Upload the signed contract',
          description: `Una volta firmato l’accordo, segui le istruzioni per inviarlo e completare <1 /> l’adesione al prodotto scelto. Ricorda di caricare l’accordo <3>entro 30 giorni.</3>`,
        },
        user: {
          title: 'Upload the signed module',
          description: `Una volta firmato il Modulo, segui le istruzioni per inviarlo e completare <1 /> l’aggiunta di uno o più Amministratori.`,
        },
        goToUpload: 'Go to upload',
      },
    },
    upload: {
      product: {
        title: 'Upload the standard contract',
        description: `Carica l’accordo di adesione, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Drag the signed standard contract here or',
          link: 'upload the file',
        },
      },
      user: {
        title: 'Upload the module',
        description: `Carica il Modulo di aggiunta, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Drag the signed module here or',
          link: 'upload the file',
        },
        continue: 'Continue',
      },
      continue: 'Continue',
      error: {
        title: 'Uploading unsuccessful',
        description:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
        close: 'Exit',
        retry: 'Upload again',
      },
    },
  },
  fileUploadPreview: {
    loadingStatus: 'Uploading...',
    labelStatus: 'Ready for sending',
  },
  inlineSupportLink: {
    assistanceLink: 'Contact support',
  },
  moreInformationOnRoles: 'More information about roles',
  onboardingStep0: {
    title: 'Welcome to the Self-care portal',
    description:
      'In a few steps, your institution can register and manage all the PagoPA products.',
    privacyPolicyDescription: 'I have read and understood',
    privacyPolicyLink: 'the Privacy policy and Service terms and conditions of use',
    actionLabel: 'Continue',
  },
  stepVerifyOnboarding: {
    loadingText: 'We are verifying your data',
    ptAlreadyOnboarded: {
      title: 'The Partner is already registered',
      description:
        'Per operare su un prodotto, chiedi a un Amministratore di <1/> aggiungerti nella sezione Utenti.',
      backAction: 'Close',
    },
    alreadyOnboarded: {
      title: 'The selected institution has already registered',
      description:
        'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.',
      addNewAdmin:
        'Gli attuali Amministratori non sono più disponibili e hai l’esigenza <1 />di gestire i prodotti? <3>Aggiungi un nuovo Amministratore</3>',
      backHome: 'Go back to the home page',
    },
    genericError: {
      title: 'Something went wrong',
      description: `A causa di un errore del sistema non è possibile completare <br />la procedura. Ti chiediamo di riprovare più tardi.`,
      backHome: 'Go back to the home page',
    },
    userNotAllowedError: {
      title: 'You cannot register for this product',
      description: `Al momento, l'ente <1>{{partyName}}</1> non può aderire a <3>{{productTitle}}</3>. <5 /> Per maggiori dettagli contatta <7>l'assistenza</7>.`,
      noSelectedParty: 'indicated',
      backToHome: 'Go back to the home page',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'We are verifying your data',
    onboarding: {
      bodyTitle: 'Search for your institution',
      codyTitleSelected: 'Confirm the selected institution',
      disclaimer: {
        description: `Al momento possono aderire a SEND tramite Area Riservata solo le <1>Pubbliche <3 /> Amministrazioni Locali </1> presenti su IPA che trovi a <5>questo link</5>.`,
      },
      bodyDescription:
        'Inserisci uno dei dati richiesti e cerca dall’Indice della Pubblica <1/> Amministrazione (IPA) l’ente per cui vuoi richiedere l’adesione a <3/><4>{{productTitle}}</4>.',
      aggregator: 'I am an aggregator',
      aggregatorModal: {
        title: 'Aggregator',
        message: `Stai richiedendo l’adesione come ente aggregatore per <1>{{partyName}}</1>.<3 />Per completare l’adesione, dovrai indicare gli enti da aggregare.`,
        back: 'Go back',
        forward: 'Continue',
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
        placeholder: 'Search',
      },
      onboardingStepActions: {
        confirmAction: 'Continue',
        backAction: 'Go back',
      },
    },
  },
  stepUploadAggregates: {
    title: `Indica i soggetti aggregati per {{productName}}`,
    subTitle:
      'Scarica il file di esempio, compilalo seguendo le indicazioni e carica il documento per aggiungere/dichiarare gli enti da aggregare.',
    findOutMore: 'Questions? Consult the manual',
    errors: {
      onCsv: {
        title: 'The file contains one or more errors',
        description:
          '<1>Scarica il report</1> per verificare le informazioni e carica di nuovo il file.',
      },
      invalidFormat: {
        title: 'The file format is invalid',
        description: 'Only files in .csv format can be uploaded',
      },
    },
    dropArea: {
      title: 'Drag the .csv file with the list of the aggregated institutions or',
      button: 'upload the file',
    },
    downloadExampleCsv: 'Do you not know how to prepare the file? <1>Download the example</1>',
    back: 'Go back',
    forward: 'Continue',
  },
  stepAddManager: {
    title: 'Indicate the Legal representative',
    subTitle: {
      flow: {
        base: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3> <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`,
        premium: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.`,
        addNewUser: `La persona indicata firmerà il Modulo di aggiunta per il nuovo Amministratore e lo <1 />autorizzerà ad operare sul prodotto <3>{{productTitle}}</3> per il tuo ente.`,
      },
    },
    changedManager: {
      title: 'You are adding a Legal representative',
      message:
        'I dati del Legale Rappresentante inseriti sono diversi da quelli indicati in <1 />precedenza. Vuoi continuare?',
    },
    back: 'Go back',
    continue: 'Continue',
  },
  stepAddDelegates: {
    title: 'Indicate the administrator',
    description: {
      flow: {
        onboarding: `Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di <3>{{productTitle}}</3> e presenti nel contratto di <4 />adesione come delegati dal Legale Rappresentante.`,
        pt: 'You can add between one and three Administrators and their delegates.<1/> They will manage the users and products on behalf of the institutions.',
        addNewUser: `Puoi aggiungere un Amministratore o un suo delegato. Puoi inserire anche la persona che <1 />hai già indicato come Legale Rappresentante. Se aggiungi una persona già presente con un <3 />ruolo diverso per questo prodotto, verrà inserita come Amministratore.`,
      },
    },
    addUserLabel: 'ADD ANOTHER ADMINISTRATOR',
    addUserLink: 'Add another administrator',
    backLabel: 'Go back',
    confirmLabel: 'Continue',
    formControl: {
      label: 'Add me as an administrator',
    },
  },
  additionalDataPage: {
    title: 'Enter additional details',
    subTitle:
      'Scegli l’opzione che descrive il tuo ente. Se nessuna è appropriata, seleziona “Altro” e <1 /> inserisci maggiori dettagli.',
    formQuestions: {
      textFields: {
        labels: {
          note: 'Notes',
          ipa: 'Enter the IPA (Public Administration Index) code of reference',
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'You did not enter a note',
          fromBelongsRegulatedMarket: 'You did not enter a note',
          isFromIPA: 'Enter the IPA (Public Administration Index) code of reference',
          isConcessionaireOfPublicService: 'You did not enter a note',
          optionalPartyInformations: 'Mandatory field',
        },
      },
      estabilishedRegulatoryProvision:
        'L’ente è una società costituita ex lege da un provvedimento normativo',
      belongsRegulatedMarket:
        'L’ente appartiene ad un mercato regolamentato (es. energia, gas, acqua, <1 />trasporti, servizi postali ecc…)',
      registratedOnIPA: 'The institution is recorded in the IPA',
      concessionaireOfPublicService: 'The institution is a concessionaire of a public service',
      other: 'Other',
      optionalPartyInformations: 'Write information about your institution here',
    },
    options: {
      yes: 'Yes',
      no: 'No',
    },
    addNote: 'Add a note',
    allowedCharacters: 'Maximum 300 characters',
  },
  addUser: {
    title: `Aggiungi un nuovo <1 /> Amministratore`,
    subTitle: `Indica per quale prodotto vuoi aggiungere un nuovo<1 />Amministratore`,
    stepSelectProduct: {
      title: 'SELECT THE PRODUCT',
    },
  },
  platformUserForm: {
    helperText: 'The field is not valid',
    fields: {
      name: {
        label: 'Name',
        errors: {
          conflict: 'Incorrect or different than the fiscal code',
        },
      },
      surname: {
        label: 'Surname',
        errors: {
          conflict: 'Incorrect or different than the fiscal code',
        },
      },
      taxCode: {
        label: 'Tax code',
        errors: {
          invalid: 'The entered fiscal code is not valid',
          duplicate: 'The entered fiscal code was already entered',
        },
      },
      email: {
        label: 'Institutional email',
        errors: {
          invalid: 'The email address is not valid',
          duplicate: 'The entered email address was already entered',
        },
        description: 'Enter the institutional email address used for the institution',
      },
    },
  },
  completeRegistration: {
    sessionModal: {
      onConfirmLabel: 'Upload again',
      onCloseLabel: 'Exit',
    },
    steps: {
      step0: {
        label: 'Upload the registration document',
      },
      step1: {
        label: 'Upload the registration document',
      },
    },
    request: {
      notFound: {
        title: 'The page you entered is not available',
        description:
          'Al momento non è possibile procedere. Riprova tra qualche <1 />minuto, o contatta l’assistenza',
        contactAssistanceButton: 'Contact support',
      },
      expired: {
        product: {
          title: 'The registration request has expired',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di adesione. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'The request has expired',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di aggiunta di <2 />un Amministratore. Per procedere, invia una nuova <2 /> richiesta.`,
        },
        backHome: 'Go back to the home page',
      },
      alreadyCompleted: {
        product: {
          title: 'Your registration request has been accepted',
        },
        user: {
          title: 'Your request has been accepted',
        },
        description: `Per gestire il prodotto, accedi tramite SPID o CIE`,
        logIn: 'Login',
      },
      alreadyRejected: {
        product: {
          title: 'Your registration request has been canceled',
          description: `La richiesta di adesione non è andata a buon fine. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'The request is no longer valid',
          description: `Il tuo ente ha annullato la richiesta. Per aggiungere un <2 />nuovo Amministratore, inviane una nuova.`,
        },
        backHome: 'Go back to the home page',
      },
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Registration completed!',
          description: `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento è possibile <3 />accedere all'Area Riservata.`,
        },
        user: {
          title: 'Request completed',
          description: `Da questo momento gli Amministratori indicati possono <1 />accedere all’Area Riservata.`,
        },
        backHome: 'Go back to the home page',
      },
      error: {
        title: 'Uploading unsuccessful',
        description: 'The document was not uploaded successfully.',
        backToUpload: 'Upload again',
      },
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Check the document',
        product: {
          message:
            'The uploaded document is not the registration document. Check that it is correct and upload it again.',
        },
        user: {
          message:
            'Il documento caricato non corrisponde al modulo che hai ricevuto via email. Verifica che sia corretto e caricalo di nuovo.',
        },
      },
      INVALID_SIGN: {
        title: 'Check the document',
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
        title: 'Uploading unsuccessful',
        message:
          'Il caricamento del documento non è andato a buon fine. Torna indietro e caricalo di nuovo.',
      },
      INVALID_SIGN_FORMAT: {
        title: 'Uploading unsuccessful',
        message:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
      },
    },
  },
  noProductPage: {
    title: 'Sorry, something went wrong.',
    description: 'It is impossible to locate the desired product',
  },
  onboarding: {
    success: {
      flow: {
        product: {
          title: 'Registration request sent',
          publicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
          notPublicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
        },
        techPartner: {
          title: 'Registration request sent',
          description: `Invieremo un’email con l’esito della richiesta all’indirizzo <1 />PEC indicato.`,
        },
        user: {
          title: 'You sent the request',
          description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’operazione.`,
        },
      },
    },
    error: {
      title: 'Something went wrong.',
      description: `A causa di un errore del sistema non è possibile completare <1 />la procedura. Ti chiediamo di riprovare più tardi.`,
    },
    backHome: 'Go back to the home page',
    sessionModal: {
      title: 'Do you really want to exit?',
      message: 'If you exit, your request for registration will be lost.',
      onConfirmLabel: 'Exit',
      onCloseLabel: 'Cancel',
    },
    confirmationModal: {
      title: 'Confirm the request to send?',
      description: {
        flow: {
          base: 'You are sending a request to register for the product <1>{{productName}}</1> for the institution <3>{{institutionName}}</3>. <5 /> The standard contract will be sent to the institutional PEC of the institution and be signed by the Legal representative. Make sure you are authorized as an employee who can make the request.',
          addNewUser: `Stai aggiungendo un nuovo Amministratore per l’ente <1>{{institutionName}}</1>. <3 />L’ente riceverà un modulo alla PEC istituzionale e dovrà essere firmato dal Legale Rappresentante che hai indicato. <3 />Assicurati di essere autorizzato dall’ente a effettuare questa richiesta.`,
        },
      },
      confirm: 'Confirm',
      back: 'Go back',
    },
    loading: {
      loadingText: 'We are verifying your data',
    },
    phaseOutError: {
      title: 'Something went wrong',
      description:
        'Non puoi aderire al prodotto scelto poiché a breve non sarà <1 /> più disponibile.',
      backAction: 'Go back to the home page',
    },
  },
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Enrollment already completed',
      message:
        'The institution that you selected already enrolled for the <1 /><strong>Premium</strong> offer.',
      closeButton: 'Close',
    },
    subProductStepSelectPricingPlan: {
      discountLabelData: '25% discount until June 30, 2023 ',
      title: 'Switch to IO Premium and improve <1/> message performance',
      firstCheckLabel: 'Reduce collection times',
      secondCheckLabel: 'Improve collection performance',
      thirdCheckLabel: 'Reduce outstanding amounts',
      infoSectionLabel: `Se il tuo ente ha già aderito ad IO, scegli qual è il piano che più soddisfa le sue esigenze. <1/> Il piano a carnet è attivabile una sola volta. Una volta terminato il numero di messaggi del piano a  <3/> carnet, si attiverà automaticamente il piano a consumo. `,
      btnRejectLabel: 'I am not interested',
      pricingPlanExitModal: {
        title: 'Are you not interested in the Premium offers?',
        subtitle: 'If you exit, you will continue with access to the Reserved Area.',
        closeBtnLabel: 'Exit',
        confirmBtnLabel: 'Return to the Premium offers',
      },
      headerPlanCard: {
        from: 'From',
        to: 'To',
        beyond: 'Beyond',
        mess: '/ mess',
      },
      carnetPlan: {
        caption: 'CARNET PLAN - ONE TIME PAYMENT',
        discountBoxLabel: '25% discount',
        title: 'Chose between the {{carnetCount}} different carnets available based on your needs',
        showMore: 'Discover more',
        showLess: 'Show less',
        description:
          'Una volta selezionato il carnet non potrà essere modificato per via della sottoscrizione del contratto.',
        carnetLabelsDiscount: {
          c1: 'Save € 55',
          c2: 'Save € 543.75',
          c3: 'Save € 2,687.50',
          c4: 'Save € 5,312.50',
          c5: 'Save € 13,125',
          c6: 'Save € 25,625',
          c7: 'Save € 50,000',
        },
        btnActionLabel: 'Activate the plan',
      },
      consumptionPlan: {
        caption: 'PAY AS YOU GO PLAN',
        discountBoxLabel: '25% discount',
        title: 'Chose to pay only for the messages <1/> you actually send',
        showMore: 'Discover more',
        showLess: 'Show less',
        description:
          'Attivando il piano a consumo, non sarà più possibile attivare il piano carnet.',
        rangeLabelsDiscount: '25% discount',
        btnActionLabel: 'Activate the plan',
      },
    },
    subProductStepUserUnrelated: {
      title: 'You cannot register for {{selectedProduct}} Premium',
      description:
        'Il tuo ente non ha aderito ad <strong>{{selectedProduct}}</strong>, o non hai un ruolo per <3/>gestire il prodotto. <5/> Chiedi ad un Amministratore di <1/>aggiungerti nella sezione <7/>Utenti, oppure richiedi l’adesione ad <strong>{{selectedProduct}}</strong> per il tuo ente.',
      backHomeLabelBtn: 'Go back to the home page',
      goToBtnLabel: 'Go to registration',
    },
    selectUserPartyStep: {
      title: 'Select your institution',
      subTitle:
        'Select the institution for which you are requesting registration <1 />to the <3>Premium offer</3>',
      searchLabel: 'Search for the institution',
      notFoundResults: 'No result',
      IPAsubTitle:
        'Select the institution <1/> for which you want to request registration to {{baseProduct}} Premium from the Public Administration Index (IPA)',
      helperLink: 'Did you not find your institution? <1>Discover why</1>',
      confirmButton: 'Continue',
    },
    genericError: {
      title: 'Something went wrong',
      subTitle:
        'A causa di un errore del sistema non è possibile completare<0 /> la procedura. Ti chiediamo di riprovare più tardi.',
      homeButton: 'Go back to the home page',
    },
    successfulAdhesion: {
      title: 'The registration request was <1/>sent successfully',
      message:
        'You will receive a PEC at the institutional address of the institution.<1 />It will contain the instructions for completing <3 /> enrollment in the <strong>Premium</strong> offer.',
      closeButton: 'Close',
    },
    billingData: {
      subTitle: `Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti.<1 /> Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`,
    },
    exitModal: {
      title: 'Do you really want to exit?',
      message: 'If you exit, your request for registration will be lost.',
      backButton: 'Exit',
      cancelButton: 'Cancel',
    },
    loading: {
      loadingText: 'We are verifying your data',
    },
  },
  invalidPricingPlan: {
    title: 'Something went wrong',
    description:
      'Non riusciamo a trovare la pagina che stai cercando. <1 />Assicurati che l’indirizzo sia corretto o torna alla home.',
    backButton: 'Go back to the home page',
  },
  stepInstitutionType: {
    title: 'Select the type of institution that you <1/> represent',
    subtitle: 'Indicate the type of institution that will register for <1>{{productName}}</1>',
    institutionTypes: {
      pa: {
        title: 'Public Administration',
        description: 'art. 2, para. 2, letter A of CAD (Digital Administration Code)',
      },
      gsp: {
        title: 'Public Service Provider',
        description: 'art. 2, para. 2, letter B of CAD (Digital Administration Code)',
      },
      scp: {
        title: 'State-owned companies',
        description: 'art. 2, para. 2, letter C of CAD (Digital Administration Code)',
      },
      pt: {
        title: 'Technological partner',
        description:
          'Ai sensi di IO - Paragrafo 6.1.3 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” emanate da AgID ai sensi dell’art- 64-bis del CAD',
      },
      psp: {
        title: 'Payment Service Providers',
      },
      sa: {
        title: 'Private e-procurement platform operator',
      },
      as: {
        title: 'Insurance company',
      },
      prv: {
        title: 'Private',
      },
      oth: {
        title: 'Other',
        description: 'Creditors who registered optionally',
      },
    },
    backLabel: 'Go back',
    confirmLabel: 'Continue',
  },
  onboardingFormData: {
    title: 'Enter the institution data',
    pspAndProdPagoPATitle: 'Enter the data',
    backLabel: 'Go back',
    confirmLabel: 'Continue',
    closeBtnLabel: 'Close',
    billingDataPt: {
      title: 'Enter the data',
      subTitle:
        'Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3 /> prodotto <5>{{nameProduct}}</5>.',
    },
    billingDataSection: {
      invalidFiscalCode: 'The fiscal code is not valid',
      invalidTaxCodeInvoicing: 'The fiscal code is not related to your institution',
      invalidZipCode: 'The zip code is not valid',
      invalidVatNumber: 'The VAT no. is not valid',
      invalidEmail: 'The email address is not valid',
      invalidReaField: 'The REA (Economic and Administrative Index) field is not valid',
      invalidMailSupport: 'The email address is not valid',
      invalidShareCapitalField: 'The share capital field is not valid',
      invalidRecipientCodeNoAssociation: 'The entered code is not associated with your institution',
      invalidRecipientCodeNoBilling:
        'Il codice inserito è associato al codice fiscale di un ente che non ha il servizio di fatturazione attivo',
      vatNumberAlreadyRegistered: 'The VAT no. you entered was already registered.',
      vatNumberVerificationErrorTitle: 'The check was not successful',
      vatNumberVerificationErrorDescription:
        'Non è stato possibile verificare la P.IVA al momento. Riprova più tardi.',
      centralPartyLabel: 'Central institution',
      businessName: 'Company name',
      aooName: 'AOO name',
      uoName: 'UO name',
      aooUniqueCode: 'Univocal AOO code',
      uoUniqueCode: 'Univocal UO code',
      fullLegalAddress: 'Street address of the registered office',
      zipCode: 'ZIP CODE',
      city: 'City',
      noResult: 'No result',
      county: 'Province',
      country: 'Country',
      digitalAddress: 'PEC address',
      taxCodeEquals2PIVAdescription: 'The VAT no. is the same as the fiscal code',
      partyWithoutVatNumber: 'My institution does not have a VAT no.',
      partyWIthoutVatNumberSubtitle: `Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,
      arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)`,
      vatNumberGroup: 'The VAT no. is for the group',
      taxCode: 'Tax code',
      taxCodeCentralParty: 'Central institution fiscal code',
      vatNumber: 'VAT no.',
      taxCodeInvoicing: 'SFE fiscal code',
      originId: 'IVASS code',
      sdiCode: 'SDI code',
      sdiCodePaAooUo: 'Univocal or SDI code',
      sdiCodePaAooUoDescription:
        'È il codice univoco necessario per ricevere le fatture elettroniche. Può essere del tuo ente o della sua Unità Organizzativa di riferimento.',
      recipientCodeDescription: 'The code required for receiving electronic invoices',
      gspDescription: 'I am the operator of at least one public service: Gas, Energy, Telco.',
      pspDataSection: {
        commercialRegisterNumber: 'Business Register Registration no.',
        invalidCommercialRegisterNumber: 'The Business Register Registration no. is not valid',
        registrationInRegister: 'Registration with the register',
        registerNumber: 'Register number',
        invalidregisterNumber: 'The register number is not valid',
        abiCode: 'ABI code',
        invalidabiCode: 'The ABI code is not valid',
      },
      informationCompanies: {
        commercialRegisterNumber: 'Location of registration with the business register (optional)',
        requiredRea: 'REA',
        rea: 'REA (optional)',
        shareCapital: 'Share capital (optional)',
        requiredCommercialRegisterNumber: 'Location of registration with the business register',
        requiredShareCapital: 'Share capital',
      },
      assistanceContact: {
        supportEmail: 'Email address visible to citizens',
        supportEmailOptional: 'Email address visible to citizens (optional)',
        supportEmailDescriprion:
          'È il contatto che i cittadini visualizzano per richiedere assistenza all’ente',
      },
    },
    taxonomySection: {
      title: 'INDICATE THE GEOGRAPHICAL AREA',
      nationalLabel: 'National',
      localLabel: 'Local',
      infoLabel:
        'Seleziona il territorio in cui opera il tuo ente. Se locale, puoi scegliere una o più aree di competenza. Se l’ente ha già aderito ad altri prodotti PagoPA, troverai l’area già impostata.',
      localSection: {
        addButtonLabel: 'Add area',
        inputLabel: 'City, Province or Region',
      },
      error: {
        notMatchedArea: 'Select a city from the list',
      },
      modal: {
        addModal: {
          title: 'You are adding other areas for your institution',
          description: `Le aree geografiche verrano aggiunte a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?`,
          confirmButton: 'Continue',
          backButton: 'Go back',
        },
        modifyModal: {
          title: 'You are changing the geographical area for your institution',
          description:
            'La modifica verrà applicata a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?',
          confirmButton: 'Continue',
          backButton: 'Go back',
        },
      },
    },
    dpoDataSection: {
      dpoTitle: 'CONTACT THE DATA PROTECTION OFFICER',
      dpoAddress: 'Address',
      dpoPecAddress: 'PEC address',
      dpoEmailAddress: 'Email address',
    },
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Registration request deleted',
        description:
          'Nella home dell’Area Riservata puoi vedere i prodotti<1 />disponibili e richiedere l’adesione per il tuo ente.',
        backActionLabel: 'Go back to the home page',
      },
      error: {
        title: 'Something went wrong.',
        description:
          'A causa di un errore del sistema non è possibile completare la procedura. <1 /> Ti chiediamo di riprovare più tardi.',
        backActionLabel: 'Go back to the home page',
      },
      verify: {
        loadingText: 'We are verifying your data',
      },
      delete: {
        loadingText: 'We are canceling your registration',
      },
      jwtNotValid: {
        title: 'The registration request is no longer <1 /> valid',
        subtitle: 'This request was accepted, deleted or has expired.',
        backActionLabel: 'Go back to the home page',
      },
    },
    confirmCancellatione: {
      title: 'Do you want to delete the registration request <1 />?',
      subtitle: 'If you delete it, all the entered data will be lost. ',
      confirmActionLabel: 'Delete the request',
      backActionLabel: 'Go back to the home page',
    },
  },
  app: {
    sessionModal: {
      title: 'Session expired',
      message: 'You are being redirected to the login page...',
    },
  },
};
