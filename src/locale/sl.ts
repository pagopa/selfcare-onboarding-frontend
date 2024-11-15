export default {
  asyncAutocomplete: {
    noResultsLabel: 'Brez rezultatov',
    lessThen3CharacterLabel: 'Vnesite vsaj 3 znake',
    lessThen11CharacterLabel: 'Vnesite vsaj 11 znake',
    searchLabel: 'Poiščite organizacijo',
    aooLabel: 'Vnesite edinstveno kodo AOO',
    uoLabel: 'Vnesite edinstveno kodo UO',
    ariaLabel: `Seleziona la tipologia di ricerca dell'ente`,
    businessName: 'Naziv podjetja',
    taxcode: 'Davčna številka organizacije',
    originId: 'Koda IVASS',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Išči po',
    businessName: 'Naziv podjetja',
    ivassCode: 'Koda IVASS',
    taxCode: 'Davčna številka organizacije',
    aooCode: 'Edinstvena koda AOO',
    uoCode: 'Edinstvena koda UO',
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Prenesite pogodbo o članstvu',
          description: `Per completare l’adesione, scarica l’accordo e fai apporre la firma digitale in <1 /><2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Prenesite pogodbo',
        },
        user: {
          title: 'Prenesite obrazec za dodatek',
          description: `Per completare l’adesione, scarica il Modulo di aggiunta e fai apporre la <1 />firma digitale in <2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Prenesite obrazec',
        },
        disclaimer:
          'Firmando l’accordo, il Legale Rappresentante dell’ente, accetta espressamente e specificamente anche le singole clausole indicate nel paragrafo “Clausole ai sensi degli artt. 1341 e 1342 c.c.”',
      },
      upload: {
        product: {
          title: 'Naložite podpisano pogodbo',
          description: `Una volta firmato l’accordo, segui le istruzioni per inviarlo e completare <1 /> l’adesione al prodotto scelto. Ricorda di caricare l’accordo <3>entro 30 giorni.</3>`,
        },
        user: {
          title: 'Naložite podpisan obrazec',
          description: `Una volta firmato il Modulo, segui le istruzioni per inviarlo e completare <1 /> l’aggiunta di uno o più Amministratori.`,
        },
        goToUpload: 'Pojdite na nalaganje',
      },
    },
    upload: {
      product: {
        title: "Naložite pogodbo o članstvu",
        description: `Carica l’accordo di adesione, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Podpisano pogodbo o članstvu povlecite sem ali',
          link: 'naložite datoteko',
        },
      },
      user: {
        title: 'Naložite obrazec',
        description: `Carica il Modulo di aggiunta, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Povlecite podpisan obrazec sem ali',
          link: 'naložite datoteko',
        },
        continue: 'Nadaljuj',
      },
      continue: 'Nadaljuj',
      error: {
        title: 'Nalaganje ni uspelo',
        description:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
        close: 'Izhod',
        retry: 'Ponovno naloži',
      },
    },
  },
  fileUploadPreview: {
    loadingStatus: 'Nalaganje ...',
    labelStatus: 'Pripravljeno za pošiljanje',
  },
  inlineSupportLink: {
    assistanceLink: "obrnite se na podporo",
  },
  moreInformationOnRoles: 'Več informacij o vlogah',
  onboardingStep0: {
    title: 'Dobrodošli na Portalu za samopomoč',
    description: 'V samo nekaj korakih se bo vaša organizacija lahko pridružila in upravljala vse produkte PagoPA.',
    privacyPolicyDescription: 'Prebral/-a sem in razumel/-a',
    privacyPolicyLink: 'izjavo o varstvu osebnih podatkov ter Pravila in pogoje uporabe storitve',
    actionLabel: 'Nadaljuj',
  },
  stepVerifyOnboarding: {
    loadingText: 'Preverjamo vaše podatke',
    ptAlreadyOnboarded: {
      title: 'Partner je že registriran',
      description:
        'Per operare su un prodotto, chiedi a un Amministratore di <1/> aggiungerti nella sezione Utenti.',
      backAction: 'Zapri',
    },
    alreadyOnboarded: {
      title: 'Izbrana organizacija se je že prijavila',
      description:
        'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.',
      addNewAdmin:
        'Gli attuali Amministratori non sono più disponibili e hai l’esigenza <1 />di gestire i prodotti? <3>Aggiungi un nuovo Amministratore</3>',
      backHome: 'Vrni se domov',
    },
    genericError: {
      title: 'Nekaj ​​je šlo narobe',
      description: `A causa di un errore del sistema non è possibile completare <br />la procedura. Ti chiediamo di riprovare più tardi.`,
      backHome: 'Vrni se domov',
    },
    userNotAllowedError: {
      title: 'Na ta produkt se ne morete naročiti',
      description: `Al momento, l'ente <1>{{partyName}}</1> non può aderire a <3>{{productTitle}}</3>. <5 /> Per maggiori dettagli contatta <7>l'assistenza</7>.`,
      noSelectedParty: 'navedeno',
      backToHome: 'Vrni se domov',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'Preverjamo vaše podatke',
    onboarding: {
      bodyTitle: 'Poiščite svojo organizacijo',
      codyTitleSelected: 'Potrdite izbrano organizacijo',
      disclaimer: {
        description: `Al momento possono aderire a SEND tramite Area Riservata solo le <1>Pubbliche <3 /> Amministrazioni Locali </1> presenti su IPA che trovi a <5>questo link</5>.`,
      },
      bodyDescription:
        'Inserisci uno dei dati richiesti e cerca dall’Indice della Pubblica <1/> Amministrazione (IPA) l’ente per cui vuoi richiedere l’adesione a <3/><4>{{productTitle}}</4>.',
      aggregator: 'Sem združevalna organizacija',
      aggregatorModal: {
        title: 'Združevalna organizacija',
        message: `Stai richiedendo l’adesione come ente aggregatore per <1>{{partyName}}</1>.<3 />Per completare l’adesione, dovrai indicare gli enti da aggregare.`,
        back: 'Nazaj',
        forward: 'Nadaljuj',
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
        placeholder: 'Išči',
      },
      onboardingStepActions: {
        confirmAction: 'Nadaljuj',
        backAction: 'Nazaj',
      },
    },
  },
  stepUploadAggregates: {
    title: `Indica i soggetti aggregati per {{productName}}`,
    subTitle:
      'Scarica il file di esempio, compilalo seguendo le indicazioni e carica il documento per aggiungere/dichiarare gli enti da aggregare.',
    findOutMore: 'Ste v dvomih? Pojdite na priročnik',
    errors: {
      onCsv: {
        title: 'Datoteka vsebuje eno ali več napak',
        description:
          '<1>Scarica il report</1> per verificare le informazioni e carica di nuovo il file.',
      },
      invalidFormat: {
        title: 'Format datoteke ni veljaven',
        description: 'Naložite lahko samo datoteke v obliki zapisa .csv',
      },
    },
    dropArea: {
      title: "Datoteko .csv s seznamom združenih organizacij povlecite sem ali",
      button: 'naložite datoteko',
    },
    downloadExampleCsv: 'Ne veste, kako pripraviti datoteko? <1>Prenesite primer</1>',
    back: 'Nazaj',
    forward: 'Nadaljuj',
  },
  stepAddManager: {
    title: 'Označuje pravnega zastopnika',
    subTitle: {
      flow: {
        base: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3> <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`,
        premium: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.`,
        addNewUser: `La persona indicata firmerà il Modulo di aggiunta per il nuovo Amministratore e lo <1 />autorizzerà ad operare sul prodotto <3>{{productTitle}}</3> per il tuo ente.`,
      },
    },
    changedManager: {
      title: 'Dodajate pravnega zastopnika',
      message:
        'I dati del Legale Rappresentante inseriti sono diversi da quelli indicati in <1 />precedenza. Vuoi continuare?',
    },
    back: 'Nazaj',
    continue: 'Nadaljuj',
  },
  stepAddDelegates: {
    title: "Označuje skrbnika",
    description: {
      flow: {
        onboarding: `Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di <3>{{productTitle}}</3> e presenti nel contratto di <4 />adesione come delegati dal Legale Rappresentante.`,
        pt: 'Dodate lahko enega do tri skrbnike ali njihove pooblaščence.<1/> V imenu organizacij bodo upravljali upravljanje uporabnikov in produktov.',
        addNewUser: `Puoi aggiungere un Amministratore o un suo delegato. Puoi inserire anche la persona che <1 />hai già indicato come Legale Rappresentante. Se aggiungi una persona già presente con un <3 />ruolo diverso per questo prodotto, verrà inserita come Amministratore.`,
      },
    },
    addUserLabel: 'DODAJTE DRUGEGA SKRBNIKA',
    addUserLink: 'Dodajte drugega skrbnika',
    backLabel: 'Nazaj',
    confirmLabel: 'Nadaljuj',
    formControl: {
      label: 'Dodaj me kot skrbnika',
    },
  },
  additionalDataPage: {
    title: 'Vnesite dodatne podrobnosti',
    subTitle:
      'Scegli l’opzione che descrive il tuo ente. Se nessuna è appropriata, seleziona “Altro” e <1 /> inserisci maggiori dettagli.',
    formQuestions: {
      textFields: {
        labels: {
          note: 'Opombe',
          ipa: 'Vnesite referenčno kodo IPA',
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'Vnesli niste nobenih opomb',
          fromBelongsRegulatedMarket: 'Vnesli niste nobenih opomb',
          isFromIPA: 'Vnesite referenčno kodo IPA',
          isConcessionaireOfPublicService: 'Vnesli niste nobenih opomb',
          optionalPartyInformations: 'Zahtevano polje',
        },
      },
      estabilishedRegulatoryProvision:
        'L’ente è una società costituita ex lege da un provvedimento normativo',
      belongsRegulatedMarket:
        'L’ente appartiene ad un mercato regolamentato (es. energia, gas, acqua, <1 />trasporti, servizi postali ecc…)',
      registratedOnIPA: 'Organizacija je registrirana na IPA',
      concessionaireOfPublicService: 'Organizacija je koncesionar javne službe',
      other: 'Drugo',
      optionalPartyInformations: 'Tukaj napišite podatke o svoji organizaciji',
    },
    options: {
      yes: 'Da',
      no: 'Ne',
    },
    addNote: 'Dodajte opombo',
    allowedCharacters: 'Največ 300 znakov',
  },
  addUser: {
    title: `Aggiungi un nuovo <1 /> Amministratore`,
    subTitle: `Indica per quale prodotto vuoi aggiungere un nuovo<1 />Amministratore`,
    stepSelectProduct: {
      title: 'IZBERITE PRODUKT',
    },
  },
  platformUserForm: {
    helperText: 'Polje ni veljavno',
    fields: {
      name: {
        label: 'Ime',
        errors: {
          conflict: 'Ime ni pravilno ali se razlikuje od davčne številke',
        },
      },
      surname: {
        label: 'Priimek',
        errors: {
          conflict: 'Priimek ni pravilen ali se razlikuje od davčne številke',
        },
      },
      taxCode: {
        label: 'Davčna številka',
        errors: {
          invalid: 'Vnesena davčna številka je neveljavna',
          duplicate: 'Vnesena davčna številka že obstaja',
        },
      },
      email: {
        label: 'Overjen e-poštni naslov',
        errors: {
          invalid: "E-poštni naslov je neveljaven",
          duplicate: "Vneseni e-poštni naslov že obstaja",
        },
        description: 'Vnesite overjen e-poštni naslov, ki se uporablja za organizacijo',
      },
    },
  },
  completeRegistration: {
    sessionModal: {
      onConfirmLabel: 'Ponovno naloži',
      onCloseLabel: 'Izhod',
    },
    steps: {
      step0: {
        label: "Naložite Akt o članstvu",
      },
      step1: {
        label: "Naložite Akt o članstvu",
      },
    },
    request: {
      notFound: {
        title: 'Stran, ki ste jo iskali, ni na voljo',
        description:
          'Al momento non è possibile procedere. Riprova tra qualche <1 />minuto, o contatta l’assistenza',
        contactAssistanceButton: 'Obrnite se na podporo',
      },
      expired: {
        product: {
          title: 'Vaša prijava za članstvo je potekla',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di adesione. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'Zahteva je potekla',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di aggiunta di <2 />un Amministratore. Per procedere, invia una nuova <2 /> richiesta.`,
        },
        backHome: 'Vrni se domov',
      },
      alreadyCompleted: {
        product: {
          title: 'Prošnja za članstvo je bila sprejeta',
        },
        user: {
          title: 'Zahteva je že sprejeta',
        },
        description: `Per gestire il prodotto, accedi tramite SPID o CIE`,
        logIn: 'Prijava',
      },
      alreadyRejected: {
        product: {
          title: 'Zahteva za članstvo je bila preklicana',
          description: `La richiesta di adesione non è andata a buon fine. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'Zahteva ni več veljavna',
          description: `Il tuo ente ha annullato la richiesta. Per aggiungere un <2 />nuovo Amministratore, inviane una nuova.`,
        },
        backHome: 'Vrni se domov',
      },
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Članstvo zaključeno!',
          description: `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento è possibile <3 />accedere all'Area Riservata.`,
        },
        user: {
          title: 'Zahteva je zaključena',
          description: `Da questo momento gli Amministratori indicati possono <1 />accedere all’Area Riservata.`,
        },
        backHome: 'Vrni se domov',
      },
      error: {
        title: 'Nalaganje ni uspelo',
        description: 'Nalaganje dokumenta ni bilo uspešno.',
        backToUpload: 'Ponovno naloži',
      },
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Preverite dokument',
        product: {
          message:
            "Naloženi dokument ne ustreza Aktu o članstvu. Preverite, ali je pravilen, in ga znova naložite.",
        },
        user: {
          message:
            'Il documento caricato non corrisponde al modulo che hai ricevuto via email. Verifica che sia corretto e caricalo di nuovo.',
        },
      },
      INVALID_SIGN: {
        title: 'Preverite dokument',
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
        title: 'Nalaganje ni uspelo',
        message:
          'Il caricamento del documento non è andato a buon fine. Torna indietro e caricalo di nuovo.',
      },
      INVALID_SIGN_FORMAT: {
        title: 'Nalaganje ni uspelo',
        message:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
      },
    },
  },
  noProductPage: {
    title: 'Žal, nekaj je šlo narobe.',
    description: 'Ni mogoče najti želenega produkta',
  },
  onboarding: {
    success: {
      flow: {
        product: {
          title: 'Zahteva za članstvo je poslana',
          publicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
          notPublicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
        },
        techPartner: {
          title: 'Zahteva za registracijo poslana',
          description: `Invieremo un’email con l’esito della richiesta all’indirizzo <1 />PEC indicato.`,
        },
        user: {
          title: 'Poslali ste zahtevo',
          description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’operazione.`,
        },
      },
    },
    error: {
      title: 'Nekaj ​​je šlo narobe.',
      description: `A causa di un errore del sistema non è possibile completare <1 />la procedura. Ti chiediamo di riprovare più tardi.`,
    },
    backHome: 'Vrni se domov',
    sessionModal: {
      title: 'Ali se res želite odjaviti?',
      message: 'Če se odjavite, bo vaša zahteva za članstvo izgubljena.',
      onConfirmLabel: 'Izhod',
      onCloseLabel: 'Prekliči',
    },
    confirmationModal: {
      title: 'Ali potrjujete pošiljanje zahteve?',
      description: {
        flow: {
          base: 'Pošiljate zahtevo za pridružitev produkta <1>{{productName}}</1> za organizacijo <3>{{institutionName}}</3>. <5 /> Pogodba o članstvu bo poslana na overjen e-poštni naslov organizacije in jo mora podpisati pravni zastopnik. Prepričajte se, da ste kot zaposleni pooblaščeni za vložitev te zahteve.',
          addNewUser: `Stai aggiungendo un nuovo Amministratore per l’ente <1>{{institutionName}}</1>. <3 />L’ente riceverà un modulo alla PEC istituzionale e dovrà essere firmato dal Legale Rappresentante che hai indicato. <3 />Assicurati di essere autorizzato dall’ente a effettuare questa richiesta.`,
        },
      },
      confirm: 'Potrdi',
      back: 'Nazaj',
    },
    loading: {
      loadingText: 'Preverjamo vaše podatke',
    },
    phaseOutError: {
      title: 'Nekaj ​​je šlo narobe',
      description:
        'Non puoi aderire al prodotto scelto poiché a breve non sarà <1 /> più disponibile.',
      backAction: 'Vrni se domov',
    },
  },
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Prijava za naročnino je že bila narejena',
      message:
        "Organizacija, ki ste jo izbrali, je že naročena na ponudbo <1 /><strong>Premium</strong>.",
      closeButton: 'Zapri',
    },
    subProductStepSelectPricingPlan: {
      discountLabelData: '25 % popust Do 30. Junija 2023 ',
      title: 'Nadgradite na IO Premium in izboljšajte <1/> učinkovitost sporočil',
      firstCheckLabel: 'Skrajšajte čas prejema plačil',
      secondCheckLabel: 'Izboljšana učinkovitost izterjav',
      thirdCheckLabel: 'Zmanjšajte neplačane terjatve',
      infoSectionLabel: `Se il tuo ente ha già aderito ad IO, scegli qual è il piano che più soddisfa le sue esigenze. <1/> Il piano a carnet è attivabile una sola volta. Una volta terminato il numero di messaggi del piano a  <3/> carnet, si attiverà automaticamente il piano a consumo. `,
      btnRejectLabel: 'Ne zanima me',
      pricingPlanExitModal: {
        title: 'Se želite odpovedati ponudbam Premium?',
        subtitle: 'Če izstopite, boste nadaljevali z dostopom do varnega območja.',
        closeBtnLabel: 'Izhod',
        confirmBtnLabel: 'Nazaj na ponudbe Premium',
      },
      headerPlanCard: {
        from: 'Od',
        to: 'do',
        beyond: 'Čez',
        mess: '/ sporočilo',
      },
      carnetPlan: {
        caption: 'NAČRT PO ZVEZKU – ENKRATNI',
        discountBoxLabel: '25-% popust',
        title: 'Izbirajte med {{carnetCount}} različnimi zvezki, zasnovanimi za vse vaše potrebe',
        showMore: 'Izvedite več',
        showLess: 'Prikaži manj',
        description:
          'Una volta selezionato il carnet non potrà essere modificato per via della sottoscrizione del contratto.',
        carnetLabelsDiscount: {
          c1: 'Prihranite 55 EUR',
          c2: 'Prihranite 543,75 EUR',
          c3: 'Prihranite 2.687,50 EUR',
          c4: 'Prihranite 5.312,50 EUR',
          c5: 'Prihranite 13.125 EUR',
          c6: 'Prihranite 25.625 EUR',
          c7: 'Prihranite 50.000 EUR',
        },
        btnActionLabel: 'Aktivirajte načrt',
      },
      consumptionPlan: {
        caption: 'NAČRT PORABE',
        discountBoxLabel: '25-% popust',
        title: 'Izberite plačilo samo za dejanska <1/> sporočila, ki jih pošljete',
        showMore: 'Izvedite več',
        showLess: 'Prikaži manj',
        description:
          'Attivando il piano a consumo, non sarà più possibile attivare il piano carnet.',
        rangeLabelsDiscount: '25-% popust',
        btnActionLabel: 'Aktivirajte načrt',
      },
    },
    subProductStepUserUnrelated: {
      title: 'Ne morete se naročiti na {{selectedProduct}} Premium',
      description:
        'Il tuo ente non ha aderito ad <strong>{{selectedProduct}}</strong>, o non hai un ruolo per <3/>gestire il prodotto. <5/> Chiedi ad un Amministratore di <1/>aggiungerti nella sezione <7/>Utenti, oppure richiedi l’adesione ad <strong>{{selectedProduct}}</strong> per il tuo ente.',
      backHomeLabelBtn: 'Vrni se domov',
      goToBtnLabel: 'Pojdite na članstvo',
    },
    selectUserPartyStep: {
      title: 'Izberite svojo organizacijo',
      subTitle:
        "Izberite organizacijo, za katero zahtevate naročnino na <1 />ponudbo <3>Premium</3>",
      searchLabel: 'Poiščite organizacijo',
      notFoundResults: 'Brez rezultatov',
      IPAsubTitle:
        "Iz indeksa javne uprave (IPA) izberite organizacijo <1/>, za katero želite zahtevati članstvo v {{baseProduct}} Premium",
      helperLink: 'Ne najdete svoje organizacije? <1>Ugotovite zakaj</1>',
      confirmButton: 'Nadaljuj',
    },
    genericError: {
      title: 'Nekaj ​​je šlo narobe',
      subTitle:
        'A causa di un errore del sistema non è possibile completare<0 /> la procedura. Ti chiediamo di riprovare più tardi.',
      homeButton: 'Vrni se domov',
    },
    successfulAdhesion: {
      title: 'Zahteva za članstvo je bila <1/>uspešno poslana',
      message:
        "Na overjen naslov organizacije boste prejeli potrjeno e-poštno sporočilo, <1 />kjer boste našli navodila za <3 /> dokončanje naročnine na ponudbo <strong>Premium</strong>.",
      closeButton: 'Zapri',
    },
    billingData: {
      subTitle: `Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti.<1 /> Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`,
    },
    exitModal: {
      title: 'Ali se res želite odjaviti?',
      message: 'Če se odjavite, bo vaša zahteva za članstvo izgubljena.',
      backButton: 'Izhod',
      cancelButton: 'Prekliči',
    },
    loading: {
      loadingText: 'Preverjamo vaše podatke',
    },
  },
  invalidPricingPlan: {
    title: 'Nekaj ​​je šlo narobe',
    description:
      'Non riusciamo a trovare la pagina che stai cercando. <1 />Assicurati che l’indirizzo sia corretto o torna alla home.',
    backButton: 'Vrni se domov',
  },
  stepInstitutionType: {
    title: 'Izberite vrsto organizacije, ki jo <1/> predstavljate',
    subtitle: 'Označuje vrsto organizacije, ki se bo pridružila <1>{{productName}}</1>',
    institutionTypes: {
      pa: {
        title: 'Javna uprava',
        description: 'člen 2, odstavek 2, črka A CAD',
      },
      gsp: {
        title: 'Vodja javne službe',
        description: 'člen 2, odstavek 2, črka B CAD',
      },
      scp: {
        title: 'Družba pod javnim nadzorom',
        description: 'člen 2, odstavek 2, črka C CAD',
      },
      pt: {
        title: 'Tehnološki partner',
        description:
          'Ai sensi di IO - Paragrafo 6.1.3 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” emanate da AgID ai sensi dell’art- 64-bis del CAD',
      },
      psp: {
        title: 'Ponudniki plačilnih storitev',
      },
      sa: {
        title: 'Zasebni upravitelj platforme za e-javna naročila',
      },
      as: {
        title: 'Zavarovalnica',
      },
      prv: {
        title: 'Zasebni'
      },
      oth: {
        title: 'Drugo',
        description: 'Organizacije upnice, ki sodelujejo neobvezno'
      }
    },
    backLabel: 'Nazaj',
    confirmLabel: 'Nadaljuj',
  },
  onboardingFormData: {
    title: 'Vnesite podatke o organizaciji',
    pspAndProdPagoPATitle: 'Vnesite podatke',
    backLabel: 'Nazaj',
    confirmLabel: 'Nadaljuj',
    closeBtnLabel: 'Zapri',
    billingDataPt: {
      title: 'Vnesite podatke',
      subTitle:
        'Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3 /> prodotto <5>{{nameProduct}}</5>.',
    },
    billingDataSection: {
      invalidFiscalCode: 'Davčna številka je neveljavna',
      invalidTaxCodeInvoicing: 'Vnesena davčna številka ni povezana z vašo organizacijo',
      invalidZipCode: 'Poštna številka je neveljavna',
      invalidVatNumber: 'Številka za DDV ni veljavna',
      invalidEmail: 'E-poštni naslov je neveljaven',
      invalidReaField: 'Polje REA ni veljavno',
      invalidMailSupport: 'E-poštni naslov je neveljaven',
      invalidShareCapitalField: 'Polje delniškega kapitala je neveljavno',
      invalidRecipientCodeNoAssociation: 'Vnesena koda ni povezana z vašo organizacijo',
      invalidRecipientCodeNoBilling:
        'Il codice inserito è associato al codice fiscale di un ente che non ha il servizio di fatturazione attivo',
      vatNumberAlreadyRegistered: 'Številka za DDV, ki ste jo vnesli, je že registrirana.',
      vatNumberVerificationErrorTitle: 'Preverjanje je bilo neuspešno',
      vatNumberVerificationErrorDescription:
        'Non è stato possibile verificare la P.IVA al momento. Riprova più tardi.',
      centralPartyLabel: 'Osrednja organizacija',
      businessName: 'Naziv podjetja',
      aooName: 'Naziv AOO',
      uoName: 'Naziv UO',
      aooUniqueCode: 'Edinstvena koda AOO',
      uoUniqueCode: 'Edinstvena koda UO',
      fullLegalAddress: 'Naslov in številka sedeža',
      zipCode: 'Poštna številka',
      city: 'Mesto',
      noResult: 'Brez rezultatov',
      county: 'Pokrajina',
      country: 'Narod',
      digitalAddress: 'Naslov PEC',
      taxCodeEquals2PIVAdescription: 'Številka za DDV sovpada z davčno številko',
      partyWithoutVatNumber: 'Moja organizacija nima številke za DDV',
      partyWIthoutVatNumberSubtitle: `Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,
      arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)`,
      vatNumberGroup: 'Številka za DDV temelji na skupini',
      taxCode: 'Davčna številka',
      taxCodeCentralParty: 'Davčna številka osrednje organizacije',
      vatNumber: 'Številka za DDV',
      taxCodeInvoicing: 'Davčna številka SFE',
      originId: 'Koda IVASS',
      sdiCode: 'Koda SDI',
      sdiCodePaAooUo: 'Edinstvena koda ali SDI',
      sdiCodePaAooUoDescription:
        'È il codice univoco necessario per ricevere le fatture elettroniche. Può essere del tuo ente o della sua Unità Organizzativa di riferimento.',
      recipientCodeDescription: 'To je koda, ki je potrebna za prejemanje elektronskih računov',
      gspDescription: 'Sem vodja vsaj ene od javnih služb: Plin, energija, telefonija.',
      pspDataSection: {
        commercialRegisterNumber: 'št. vpisa v poslovni register',
        invalidCommercialRegisterNumber: 'Št. vpisa v poslovni register je neveljaven',
        registrationInRegister: 'Register',
        registerNumber: 'Številka v registru',
        invalidregisterNumber: 'Številka v registru je neveljavna',
        abiCode: 'Koda ABI',
        invalidabiCode: 'Koda ABI je neveljavna',
      },
      informationCompanies: {
        commercialRegisterNumber: 'Kraj vpisa v poslovni register (neobvezno)',
        requiredRea: 'REA',
        rea: 'REA (neobvezno)',
        shareCapital: 'Delniški kapital (neobvezno)',
        requiredCommercialRegisterNumber: 'Kraj vpisa v poslovni register',
        requiredShareCapital: 'Delniški kapital',
      },
      assistanceContact: {
        supportEmail: 'E-poštni naslov, viden državljanom',
        supportEmailOptional: 'E-poštni naslov, viden državljanom (neobvezno)',
        supportEmailDescriprion:
          'È il contatto che i cittadini visualizzano per richiedere assistenza all’ente',
      },
    },
    taxonomySection: {
      title: 'OZNAČUJE GEOGRAFSKO OBMOČJE',
      nationalLabel: 'Nacionalno',
      localLabel: 'Lokalno',
      infoLabel:
        'Seleziona il territorio in cui opera il tuo ente. Se locale, puoi scegliere una o più aree di competenza. Se l’ente ha già aderito ad altri prodotti PagoPA, troverai l’area già impostata.',
      localSection: {
        addButtonLabel: 'Dodajte območje',
        inputLabel: 'Občina, pokrajina ali regija',
      },
      error: {
        notMatchedArea: 'Izberite lokacijo s seznama',
      },
      modal: {
        addModal: {
          title: 'Svoji ustanovi dodajate več območij',
          description: `Le aree geografiche verrano aggiunte a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?`,
          confirmButton: 'Nadaljuj',
          backButton: 'Nazaj',
        },
        modifyModal: {
          title: 'Spreminjate geografsko območje svoje organizacije',
          description:
            'La modifica verrà applicata a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?',
          confirmButton: 'Nadaljuj',
          backButton: 'Nazaj',
        },
      },
    },
    dpoDataSection: {
      dpoTitle: 'KONTAKTI POOBLAČENE OSEBE ZA VARSTVO PODATKOV',
      dpoAddress: 'Naslov',
      dpoPecAddress: 'Naslov PEC',
      dpoEmailAddress: 'Elektronski naslov',
    },
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Zahteva za članstvo je izbrisana',
        description:
          'Nella home dell’Area Riservata puoi vedere i prodotti<1 />disponibili e richiedere l’adesione per il tuo ente.',
        backActionLabel: 'Vrni se domov',
      },
      error: {
        title: 'Nekaj ​​je šlo narobe.',
        description:
          'A causa di un errore del sistema non è possibile completare la procedura. <1 /> Ti chiediamo di riprovare più tardi.',
        backActionLabel: 'Vrni se domov',
      },
      verify: {
        loadingText: 'Preverjamo vaše podatke',
      },
      delete: {
        loadingText: 'Preklicujemo vaše članstvo',
      },
      jwtNotValid: {
        title: 'Zahteva za članstvo ni več <1 /> veljavna',
        subtitle: 'Ta zahteva je bila odobrena, preklicana ali je potekla.',
        backActionLabel: 'Vrni se domov',
      },
    },
    confirmCancellatione: {
      title: 'Ali želite izbrisati zahtevo za <1 /> članstvo?',
      subtitle: 'Če ga izbrišete, bodo vsi vneseni podatki izgubljeni. ',
      confirmActionLabel: 'Izbrišite zahtevo',
      backActionLabel: 'Vrni se domov',
    },
  },
  app: {
    sessionModal: {
      title: 'Seja je potekla',
      message: 'Preusmerjeni boste na stran za prijavo ...',
    },
  },
};
