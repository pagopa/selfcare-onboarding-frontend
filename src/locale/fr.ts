export default {
  asyncAutocomplete: {
    noResultsLabel: 'Aucun résultat',
    lessThen3CharacterLabel: 'Saisir au moins 3 caractères',
    lessThen11CharacterLabel: 'Saisir au moins 11 caractères',
    searchLabel: 'Chercher un organisme',
    aooLabel: 'Entrer le code unique AOO',
    uoLabel: 'Entrer le code unique UO',
    ariaLabel: `Seleziona la tipologia di ricerca dell'ente`,
    businessName: 'Raison sociale',
    taxcode: 'Code Fiscal organisme',
    originId: 'Code IVASS',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Recherche par',
    businessName: 'Raison sociale',
    ivassCode: 'Code IVASS',
    taxCode: 'Code Fiscal organisme',
    aooCode: 'Code unique AOO',
    uoCode: 'Code unique UO',
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Télécharger l’accord d’adhésion',
          description: `Per completare l’adesione, scarica l’accordo e fai apporre la firma digitale in <1 /><2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Télécharger l’accord',
        },
        user: {
          title: 'Télécharger le Formulaire d’intégration',
          description: `Per completare l’adesione, scarica il Modulo di aggiunta e fai apporre la <1 />firma digitale in <2>formato p7m</2> dal Legale Rappresentante dell’ente.`,
          downloadContract: 'Télécharger le Formulaire',
        },
        disclaimer:
          'Firmando l’accordo, il Legale Rappresentante dell’ente, accetta espressamente e specificamente anche le singole clausole indicate nel paragrafo “Clausole ai sensi degli artt. 1341 e 1342 c.c.”',
      },
      upload: {
        product: {
          title: 'Télécharger l’accord signé',
          description: `Una volta firmato l’accordo, segui le istruzioni per inviarlo e completare <1 /> l’adesione al prodotto scelto. Ricorda di caricare l’accordo <3>entro 30 giorni.</3>`,
        },
        user: {
          title: 'Télécharger le Formulaire signé',
          description: `Una volta firmato il Modulo, segui le istruzioni per inviarlo e completare <1 /> l’aggiunta di uno o più Amministratori.`,
        },
        goToUpload: 'Aller au téléchargement',
      },
    },
    upload: {
      product: {
        title: "Télécharger l’accord d’adhésion",
        description: `Carica l’accordo di adesione, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Glisser/Déposer ici l’accord d’adhésion signé ou bien',
          link: 'Charger un document',
        },
      },
      user: {
        title: 'Télécharger le formulaire',
        description: `Carica il Modulo di aggiunta, firmato digitalmente in <1 />p7m dal Legale Rappresentante.`,
        dropArea: {
          title: 'Glisser/Déposer ici le formulaire signé ou bien',
          link: 'Charger un document',
        },
        continue: 'Continuer',
      },
      continue: 'Continuer',
      error: {
        title: 'Échec du téléchargement',
        description:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
        close: 'Sortir',
        retry: 'Télécharger à nouveau',
      },
    },
  },
  fileUploadPreview: {
    loadingStatus: 'Téléchargement...',
    labelStatus: 'Prêt à envoyer',
  },
  inlineSupportLink: {
    assistanceLink: "contacter l’assistance",
  },
  moreInformationOnRoles: 'Plus d’informations sur les rôles',
  onboardingStep0: {
    title: 'Bienvenue sur le portail Self-care',
    description: 'En quelques étapes, votre Organisme pourra adhérer et gérer tous les produits PagoPA.',
    privacyPolicyDescription: 'J’ai lu et compris',
    privacyPolicyLink: 'la Charte de confidentialité et les Conditions d’utilisation du service',
    actionLabel: 'Continuer',
  },
  stepVerifyOnboarding: {
    loadingText: 'Nous vérifions vos données',
    ptAlreadyOnboarded: {
      title: 'Le Partenaire est déjà enregistré',
      description:
        'Per operare su un prodotto, chiedi a un Amministratore di <1/> aggiungerti nella sezione Utenti.',
      backAction: 'Fermer',
    },
    alreadyOnboarded: {
      title: 'L’organisme sélectionné a déjà adhéré',
      description:
        'Per operare sul prodotto, chiedi a un Amministratore di <1/>aggiungerti nella sezione Utenti.',
      addNewAdmin:
        'Gli attuali Amministratori non sono più disponibili e hai l’esigenza <1 />di gestire i prodotti? <3>Aggiungi un nuovo Amministratore</3>',
      backHome: 'Retour à la page d’accueil',
    },
    genericError: {
      title: 'Une erreur s’est produite',
      description: `A causa di un errore del sistema non è possibile completare <br />la procedura. Ti chiediamo di riprovare più tardi.`,
      backHome: 'Retour à la page d’accueil',
    },
    userNotAllowedError: {
      title: 'Vous ne pouvez pas adhérer à ce produit',
      description: `Al momento, l'ente <1>{{partyName}}</1> non può aderire a <3>{{productTitle}}</3>. <5 /> Per maggiori dettagli contatta <7>l'assistenza</7>.`,
      noSelectedParty: 'indiqué',
      backToHome: 'Retour à la page d’accueil',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'Nous vérifions vos données',
    onboarding: {
      bodyTitle: 'Cherchez votre organisme',
      codyTitleSelected: 'Confirmer l’organisme sélectionné',
      disclaimer: {
        description: `Al momento possono aderire a SEND tramite Area Riservata solo le <1>Pubbliche <3 /> Amministrazioni Locali </1> presenti su IPA che trovi a <5>questo link</5>.`,
      },
      bodyDescription:
        'Inserisci uno dei dati richiesti e cerca dall’Indice della Pubblica <1/> Amministrazione (IPA) l’ente per cui vuoi richiedere l’adesione a <3/><4>{{productTitle}}</4>.',
      aggregator: 'Je suis un organisme agrégateur',
      aggregatorModal: {
        title: 'Organisme agrégateur',
        message: `Stai richiedendo l’adesione come ente aggregatore per <1>{{partyName}}</1>.<3 />Per completare l’adesione, dovrai indicare gli enti da aggregare.`,
        back: 'Retour',
        forward: 'Continuer',
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
        placeholder: 'Chercher',
      },
      onboardingStepActions: {
        confirmAction: 'Continuer',
        backAction: 'Retour',
      },
    },
  },
  stepUploadAggregates: {
    title: `Indica i soggetti aggregati per {{productName}}`,
    subTitle:
      'Scarica il file di esempio, compilalo seguendo le indicazioni e carica il documento per aggiungere/dichiarare gli enti da aggregare.',
    findOutMore: 'Des doutes ? Aller au manuel',
    errors: {
      onCsv: {
        title: 'Le fichier contient une ou plusieurs erreurs',
        description:
          '<1>Scarica il report</1> per verificare le informazioni e carica di nuovo il file.',
      },
      invalidFormat: {
        title: 'Le format du fichier n’est pas valide',
        description: 'Il est possible de télécharger uniquement des fichiers au format .csv',
      },
    },
    dropArea: {
      title: "Glisser/Déposer ici le fichier .cvs avec la liste des organismes agrégateurs ou bien",
      button: 'Charger un document',
    },
    downloadExampleCsv: 'Vous ne savez pas comment préparer le fichier ? <1>Téléchargez l’exemple</1>',
    back: 'Retour',
    forward: 'Continuer',
  },
  stepAddManager: {
    title: 'Indiquer le Représentant Légal',
    subTitle: {
      flow: {
        base: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> Sarà responsabile della firma del contratto per <3>{{productTitle}}</3> <4/> e avrà il ruolo di Amministratore per questo prodotto nell'Area Riservata.`,
        premium: `Inserisci i dati del Legale Rappresentante del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.`,
        addNewUser: `La persona indicata firmerà il Modulo di aggiunta per il nuovo Amministratore e lo <1 />autorizzerà ad operare sul prodotto <3>{{productTitle}}</3> per il tuo ente.`,
      },
    },
    changedManager: {
      title: 'Vous ajoutez un Représentant Légal',
      message:
        'I dati del Legale Rappresentante inseriti sono diversi da quelli indicati in <1 />precedenza. Vuoi continuare?',
    },
    back: 'Retour',
    continue: 'Continuer',
  },
  stepAddDelegates: {
    title: "Indiquer l’Administrateur",
    description: {
      flow: {
        onboarding: `Puoi aggiungere da uno a tre Amministratori o suoi delegati. <1/> Saranno i responsabili della gestione di <3>{{productTitle}}</3> e presenti nel contratto di <4 />adesione come delegati dal Legale Rappresentante.`,
        pt: 'Vous pouvez ajouter de un à trois Administrateurs ou ses délégués.<1/> Ils gèreront les utilisateurs et les produits au nom des organismes.',
        addNewUser: `Puoi aggiungere un Amministratore o un suo delegato. Puoi inserire anche la persona che <1 />hai già indicato come Legale Rappresentante. Se aggiungi una persona già presente con un <3 />ruolo diverso per questo prodotto, verrà inserita come Amministratore.`,
      },
    },
    addUserLabel: 'AJOUTER UN AUTRE ADMINISTRATEUR',
    addUserLink: 'Ajouter un autre Administrateur',
    backLabel: 'Retour',
    confirmLabel: 'Continuer',
    formControl: {
      label: 'M’ajouter en tant qu’Administrateur',
    },
  },
  additionalDataPage: {
    title: 'Saisir d’autres détails',
    subTitle:
      'Scegli l’opzione che descrive il tuo ente. Se nessuna è appropriata, seleziona “Altro” e <1 /> inserisci maggiori dettagli.',
    formQuestions: {
      textFields: {
        labels: {
          note: 'Notes',
          ipa: 'Entrer le code IPA de référence',
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'Vous n’avez saisi aucune note',
          fromBelongsRegulatedMarket: 'Vous n’avez saisi aucune note',
          isFromIPA: 'Entrer le code IPA de référence',
          isConcessionaireOfPublicService: 'Vous n’avez saisi aucune note',
          optionalPartyInformations: 'Champ obligatoire',
        },
      },
      estabilishedRegulatoryProvision:
        'L’ente è una società costituita ex lege da un provvedimento normativo',
      belongsRegulatedMarket:
        'L’ente appartiene ad un mercato regolamentato (es. energia, gas, acqua, <1 />trasporti, servizi postali ecc…)',
      registratedOnIPA: 'L’organisme est enregistré sur IPA',
      concessionaireOfPublicService: 'L’organisme est concessionnaire d’un service public',
      other: 'Autres',
      optionalPartyInformations: 'Écrivez ici les informations sur votre organisme',
    },
    options: {
      yes: 'Oui',
      no: 'Non',
    },
    addNote: 'Ajouter une note',
    allowedCharacters: '300 caractères maximum',
  },
  addUser: {
    title: `Aggiungi un nuovo <1 /> Amministratore`,
    subTitle: `Indica per quale prodotto vuoi aggiungere un nuovo<1 />Amministratore`,
    stepSelectProduct: {
      title: 'SÉLECTIONNER LE PRODUIT',
    },
  },
  platformUserForm: {
    helperText: 'Le Champ est invalide',
    fields: {
      name: {
        label: 'Prénom',
        errors: {
          conflict: 'Nom incorrect ou différent par rapport au Code Fiscal',
        },
      },
      surname: {
        label: 'Nom de famille',
        errors: {
          conflict: 'Nom de famille incorrect ou différent par rapport au Code Fiscal',
        },
      },
      taxCode: {
        label: 'Code Fiscal',
        errors: {
          invalid: 'Le Code Fiscal saisi est invalide',
          duplicate: 'Le code fiscal saisi existe déjà',
        },
      },
      email: {
        label: 'E-mail institutionnel',
        errors: {
          invalid: "L’adresse mail est invalide",
          duplicate: "L’adresse mail saisie existe déjà",
        },
        description: 'Saisir l’adresse e-mail institutionnelle utilisée pour l’organisme',
      },
    },
  },
  completeRegistration: {
    sessionModal: {
      onConfirmLabel: 'Télécharger à nouveau',
      onCloseLabel: 'Sortir',
    },
    steps: {
      step0: {
        label: "Télécharger l’Accord d’Adhésion",
      },
      step1: {
        label: "Télécharger l’Accord d’Adhésion",
      },
    },
    request: {
      notFound: {
        title: 'La page que vous cherchiez n’est pas disponible',
        description:
          'Al momento non è possibile procedere. Riprova tra qualche <1 />minuto, o contatta l’assistenza',
        contactAssistanceButton: 'Contacter l’assistance',
      },
      expired: {
        product: {
          title: 'La demande d’adhésion a expiré',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di adesione. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'La demande a expiré',
          description: `Sono trascorsi oltre 30 giorni dalla richiesta di aggiunta di <2 />un Amministratore. Per procedere, invia una nuova <2 /> richiesta.`,
        },
        backHome: 'Retour à la page d’accueil',
      },
      alreadyCompleted: {
        product: {
          title: 'La demande d’adhésion a été acceptée',
        },
        user: {
          title: 'La demande a déjà été acceptée',
        },
        description: `Per gestire il prodotto, accedi tramite SPID o CIE`,
        logIn: 'Se connecter',
      },
      alreadyRejected: {
        product: {
          title: 'La demande d’adhésion a été annulée',
          description: `La richiesta di adesione non è andata a buon fine. Se <2 />desideri ancora aderire al prodotto {{productTitle}}, invia <4 />una nuova richiesta.`,
        },
        user: {
          title: 'La demande n’est plus valide',
          description: `Il tuo ente ha annullato la richiesta. Per aggiungere un <2 />nuovo Amministratore, inviane una nuova.`,
        },
        backHome: 'Retour à la page d’accueil',
      },
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Adhésion complétée !',
          description: `Comunicheremo l'avvenuta adesione all'indirizzo PEC <1/> primario dell'ente. Da questo momento è possibile <3 />accedere all'Area Riservata.`,
        },
        user: {
          title: 'Demande complétée',
          description: `Da questo momento gli Amministratori indicati possono <1 />accedere all’Area Riservata.`,
        },
        backHome: 'Retour à la page d’accueil',
      },
      error: {
        title: 'Échec du téléchargement',
        description: 'Le téléchargement du document n’a pas abouti.',
        backToUpload: 'Télécharger à nouveau',
      },
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Contrôler le document',
        product: {
          message:
            "Le document téléchargé ne correspond pas à l’Acte d’Adhésion. Vérifiez qu’il est bien correct et téléchargez-le à nouveau.",
        },
        user: {
          message:
            'Il documento caricato non corrisponde al modulo che hai ricevuto via email. Verifica che sia corretto e caricalo di nuovo.',
        },
      },
      INVALID_SIGN: {
        title: 'Contrôler le document',
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
        title: 'Échec du téléchargement',
        message:
          'Il caricamento del documento non è andato a buon fine. Torna indietro e caricalo di nuovo.',
      },
      INVALID_SIGN_FORMAT: {
        title: 'Échec du téléchargement',
        message:
          'Il caricamento del documento non è andato a buon fine. <1 />Carica un solo file in formato <3>p7m</3>.',
      },
    },
  },
  noProductPage: {
    title: 'Désolé, un problème est survenu.',
    description: 'Impossible de trouver le produit souhaité',
  },
  onboarding: {
    success: {
      flow: {
        product: {
          title: 'Demande d’adhésion envoyée',
          publicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
          notPublicAdministration: {
            description: `Invieremo un’email all’indirizzo PEC indicato. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’adesione.`,
          },
        },
        techPartner: {
          title: 'Demande d’enregistrement envoyée',
          description: `Invieremo un’email con l’esito della richiesta all’indirizzo <1 />PEC indicato.`,
        },
        user: {
          title: 'Vous avez envoyé la demande',
          description: `Invieremo un’email all’indirizzo PEC primario dell’ente. <1 /> Al suo interno, ci sono le istruzioni per completare <3 />l’operazione.`,
        },
      },
    },
    error: {
      title: 'Un problème est survenu.',
      description: `A causa di un errore del sistema non è possibile completare <1 />la procedura. Ti chiediamo di riprovare più tardi.`,
    },
    backHome: 'Retour à la page d’accueil',
    sessionModal: {
      title: 'Voulez-vous vraiment sortir ?',
      message: 'Si vous sortez, votre demande d’adhésion sera perdue.',
      onConfirmLabel: 'Sortir',
      onCloseLabel: 'Annuler',
    },
    confirmationModal: {
      title: 'Confirmer la demande d’envoi ?',
      description: {
        flow: {
          base: 'Vous envoyez une demande d’adhésion au produit <1>{{productName}}</1> pour l’organisme <3>{{institutionName}}</3>. <5 /> L’accord d’adhésion arrivera à la PEC institutionnelle de l’organisme et devra être signé par le Représentant Légal. Assurez-vous d’être autorisé en tant qu’employé à faire cette demande.',
          addNewUser: `Stai aggiungendo un nuovo Amministratore per l’ente <1>{{institutionName}}</1>. <3 />L’ente riceverà un modulo alla PEC istituzionale e dovrà essere firmato dal Legale Rappresentante che hai indicato. <3 />Assicurati di essere autorizzato dall’ente a effettuare questa richiesta.`,
        },
      },
      confirm: 'Confirmer',
      back: 'Retour',
    },
    loading: {
      loadingText: 'Nous vérifions vos données',
    },
    phaseOutError: {
      title: 'Une erreur s’est produite',
      description:
        'Non puoi aderire al prodotto scelto poiché a breve non sarà <1 /> più disponibile.',
      backAction: 'Retour à la page d’accueil',
    },
  },
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Déjà souscrit',
      message:
        "L’organisme que vous avez sélectionné a déjà souscrit à l’offre <1 /><strong>Premium</strong>.",
      closeButton: 'Fermer',
    },
    subProductStepSelectPricingPlan: {
      discountLabelData: '25 % de réduction jusqu’au 30 juin 2023 ',
      title: 'Passez à IO Premium et améliorez les <1/> performances des messages',
      firstCheckLabel: 'Réduisez les temps d’encaissement',
      secondCheckLabel: 'Améliorez les performances de recouvrement',
      thirdCheckLabel: 'Réduisez les créances impayées',
      infoSectionLabel: `Se il tuo ente ha già aderito ad IO, scegli qual è il piano che più soddisfa le sue esigenze. <1/> Il piano a carnet è attivabile una sola volta. Una volta terminato il numero di messaggi del piano a  <3/> carnet, si attiverà automaticamente il piano a consumo. `,
      btnRejectLabel: 'Je ne suis pas intéressé',
      pricingPlanExitModal: {
        title: 'Souhaitez-vous renoncer aux offres Premium ?',
        subtitle: 'Si vous sortez, vous accéderez à l’Espace Réservé.',
        closeBtnLabel: 'Sortir',
        confirmBtnLabel: 'Revenir aux offres Premium',
      },
      headerPlanCard: {
        from: 'De',
        to: 'à',
        beyond: 'Au-delà',
        mess: '/ mess',
      },
      carnetPlan: {
        caption: 'PLAN À CARNETS - UNIQUE',
        discountBoxLabel: '25 % de réduction',
        title: 'Choisissez parmi les {{carnetCount}} différents carnets conçus pour répondre à tous vos besoins',
        showMore: 'En savoir plus',
        showLess: 'Voir moins',
        description:
          'Una volta selezionato il carnet non potrà essere modificato per via della sottoscrizione del contratto.',
        carnetLabelsDiscount: {
          c1: 'Économisez 55 €',
          c2: 'Économisez 543,75 €',
          c3: 'Économisez 2 687,50 €',
          c4: 'Économisez 5 312,50 €',
          c5: 'Économisez 13 125 €',
          c6: 'Économisez 25 625 €',
          c7: 'Économisez 50 000 €',
        },
        btnActionLabel: 'Activer le plan',
      },
      consumptionPlan: {
        caption: 'PLAN À LA CONSOMMATION',
        discountBoxLabel: '25 % de réduction',
        title: 'Choisissez de ne payer que pour les messages <1/> que vous envoyez.',
        showMore: 'En savoir plus',
        showLess: 'Voir moins',
        description:
          'Attivando il piano a consumo, non sarà più possibile attivare il piano carnet.',
        rangeLabelsDiscount: '25 % de réduction',
        btnActionLabel: 'Activer le plan',
      },
    },
    subProductStepUserUnrelated: {
      title: 'Vous ne pouvez pas adhérer à {{selectedProduct}} Premium',
      description:
        'Il tuo ente non ha aderito ad <strong>{{selectedProduct}}</strong>, o non hai un ruolo per <3/>gestire il prodotto. <5/> Chiedi ad un Amministratore di <1/>aggiungerti nella sezione <7/>Utenti, oppure richiedi l’adesione ad <strong>{{selectedProduct}}</strong> per il tuo ente.',
      backHomeLabelBtn: 'Retour à la page d’accueil',
      goToBtnLabel: 'Aller à l’adhésion',
    },
    selectUserPartyStep: {
      title: 'Sélectionnez votre organisme',
      subTitle:
        "Sélectionnez l’organisme pour lequel vous demandez à souscrire <1 />à l’offre <3>Premium</3>",
      searchLabel: 'Chercher un organisme',
      notFoundResults: 'Aucun résultat',
      IPAsubTitle:
        "Sélectionnez sur l’Indice de l’Administration Publique (IAP/IPA) l’organisme <1/> pour lequel vous demandez l’adhésion à {{baseProduct}} Premium",
      helperLink: 'Vous ne trouvez pas votre organisme ? <1>Découvrez pourquoi</1>',
      confirmButton: 'Continuer',
    },
    genericError: {
      title: 'Une erreur s’est produite',
      subTitle:
        'A causa di un errore del sistema non è possibile completare<0 /> la procedura. Ti chiediamo di riprovare più tardi.',
      homeButton: 'Retour à la page d’accueil',
    },
    successfulAdhesion: {
      title: 'La demande d’adhésion a été <1/>correctement envoyée',
      message:
        "Vous recevrez une PEC à l’adresse institutionnelle de l’organisme.<1 />Vous y trouverez les instructions pour compléter la <3 /> souscription à l’offre <strong>Premium</strong>.",
      closeButton: 'Fermer',
    },
    billingData: {
      subTitle: `Conferma, modifica o inserisci i dati richiesti, assicurandoti che siano corretti.<1 /> Verranno usati anche per richiedere l’adesione ad altri prodotti e in caso di fatturazione.`,
    },
    exitModal: {
      title: 'Voulez-vous vraiment sortir ?',
      message: 'Si vous sortez, votre demande d’adhésion sera perdue.',
      backButton: 'Sortir',
      cancelButton: 'Annuler',
    },
    loading: {
      loadingText: 'Nous vérifions vos données',
    },
  },
  invalidPricingPlan: {
    title: 'Une erreur s’est produite',
    description:
      'Non riusciamo a trovare la pagina che stai cercando. <1 />Assicurati che l’indirizzo sia corretto o torna alla home.',
    backButton: 'Retour à la page d’accueil',
  },
  stepInstitutionType: {
    title: 'Sélectionnez le type d’organisme que vous <1/> représentez',
    subtitle: 'Indiquez le type d’organisme qui adhérera à <1>{{productName}}</1>',
    institutionTypes: {
      pa: {
        title: 'Administration Publique',
        description: 'art. 2, alinéa 2, lettre A du CAD',
      },
      gsp: {
        title: 'Opérateur de services publics',
        description: 'art. 2, alinéa 2, lettre B du CAD',
      },
      scp: {
        title: 'Société à contrôle public',
        description: 'art. 2, alinéa 2, lettre C du CAD',
      },
      pt: {
        title: 'Partenaire technologique',
        description:
          'Ai sensi di IO - Paragrafo 6.1.3 delle “Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione” emanate da AgID ai sensi dell’art- 64-bis del CAD',
      },
      psp: {
        title: 'Fournisseur de Services de Paiement',
      },
      sa: {
        title: 'Opérateur privé de plateforme e-procurement',
      },
      as: {
        title: 'Compagnie d’assurance',
      },
      prv: {
        title: 'Privés'
      },
      oth: {
        title: 'Autres',
        description: 'Organismes créanciers adhérents à titre facultatif'
      }
    },
    backLabel: 'Retour',
    confirmLabel: 'Continuer',
  },
  onboardingFormData: {
    title: 'Saisir les données de l’organisme',
    pspAndProdPagoPATitle: 'Saisissez vos données',
    backLabel: 'Retour',
    confirmLabel: 'Continuer',
    closeBtnLabel: 'Fermer',
    billingDataPt: {
      title: 'Saisissez vos données',
      subTitle:
        'Inserisci le informazioni richieste e assicurati che siano corrette.<1 /> Serviranno a registrarti come Partner tecnologico per il<3 /> prodotto <5>{{nameProduct}}</5>.',
    },
    billingDataSection: {
      invalidFiscalCode: 'Le Code Fiscal est invalide',
      invalidTaxCodeInvoicing: 'Le Code Fiscal saisi ne correspond pas à votre organisme',
      invalidZipCode: 'Le CP est invalide',
      invalidVatNumber: 'Le N° de TVA est invalide',
      invalidEmail: 'L’adresse mail est invalide',
      invalidReaField: 'Le Champ REA est invalide',
      invalidMailSupport: 'L’adresse mail est invalide',
      invalidShareCapitalField: 'Le champ capital social est invalide',
      invalidRecipientCodeNoAssociation: 'Le code saisi n’est pas associé à votre organisme',
      invalidRecipientCodeNoBilling:
        'Il codice inserito è associato al codice fiscale di un ente che non ha il servizio di fatturazione attivo',
      vatNumberAlreadyRegistered: 'Le N° de TVA que vous avez saisi a déjà été enregistré.',
      vatNumberVerificationErrorTitle: 'Le contrôle n’a pas abouti',
      vatNumberVerificationErrorDescription:
        'Non è stato possibile verificare la P.IVA al momento. Riprova più tardi.',
      centralPartyLabel: 'Organisme central',
      businessName: 'Raison sociale',
      aooName: 'Dénomination AOO',
      uoName: 'Dénomination UO',
      aooUniqueCode: 'Code Unique AOO',
      uoUniqueCode: 'Code Unique UO',
      fullLegalAddress: 'Adresse et numéro du siège social',
      zipCode: 'CP',
      city: 'Ville',
      noResult: 'Aucun résultat',
      county: 'Province',
      country: 'Nation',
      digitalAddress: 'Adresse PEC',
      taxCodeEquals2PIVAdescription: 'Le N° de TVA correspond au Code Fiscal',
      partyWithoutVatNumber: 'Mon organisme n’a pas de numéro de TVA',
      partyWIthoutVatNumberSubtitle: `Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,
      arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)`,
      vatNumberGroup: 'Le numéro de TVA est un numéro de groupe',
      taxCode: 'Code Fiscal',
      taxCodeCentralParty: 'Code Fiscal organisme central',
      vatNumber: 'N° de TVA',
      taxCodeInvoicing: 'Code Fiscal SFE',
      originId: 'Code IVASS',
      sdiCode: 'Code SDI',
      sdiCodePaAooUo: 'Code unique ou SDI',
      sdiCodePaAooUoDescription:
        'È il codice univoco necessario per ricevere le fatture elettroniche. Può essere del tuo ente o della sua Unità Organizzativa di riferimento.',
      recipientCodeDescription: 'Il s’agit du code nécessaire pour recevoir les factures électroniques',
      gspDescription: 'Je suis opérateur d’au moins un des services publics : Gaz, Énergie, Telco.',
      pspDataSection: {
        commercialRegisterNumber: 'n° Inscription au Registre du Commerce',
        invalidCommercialRegisterNumber: 'Le n° d’Inscription au Registre du Commerce n’est pas valide',
        registrationInRegister: 'Inscription au Registre',
        registerNumber: 'Numéro du Registre',
        invalidregisterNumber: 'Le Numéro du Registre est invalide',
        abiCode: 'Code ABI',
        invalidabiCode: 'Le Code ABI est invalide',
      },
      informationCompanies: {
        commercialRegisterNumber: 'Lieu d’inscription au Registre du Commerce (facultatif)',
        requiredRea: 'REA',
        rea: 'REA (facultatif)',
        shareCapital: 'Capital social (facultatif)',
        requiredCommercialRegisterNumber: 'Lieu d’inscription au Registre du Commerce',
        requiredShareCapital: 'Capital social',
      },
      assistanceContact: {
        supportEmail: 'Adresse électronique visible par les citoyens',
        supportEmailOptional: 'Adresse électronique visible par les citoyens (facultatif)',
        supportEmailDescriprion:
          'È il contatto che i cittadini visualizzano per richiedere assistenza all’ente',
      },
    },
    taxonomySection: {
      title: 'INDIQUER LA ZONE GÉOGRAPHIQUE',
      nationalLabel: 'Nationale',
      localLabel: 'Locale',
      infoLabel:
        'Seleziona il territorio in cui opera il tuo ente. Se locale, puoi scegliere una o più aree di competenza. Se l’ente ha già aderito ad altri prodotti PagoPA, troverai l’area già impostata.',
      localSection: {
        addButtonLabel: 'Ajouter une zone',
        inputLabel: 'Commune, Province ou Région',
      },
      error: {
        notMatchedArea: 'Choisir une localité dans la liste',
      },
      modal: {
        addModal: {
          title: 'Vous ajoutez d’autres zones pour votre organisme',
          description: `Le aree geografiche verrano aggiunte a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?`,
          confirmButton: 'Continuer',
          backButton: 'Retour',
        },
        modifyModal: {
          title: 'Vous modifiez la zone géographique de votre organisme',
          description:
            'La modifica verrà applicata a tutti i prodotti PagoPA a cui l’ente ha già aderito. Vuoi continuare?',
          confirmButton: 'Continuer',
          backButton: 'Retour',
        },
      },
    },
    dpoDataSection: {
      dpoTitle: 'CONTACTS DU RESPONSABLE DE LA PROTECTION DES DONNÉES',
      dpoAddress: 'Adresse',
      dpoPecAddress: 'Adresse PEC',
      dpoEmailAddress: 'Adresse e-mail',
    },
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Demande d’adhésion éliminée',
        description:
          'Nella home dell’Area Riservata puoi vedere i prodotti<1 />disponibili e richiedere l’adesione per il tuo ente.',
        backActionLabel: 'Retour à la page d’accueil',
      },
      error: {
        title: 'Un problème est survenu.',
        description:
          'A causa di un errore del sistema non è possibile completare la procedura. <1 /> Ti chiediamo di riprovare più tardi.',
        backActionLabel: 'Retour à la page d’accueil',
      },
      verify: {
        loadingText: 'Nous vérifions vos données',
      },
      delete: {
        loadingText: 'Nous supprimons votre inscription',
      },
      jwtNotValid: {
        title: 'La demande d’adhésion n’est plus <1 /> valide',
        subtitle: 'Cette demande a été acceptée, annulée ou a expiré.',
        backActionLabel: 'Retour à la page d’accueil',
      },
    },
    confirmCancellatione: {
      title: 'Voulez-vous supprimer la demande d’<1 />adhésion ?',
      subtitle: 'Si vous la supprimez, toutes les données saisies seront perdues. ',
      confirmActionLabel: 'Supprimer la demande',
      backActionLabel: 'Retour à la page d’accueil',
    },
  },
  app: {
    sessionModal: {
      title: 'Session expirée',
      message: 'Vous allez être redirigé vers la page de connexion...',
    },
  },
};
