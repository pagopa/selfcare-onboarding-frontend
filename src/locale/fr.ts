export default {
  asyncAutocomplete: {
    noResultsLabel: 'Aucun résultat',
    lessThen3CharacterLabel: 'Saisir au moins 3 caractères',
    lessThen11CharacterLabel: 'Saisir au moins 11 caractères',
    searchLabel: 'Chercher un organisme',
    aooLabel: 'Entrer le code unique AOO',
    uoLabel: 'Entrer le code unique UO',
    ariaLabel: "Sélectionnez le type de recherche de l'organisme",
    clearIconAriaLabel: "Désélectionner l'organisme",
    businessName: 'Raison sociale',
    taxcode: 'Code Fiscal organisme',
    originId: 'Code IVASS',
    reaLabel: 'RM-123456',
    searchResultsLabel: 'Organismes trouvés'
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Recherche par',
    businessName: 'Raison sociale',
    ivassCode: 'Code IVASS',
    taxCode: 'Code Fiscal organisme',
    aooCode: 'Code unique AOO',
    uoCode: 'Code unique UO',
    reaCode: 'Code REA',
    personalTaxCode: 'Code Fiscal entreprise individuelle'
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Télécharger l’accord d’adhésion',
          description: "Une fois l'accord signé, téléchargez l'accord et demandez au Représentant Légal de l'organisme de le signer numériquement en <1 /><2>format p7m</2>.",
          downloadContract: 'Télécharger l’accord'
        },
        attachments: {
          title: "Télécharger l'addendum",
          description: "Téléchargez l'addendum et procédez à la signature numérique en <2>format p7m</2>.",
          downloadContract: 'Télécharger le document'
        },
        user: {
          title: 'Télécharger le Formulaire d’intégration',
          description: "Une fois l'accord préparé, demandez au Représentant Légal de l'organisme de télécharger le Formulaire d'intégration et de le signer numériquement en <1 /><2>format p7m</2>.",
          downloadContract: 'Télécharger le Formulaire'
        },
        disclaimerAttachments: "Vous pouvez faire signer l'accord par le Représentant Légal ou par un mandataire.",
        disclaimer: `En signant l'accord, le Représentant Légal de l'organisme accepte expressément et spécifiquement également les clauses individuelles indiquées dans le paragraphe "Clauses au sens des art. 1341 et 1342 c.c."`
      },
      upload: {
        product: {
          title: 'Télécharger l’accord signé',
          description: "Une fois l'accord signé, suivez les instructions pour l'envoyer et compléter <1 /> l'adhésion au produit choisi. N'oubliez pas de télécharger l'accord <3>dans les 30 jours.</3>"
        },
        attachments: {
          title: "Télécharger l'addendum signé",
          description: 'Une fois le document signé numériquement, téléchargez-le pour compléter la <1 />souscription.'
        },
        user: {
          title: 'Télécharger le Formulaire signé',
          description: "Une fois le Formulaire signé, suivez les instructions pour l'envoyer et compléter <1 /> l'ajout d'un ou plusieurs Administrateurs."
        },
        goToUpload: 'Aller au téléchargement'
      }
    },
    upload: {
      product: {
        title: 'Télécharger l’accord d’adhésion',
        description: "Téléchargez l'accord d'adhésion, signé numériquement en <1 />p7m par le Représentant Légal.",
        dropArea: {
          title: 'Glisser/Déposer ici l’accord d’adhésion signé ou bien',
          link: 'Charger un document'
        }
      },
      user: {
        title: 'Télécharger le formulaire',
        description: "Téléchargez le Formulaire d'intégration, signé numériquement en <1 />p7m par le Représentant Légal.",
        dropArea: {
          title: 'Glisser/Déposer ici le formulaire signé ou bien',
          link: 'Charger un document'
        },
        continue: 'Continuer'
      },
      attachments: {
        title: 'Télécharger le document',
        description: "Téléchargez l'addendum signé numériquement au format p7m",
        dropArea: {
          title: 'Glisser/Déposer ici le document signé ou bien',
          link: 'le sélectionner depuis votre ordinateur'
        }
      },
      continue: 'Continuer',
      error: {
        title: 'Échec du téléchargement',
        description: "Le téléchargement du document n'a pas abouti. <1 />Téléchargez un seul fichier au format <3>p7m</3>.",
        close: 'Sortir',
        retry: 'Télécharger à nouveau'
      }
    }
  },
  fileUploadPreview: {
    loadingStatus: 'Téléchargement...',
    labelStatus: 'Prêt à envoyer',
    cleanIcon: 'Supprimer le fichier téléchargé'
  },
  inlineSupportLink: {
    assistanceLink: 'contacter l’assistance'
  },
  moreInformationOnRoles: 'Plus d’informations sur les rôles',
  onboardingStep0: {
    title: 'Bienvenue sur le portail Self-care',
    description: 'En quelques étapes, votre Organisme pourra adhérer et gérer tous les produits PagoPA.',
    privacyPolicyDescription: 'J’ai lu et compris',
    privacyPolicyLink: 'la Charte de confidentialité et les Conditions d’utilisation du service',
    actionLabel: 'Continuer'
  },
  stepVerifyOnboarding: {
    loadingText: 'Nous vérifions vos données',
    ptAlreadyOnboarded: {
      title: 'Le Partenaire est déjà enregistré',
      description: 'Pour gérer un produit, demandez à un Administrateur de <1/> vous ajouter dans la section Utilisateurs.',
      backAction: 'Fermer'
    },
    alreadyOnboarded: {
      title: 'L’organisme sélectionné a déjà adhéré',
      description: 'Pour gérer le produit, demandez à un Administrateur de <1/>vous ajouter dans la section Utilisateurs.',
      addNewAdmin: 'Les Administrateurs actuels ne sont plus disponibles et vous avez besoin <1 />de gérer les produits ? <3>Ajouter un nouvel Administrateur</3>',
      backHome: 'Retour à la page d’accueil'
    },
    genericError: {
      title: 'Une erreur s’est produite',
      description: "En raison d'une erreur système, il n'est pas possible de terminer <br />la procédure. Nous vous demandons de réessayer plus tard.",
      backHome: 'Retour à la page d’accueil'
    },
    userNotAllowedError: {
      title: 'Vous ne pouvez pas adhérer à ce produit',
      description: "Actuellement, l'entité <1>{{partyName}}</1> ne peut pas adhérer à <3>{{productTitle}}</3>. <5 /> Pour plus de détails, veuillez contacter <7>l'assistance</7>.",
      noSelectedParty: 'indiqué',
      backToHome: 'Retour à la page d’accueil'
    }
  },
  onboardingStep1: {
    loadingOverlayText: 'Nous vérifions vos données',
    onboarding: {
      bodyTitle: 'Cherchez votre organisme',
      codyTitleSelected: 'Confirmer l’organisme sélectionné',
      disclaimer: {
        description: "Actuellement, seules les <1>Administrations <3 /> Publiques Locales </1> présentes dans l'IPA peuvent adhérer à SEND via l'Espace Réservé. Vous les trouverez à <5>ce lien</5>."
      },
      bodyDescription: "Saisissez l'une des données requises et recherchez dans l'Index de l'Administration <1/> Publique (IPA) l'organisme pour lequel vous demandez l'adhésion à <3/><4>{{productTitle}}</4>.",
      aggregator: 'Je suis un organisme agrégateur',
      aggregatorModal: {
        title: 'Organisme agrégateur',
        message: "Vous demandez l'adhésion en tant qu'organisme agrégateur pour <1>{{partyName}}</1>.<3 />Pour compléter l'adhésion, vous devez indiquer les organismes à agréger.",
        back: 'Retour',
        forward: 'Continuer'
      },
      ipaDescription: "Vous ne trouvez pas votre organisme sur l'IPA ? <1>Sur cette page</1> vous trouvez plus <3/> d'informations sur l'index et comment s'accréditer ",
      selectedInstitution: 'Prosegui con l’adesione a <1>{{productName}}</1> per l’ente selezionato',
      gpsDescription: "Vous ne trouvez pas votre organisme sur l'IPA ? <1 /><2>Saisissez manuellement les données de votre organisme.</2>",
      saSubTitle: 'Se sei tra i gestori privati di piattaforma e-procurement e hai <1/> già ottenuto la <3>certificazione da AgID</3>, inserisci uno dei dati <5/> richiesti e cerca l’ente per cui vuoi richiedere l’adesione a <7/> <8>Interoperabilità.</8>',
      asSubTitle: 'Se sei una società di assicurazione presente nell’Albo delle <1/>imprese IVASS, inserisci uno dei dati richiesti e cerca l’ente per<3/> cui vuoi richiedere l’adesione a <5>Interoperabilità.</5>',
      scpSubtitle: 'Inserisci uno dei dati richiesti e cerca da InfoCamere l’ente <3/> per cui vuoi richiedere l’adesione a <5>Interoperabilità.</5>',
      merchantSubtitle: "Saisissez l'une des données requises pour rechercher sur InfoCamere l'organisme <3/> pour lequel vous demandez l'adhésion à <5>{{productName}}.</5>",
      merchantAtecoValid: "Si vous faites partie d'une chaîne de magasins, l'adhésion doit être faite par la société mère.",
      merchantAtecoNotValid: "L'organisme indiqué ne peut pas adhérer car son code ATECO ne figure pas parmi ceux autorisés.",
      merchantCompanyStatusDisabled: 'Votre organisme ne peut pas adhérer au portail car il est liquidé ou en cours de liquidation',
      asyncAutocomplete: {
        placeholder: 'Chercher'
      },
      onboardingStepActions: {
        confirmAction: 'Continuer',
        backAction: 'Retour'
      }
    }
  },
  stepUploadAggregates: {
    title: 'Indica i soggetti aggregati per {{productName}}',
    subTitle: 'Scarica il file di esempio, compilalo seguendo le indicazioni e carica il documento per aggiungere/dichiarare gli enti da aggregare.',
    findOutMore: 'Des doutes ? Aller au manuel',
    errors: {
      onCsv: {
        title: 'Le fichier contient une ou plusieurs erreurs',
        description: '<1>Téléchargez le rapport</1> pour vérifier les informations et charger à nouveau le fichier.'
      },
      invalidFormat: {
        title: 'Le format du fichier n’est pas valide',
        description: 'Il est possible de télécharger uniquement des fichiers au format .csv'
      }
    },
    dropArea: {
      title: 'Glisser/Déposer ici le fichier .cvs avec la liste des organismes agrégateurs ou bien',
      button: 'Charger un document'
    },
    downloadExampleCsv: 'Vous ne savez pas comment préparer le fichier ? <1>Téléchargez l’exemple</1>',
    back: 'Retour',
    forward: 'Continuer'
  },
  stepAddManager: {
    title: 'Indiquer le Représentant Légal',
    subTitle: {
      flow: {
        base: "Saisissez les données du Représentant Légal de votre organisme. <1/> Il sera responsable de la signature du contrat pour <3>{{productTitle}}</3> <4/> et aura le rôle d'Administrateur pour ce produit dans l'Espace Réservé.",
        premium: 'Inserisci i dati del Legale Rappresentante del tuo ente. <1/> La persona che indicherai sarà firmataria del contratto per <3/> <strong>Premium<strong/>.',
        addNewUser: "La personne indiquée signera le Formulaire d'ajout pour le nouvel Administrateur et <1 />l'autorisera à gérer le produit <3>{{productTitle}}</3> pour votre organisme."
      }
    },
    changedManager: {
      title: 'Vous ajoutez un Représentant Légal',
      message: 'Les données du Représentant Légal saisies sont différentes de celles indiquées <1 />précédemment. Voulez-vous continuer ?'
    },
    formControl: {
      label: 'Ajoutez-moi en tant que Représentant Légal'
    },
    back: 'Retour',
    continue: 'Continuer'
  },
  stepAddDelegates: {
    title: 'Indiquer l’Administrateur',
    description: {
      flow: {
        onboarding: "Vous pouvez ajouter de un à trois Administrateurs ou ses délégués. <1/> Ils seront responsables de la gestion de <3>{{productTitle}}</3> et figureront dans le contrat de <4 />d'adhésion comme délégués du Représentant Légal.",
        pt: 'Vous pouvez ajouter de un à trois Administrateurs ou ses délégués.<1/> Ils gèreront les utilisateurs et les produits au nom des organismes.',
        addNewUser: "Vous pouvez ajouter un Administrateur ou un délégué. Vous pouvez également ajouter la personne que <1 />vous avez déjà indiquée en tant que Représentant Légal. Si vous ajoutez une personne déjà présente avec un <3 />rôle différent pour ce produit, elle sera ajoutée en tant qu'Administrateur."
      }
    },
    addUserLabel: 'AJOUTER UN AUTRE ADMINISTRATEUR',
    addUserLink: 'Ajouter un autre Administrateur',
    backLabel: 'Retour',
    confirmLabel: 'Continuer',
    formControl: {
      label: 'M’ajouter en tant qu’Administrateur'
    },
    removeUser: "Supprimer l'Administrateur supplémentaire"
  },
  stepAddApplicantEmail: {
    title: 'Indiquez votre adresse e-mail',
    description: 'Saisissez votre adresse e-mail pour recevoir une confirmation lorsque votre demande aura été traitée <1/> avec succès',
    applicantName: 'Prénom',
    applicantSurname: 'Nom de famille',
    applicantEmail: 'Adresse e-mail',
    backLabel: 'Retour',
    confirmLabel: 'Continuer'
  },
  additionalGpuDataPage: {
    title: "Saisir d'autres détails",
    subTitle: 'Sélectionnez parmi les options celle qui décrit votre organisme.',
    firstBlock: {
      yes: 'Oui',
      no: 'Non',
      question: {
        isPartyRegistered: "L'organisme est-il inscrit à un Registre, Albo ou Liste ?",
        subscribedTo: 'Inscrit à:',
        isPartyProvidingAService: "L'organisme fournit-il un service destiné aux citoyens ?",
        gpuRequestAccessFor: "Pour quels services d'utilité publique et/ou d'intérêt général l'organisme demande-t-il l'accès ?",
        longTermPayments: 'La fréquence des paiements est-elle continue ?'
      },
      placeholder: {
        registerBoardList: 'Registre/Albo/Liste',
        answer: 'Réponse',
        numberOfSubscription: "Numéro d'inscription"
      },
      errors: {
        requiredField: 'Champ obligatoire'
      }
    },
    secondBlock: {
      title: "Le représentant légal de l'Organisme Demandeur déclare et représente de manière irrévocable :",
      boxes: {
        first: "d'avoir le pouvoir d'agir au nom et pour le compte de l'Organisme Demandeur ;",
        second: "que l'Organisme, par l'intermédiaire de son représentant légal, le représentant légal et ses dirigeants sont en possession de toutes les autorisations prévues par la loi pour l'exercice des activités faisant l'objet de la demande et y afférentes ;",
        third: "que ce représentant légal et les dirigeants de l'Organisme Demandeur ne se trouvent pas dans l'une des circonstances indiquées aux articles 94 et 95 du D.Lgs. n° 36/2023 ;",
        fourth: "que contre le même et les dirigeants de l'Organisme Demandeur aucune procédure n'est en attente pour l'application de l'une des mesures de prévention visées à l'art. 6 du D.Lgs. 159/2011 et qu'aucune des causes restrictives prévues à l'art. 67 du D.Lgs. 159/2011 n'existe ;",
        fifth: "que l'Organisme demandeur n'est pas destinataire de mesures judiciaires, ni impliqué dans des procédures en attente comportant l'application de sanctions administratives au sens du décret législatif 8 juin 2001, n° 231."
      },
      legalBlockFooterInfo: "Les déclarations du présent document sont faites conformément à l'art. 46 du D.P.R. 28.12.2000 n° 445. En cas de déclarations mensongères, les sanctions applicables, y compris d'ordre pénal, sont appliquées, notamment les infractions prévues et punies par le D.P.R. 28.12.2000 n° 445."
    }
  },
  additionalDataPage: {
    title: 'Saisir d’autres détails',
    subTitle: `Choisissez l'option qui décrit votre organisme. Si aucune n'est appropriée, sélectionnez "Autre" et <1 /> saisissez plus de détails.`,
    formQuestions: {
      textFields: {
        labels: {
          note: 'Notes',
          ipa: 'Entrer le code IPA de référence'
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'Vous n’avez saisi aucune note',
          fromBelongsRegulatedMarket: 'Vous n’avez saisi aucune note',
          isFromIPA: 'Entrer le code IPA de référence',
          isConcessionaireOfPublicService: 'Vous n’avez saisi aucune note',
          optionalPartyInformations: 'Champ obligatoire'
        }
      },
      estabilishedRegulatoryProvision: "L'organisme est une société constituée ex lege par une mesure réglementaire",
      belongsRegulatedMarket: "L'organisme appartient à un marché régulé (ex. : énergie, gaz, eau, <1 />transports, services postaux, etc.)",
      registratedOnIPA: 'L’organisme est enregistré sur IPA',
      concessionaireOfPublicService: "L'organisme est concessionnaire d'un service public",
      other: 'Autres',
      optionalPartyInformations: 'Écrivez ici les informations sur votre organisme'
    },
    options: {
      yes: 'Oui',
      no: 'Non'
    },
    addNote: 'Ajouter une note',
    allowedCharacters: '300 caractères maximum'
  },
  addUser: {
    title: 'Ajouter un nouvel <1 /> Administrateur',
    subTitle: 'Indiquez pour quel produit vous souhaitez ajouter un nouvel<1 />Administrateur',
    stepSelectProduct: {
      title: 'SÉLECTIONNER LE PRODUIT'
    }
  },
  platformUserForm: {
    helperText: 'Le Champ est invalide',
    fields: {
      name: {
        label: 'Prénom',
        errors: {
          conflict: 'Nom incorrect ou différent par rapport au Code Fiscal'
        }
      },
      surname: {
        label: 'Nom de famille',
        errors: {
          conflict: 'Nom de famille incorrect ou différent par rapport au Code Fiscal'
        }
      },
      taxCode: {
        label: 'Code Fiscal',
        errors: {
          invalid: 'Le Code Fiscal saisi est invalide',
          duplicate: 'Le code fiscal saisi existe déjà'
        }
      },
      email: {
        label: 'E-mail institutionnel',
        errors: {
          invalid: 'L’adresse mail est invalide',
          invalidPec: "Adresse PEC non acceptée. Saisissez l'adresse e-mail institutionnelle utilisée pour l'organisme",
          duplicate: 'L’adresse mail saisie existe déjà',
          conflict: "L'adresse e-mail saisie ne correspond pas à la précédente"
        },
        description: "Saisissez l'adresse e-mail institutionnelle utilisée pour l'organisme. Les adresses PEC ne sont pas acceptées"
      }
    }
  },
  completeRegistration: {
    sessionModal: {
      onConfirmLabel: 'Télécharger à nouveau',
      onCloseLabel: 'Sortir'
    },
    steps: {
      step0: {
        label: 'Télécharger l’Accord d’Adhésion'
      },
      step1: {
        label: 'Télécharger l’Accord d’Adhésion'
      }
    },
    request: {
      notFound: {
        title: 'La page que vous cherchiez n’est pas disponible',
        description: "Pour le moment, il n'est pas possible de continuer. Réessayez dans quelques <1 />minutes, ou contactez l'assistance",
        contactAssistanceButton: 'Contacter l’assistance'
      },
      expired: {
        product: {
          title: 'La demande d’adhésion a expiré',
          description: "Plus de 30 jours se sont écoulés depuis la demande d'adhésion. Si <2 />vous souhaitez toujours adhérer au produit {{productTitle}}, envoyez <4 />une nouvelle demande."
        },
        user: {
          title: 'La demande a expiré',
          description: "Plus de 30 jours se sont écoulés depuis la demande d'ajout d'un <2 />Administrateur. Pour continuer, envoyez une nouvelle <2 /> demande."
        },
        backHome: 'Retour à la page d’accueil'
      },
      alreadyCompleted: {
        product: {
          title: 'La demande d’adhésion a été acceptée'
        },
        user: {
          title: 'La demande a déjà été acceptée'
        },
        description: 'Pour gérer le produit, connectez-vous via SPID ou CIE',
        logIn: 'Se connecter'
      },
      alreadyRejected: {
        product: {
          title: 'La demande d’adhésion a été annulée',
          description: "La demande d'adhésion n'a pas abouti. Si <2 />vous souhaitez toujours adhérer au produit {{productTitle}}, envoyez <4 />une nouvelle demande."
        },
        user: {
          title: 'La demande n’est plus valide',
          description: 'Votre organisme a annulé la demande. Pour ajouter un <2 />nouvel Administrateur, envoyez une nouvelle.'
        },
        backHome: 'Retour à la page d’accueil'
      }
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Adhésion complétée !',
          description: "Nous communiquerons l'adhésion à l'adresse PEC <1/> principale de l'organisme. À partir de ce moment, il est possible <3 />d'accéder à l'Espace Réservé."
        },
        user: {
          title: 'Demande complétée',
          description: "À partir de ce moment, les Administrateurs indiqués peuvent <1 />accéder à l'Espace Réservé."
        },
        attachments: {
          title: 'Téléchargement complété',
          description: 'Vous avez correctement souscrit au nouvel addendum DORA.',
          link: 'Aller à la section documents'
        },
        backHome: 'Retour à la page d’accueil'
      },
      error: {
        title: 'Échec du téléchargement',
        description: "Le téléchargement du document n'a pas abouti.",
        backToUpload: 'Télécharger à nouveau'
      }
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Contrôler le document',
        product: {
          message: "Le document téléchargé ne correspond pas à l'Accord d'Adhésion. Vérifiez qu'il est correct et téléchargez-le à nouveau."
        },
        user: {
          message: "Le document téléchargé ne correspond pas au formulaire que vous avez reçu par e-mail. Vérifiez qu'il est correct et téléchargez-le à nouveau."
        }
      },
      INVALID_SIGN: {
        title: 'Contrôler le document',
        product: {
          message: "La Signature Numérique n'est pas attribuable au Représentant Légal indiqué lors de l'adhésion. Vérifiez la correspondance et téléchargez à nouveau le document."
        },
        user: {
          message: "La Signature Numérique n'est pas attribuable au Représentant Légal indiqué lors de la demande. Vérifiez la correspondance et téléchargez à nouveau le document."
        }
      },
      ALREADY_ONBOARDED: {
        title: "L'organisme sélectionné a déjà adhéré",
        message: 'Pour opérer sur le produit, demandez à un Administrateur de <1 />vous ajouter dans la section Utilisateurs.'
      },
      GENERIC: {
        title: 'Échec du téléchargement',
        message: "Le téléchargement du document n'a pas abouti. Retournez en arrière et téléchargez-le à nouveau."
      },
      INVALID_SIGN_FORMAT: {
        title: 'Échec du téléchargement',
        message: "Le téléchargement du document n'a pas abouti. <1 />Téléchargez un seul fichier au format <3>p7m</3>."
      }
    }
  },
  noProductPage: {
    title: 'Désolé, un problème est survenu.',
    description: 'Impossible de trouver le produit souhaité'
  },
  onboarding: {
    success: {
      flow: {
        product: {
          title: 'Demande d’adhésion envoyée',
          publicAdministration: {
            description: "Nous enverrons un e-mail à l'adresse PEC principale de l'organisme. <1 /> À l'intérieur, vous trouverez les instructions pour compléter <3 />l'adhésion."
          },
          notPublicAdministration: {
            description: "Nous enverrons un e-mail à l'adresse PEC indiquée. <1 /> À l'intérieur, vous trouverez les instructions pour compléter <3 />l'adhésion."
          }
        },
        techPartner: {
          title: 'Demande d’enregistrement envoyée',
          description: "Nous enverrons un e-mail avec le résultat de la demande à l'adresse <1 />PEC indiquée."
        },
        user: {
          title: 'Vous avez envoyé la demande',
          description: "Nous enverrons un e-mail à l'adresse PEC principale de l'organisme. <1 /> À l'intérieur, vous trouverez les instructions pour compléter <3 />l'opération."
        }
      }
    },
    error: {
      title: 'Un problème est survenu.',
      description: "En raison d'une erreur système, il n'est pas possible de terminer <1 />la procédure. Nous vous demandons de réessayer plus tard."
    },
    backHome: 'Retour à la page d’accueil',
    sessionModal: {
      title: 'Voulez-vous vraiment sortir ?',
      message: 'Si vous sortez, votre demande d’adhésion sera perdue.',
      onConfirmLabel: 'Sortir',
      onCloseLabel: 'Annuler'
    },
    confirmationModal: {
      title: 'Confirmer la demande d’envoi ?',
      description: {
        flow: {
          base: 'Vous envoyez une demande d’adhésion au produit <1>{{productName}}</1> pour l’organisme <3>{{institutionName}}</3>. <5 /> L’accord d’adhésion arrivera à la PEC institutionnelle de l’organisme et devra être signé par le Représentant Légal. Assurez-vous d’être autorisé en tant qu’employé à faire cette demande.',
          addNewUser: "Vous ajoutez un nouvel Administrateur pour l'organisme <1>{{institutionName}}</1>. <3 />L'organisme recevra un formulaire à l'adresse PEC institutionnelle et devra être signé par le Représentant Légal que vous avez indiqué. <3 />Assurez-vous d'être autorisé par l'organisme à effectuer cette demande."
        }
      },
      confirm: 'Confirmer',
      back: 'Retour'
    },
    loading: {
      loadingText: 'Nous vérifions vos données'
    },
    phaseOutError: {
      title: 'Une erreur s’est produite',
      description: 'Vous ne pouvez pas adhérer au produit choisi car il ne sera bientôt <1 /> plus disponible.',
      backAction: 'Retour à la page d’accueil'
    }
  },
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Déjà souscrit',
      message: "L'organisme que vous avez sélectionné a déjà souscrit à l'offre <1 /><strong>Premium</strong>.",
      closeButton: 'Fermer'
    },
    subProductStepUserUnrelated: {
      title: 'Vous ne pouvez pas adhérer à {{selectedProduct}} Premium',
      description: "Votre organisme n'a pas adhéré à <strong>{{selectedProduct}}</strong>, ou vous n'avez pas de rôle pour <3/>gérer le produit. <5/> Demandez à un Administrateur de <1/>vous ajouter dans la section <7/>Utilisateurs, ou demandez l'adhésion à <strong>{{selectedProduct}}</strong> pour votre organisme.",
      backHomeLabelBtn: 'Retour à la page d’accueil',
      goToBtnLabel: 'Aller à l’adhésion'
    },
    selectUserPartyStep: {
      title: 'Sélectionnez votre organisme',
      subTitle: "Sélectionnez l'organisme pour lequel vous demandez à souscrire <1 />à l'offre <3>{{productName}}</3>",
      searchLabel: 'Chercher un organisme',
      notFoundResults: 'Aucun résultat',
      IPAsubTitle: "Sélectionnez sur l'Indice de l'Administration Publique (IAP/IPA) l'organisme <1/> pour lequel vous demandez l'adhésion à {{baseProduct}} Premium",
      helperLink: 'Vous ne trouvez pas votre organisme ? <1>Découvrez pourquoi</1>',
      confirmButton: 'Continuer'
    },
    noPartyStep: {
      title: 'Aucun de vos organismes ne peut <1/> adhérer',
      subTitle: "Si vous ne voyez pas d'organismes disponibles dans la liste, l'organisme recherché a peut-être <1/> déjà adhéré à <3>{{productName}}</3>",
      notPartyAvailable: 'Aucun organisme disponible',
      helperLink: "Votre organisme a adhéré mais n'est pas disponible ? <1>Découvrez pourquoi</1>",
      backButton: 'Retour'
    },
    genericError: {
      title: 'Une erreur s’est produite',
      subTitle: "En raison d'une erreur système, il n'est pas possible de terminer<0 /> la procédure. Nous vous demandons de réessayer plus tard.",
      homeButton: 'Retour à la page d’accueil'
    },
    successfulAdhesion: {
      title: 'La demande d’adhésion a été <1/>correctement envoyée',
      message: "Vous recevrez une PEC à l'adresse institutionnelle de l'organisme.<1 />Vous y trouverez les instructions pour compléter la <3 /> souscription à l'offre <strong>Premium</strong>.",
      closeButton: 'Fermer'
    },
    billingData: {
      subTitle: "Confirmez, modifiez ou saisissez les données requises, en vous assurant qu'elles sont correctes.<1 /> Elles seront également utilisées pour demander l'adhésion à d'autres produits et en cas de facturation."
    },
    exitModal: {
      title: 'Voulez-vous vraiment sortir ?',
      message: 'Si vous sortez, votre demande d’adhésion sera perdue.',
      backButton: 'Sortir',
      cancelButton: 'Annuler'
    },
    loading: {
      loadingText: 'Nous vérifions vos données'
    }
  },
  invalidPricingPlan: {
    title: 'Une erreur s’est produite',
    description: "Nous ne parvenons pas à trouver la page que vous recherchez. <1 />Assurez-vous que l'adresse est correcte ou retournez à la page d'accueil.",
    backButton: 'Retour à la page d’accueil'
  },
  stepInstitutionType: {
    title: 'Sélectionnez le type d’organisme que vous <1/> représentez',
    subtitle: 'Indiquez le type d’organisme qui adhérera à <1>{{productName}}</1>',
    institutionTypes: {
      pa: {
        title: 'Administration Publique',
        description: 'art. 2, alinéa 2, lettre A du CAD'
      },
      pa_ced: {
        title: 'Organismes publics'
      },
      gsp: {
        title: 'Opérateur de services publics',
        description: 'art. 2, alinéa 2, lettre B du CAD'
      },
      scec: {
        title: 'Société à consolidation de compte économique'
      },
      gpu: {
        title: 'Responsable de service public et/ou d’intérêt général',
        description: 'Établissements de crédit participant à titre facultatif'
      },
      scp: {
        title: 'Société à contrôle public',
        description: 'art. 2, alinéa 2, lettre C du CAD'
      },
      pt: {
        title: 'Partenaire technologique',
        description: `Ai sensi di IO - Paragrafo 6.1.3 delle "Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione" emanate da AgID ai sensi dell'art- 64-bis del CAD`
      },
      psp: {
        title: 'Fournisseur de Services de Paiement'
      },
      sa: {
        title: 'Opérateur privé de plateforme e-procurement'
      },
      as: {
        title: 'Compagnie d’assurance'
      },
      prv: {
        title: 'Privés'
      },
      prv_ced: {
        title: 'Organismes privés'
      },
      oth: {
        title: 'Autres',
        description: 'Organismes créanciers adhérents à titre facultatif'
      }
    },
    infoAlert: {
      ced: "PagoPA S.p.A. met à disposition la plateforme de gestion des adhésions. Elle ne participe pas à la Convention et n'est pas responsable de son exécution."
    },
    backLabel: 'Retour',
    confirmLabel: 'Continuer'
  },
  onboardingFormData: {
    title: 'Saisir les données de l’organisme',
    pspAndProdPagoPATitle: 'Saisissez vos données',
    backLabel: 'Retour',
    confirmLabel: 'Continuer',
    closeBtnLabel: 'Fermer',
    billingDataPt: {
      title: 'Saisissez vos données',
      subTitle: "Saisissez les informations requises et assurez-vous qu'elles sont correctes.<1 /> Elles serviront à vous enregistrer en tant que Partenaire technologique pour le<3 /> produit <5>{{nameProduct}}</5>."
    },
    pspDashboardWarning: "Pour mettre à jour les données présentes, contactez le service <1>d'Assistance</1>",
    billingDataSection: {
      invalidFiscalCode: 'Le Code Fiscal est invalide',
      invalidTaxCodeInvoicing: 'Le Code Fiscal saisi ne correspond pas à votre organisme',
      invalidZipCode: 'Le CP est invalide',
      invalidVatNumber: 'Le N° de TVA est invalide',
      invalidEmail: 'L’adresse mail est invalide',
      invalidReaField: 'Le Champ REA est invalide',
      invalidMailSupport: 'L’adresse mail est invalide',
      invalidShareCapitalField: 'Le champ capital social est invalide',
      recipientCodeMustBe6Chars: 'Le code doit comporter au minimum 6 caractères',
      invalidRecipientCodeNoAssociation: 'Le code saisi n’est pas associé à votre organisme',
      invalidRecipientCodeNoBilling: 'Il codice inserito è associato al codice fiscale di un ente che non ha il servizio di fatturazione attivo',
      vatNumberAlreadyRegistered: 'Le N° de TVA que vous avez saisi a déjà été enregistré.',
      vatNumberVerificationErrorTitle: 'Le contrôle n’a pas abouti',
      vatNumberVerificationErrorDescription: 'Non è stato possibile verificare la P.IVA al momento. Riprova più tardi.',
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
      partyWIthoutVatNumberSubtitle: "Indica solo il Codice Fiscale se il tuo ente non agisce nell'esercizio d'impresa,\n" +
        '      arte o professione <1 />(cfr. art. 21, comma 2, lett. f, DPR n. 633/1972)',
      vatNumberGroup: 'Le numéro de TVA est un numéro de groupe',
      taxCode: 'Code Fiscal',
      taxCodeCentralParty: 'Code Fiscal organisme central',
      vatNumber: 'N° de TVA',
      taxCodeInvoicing: 'Code Fiscal SFE',
      originId: 'Code IVASS',
      sdiCode: 'Code SDI',
      sdiCodePaAooUo: 'Code unique ou SDI',
      sdiCodePaAooUoDescription: "C'est le code unique nécessaire pour recevoir les factures électroniques. Il peut être celui de votre organisme ou de son Unité Organisationnelle de référence.",
      recipientCodeDescription: "Il s'agit du code nécessaire pour recevoir les factures électroniques",
      gspDescription: "Je suis opérateur d'au moins un des services publics : Gaz, Énergie, Telco.",
      pspDataSection: {
        commercialRegisterNumber: 'n° Inscription au Registre du Commerce',
        invalidCommercialRegisterNumber: 'Le n° d’Inscription au Registre du Commerce n’est pas valide',
        registrationInRegister: 'Inscription au Registre',
        registerNumber: 'Numéro du Registre',
        invalidregisterNumber: 'Le Numéro du Registre est invalide',
        abiCode: 'Code ABI',
        invalidabiCode: 'Le Code ABI est invalide'
      },
      informationCompanies: {
        commercialRegisterNumber: 'Lieu d’inscription au Registre du Commerce (facultatif)',
        requiredRea: 'REA',
        rea: 'REA (facultatif)',
        shareCapital: 'Capital social (facultatif)',
        requiredCommercialRegisterNumber: 'Lieu d’inscription au Registre du Commerce',
        requiredShareCapital: 'Capital social',
        shareCapitalHelper: 'À remplir uniquement pour les sociétés de capitaux'
      },
      assistanceContact: {
        supportEmail: 'Adresse électronique visible par les citoyens',
        supportEmailOptional: 'Adresse électronique visible par les citoyens (facultatif)',
        supportEmailDescriprion: "C'est le contact que les citoyens visualisent pour demander l'assistance à l'organisme"
      }
    },
    taxonomySection: {
      title: 'INDIQUER LA ZONE GÉOGRAPHIQUE',
      nationalLabel: 'Nationale',
      localLabel: 'Locale',
      infoLabel: "Sélectionnez le territoire sur lequel opère votre organisme. Si c'est local, vous pouvez choisir une ou plusieurs zones de compétence. Si l'organisme a déjà adhéré à d'autres produits PagoPA, vous trouverez la zone déjà définie.",
      localSection: {
        addButtonLabel: 'Ajouter une zone',
        inputLabel: 'Commune, Province ou Région'
      },
      error: {
        notMatchedArea: 'Choisir une localité dans la liste'
      },
      modal: {
        addModal: {
          title: 'Vous ajoutez d’autres zones pour votre organisme',
          description: "Les zones géographiques seront ajoutées à tous les produits PagoPA auxquels l'organisme a déjà adhéré. Voulez-vous continuer ?",
          confirmButton: 'Continuer',
          backButton: 'Retour'
        },
        modifyModal: {
          title: 'Vous modifiez la zone géographique de votre organisme',
          description: "La modification sera appliquée à tous les produits PagoPA auxquels l'organisme a déjà adhéré. Voulez-vous continuer ?",
          confirmButton: 'Continuer',
          backButton: 'Retour'
        }
      }
    },
    dpoDataSection: {
      dpoTitle: 'CONTACTS DU RESPONSABLE DE LA PROTECTION DES DONNÉES',
      dpoAddress: 'Adresse',
      dpoPecAddress: 'Adresse PEC',
      dpoEmailAddress: 'Adresse e-mail'
    },
    ibanSection: {
      title: "SAISIR L'IBAN POUR RECEVOIR LES REMBOURSEMENTS",
      subTitle: "Pour que le virement aboutisse, assurez-vous que <1> l'IBAN correspond à ce qui est indiqué sur les coordonnées de votre compte. </1>",
      holder: 'Titulaire',
      iban: 'IBAN',
      confirmIban: "Confirmer l'IBAN",
      error: {
        invalidIban: 'Saisissez un IBAN valide',
        ibanNotMatch: "L'IBAN ne correspond pas"
      }
    }
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Demande d’adhésion éliminée',
        description: "Sur la page d'accueil de l'Espace Réservé, vous pouvez voir les produits<1 />disponibles et demander l'adhésion pour votre organisme.",
        backActionLabel: 'Retour à la page d’accueil'
      },
      error: {
        title: 'Un problème est survenu.',
        description: "En raison d'une erreur système, il n'est pas possible de terminer la procédure. <1 /> Nous vous demandons de réessayer plus tard.",
        backActionLabel: 'Retour à la page d’accueil'
      },
      verify: {
        loadingText: 'Nous vérifions vos données'
      },
      delete: {
        loadingText: 'Nous supprimons votre inscription'
      },
      jwtNotValid: {
        title: 'La demande d’adhésion n’est plus <1 /> valide',
        subtitle: 'Cette demande a été acceptée, annulée ou a expiré.',
        backActionLabel: 'Retour à la page d’accueil'
      }
    },
    confirmCancellatione: {
      title: 'Voulez-vous supprimer la demande d’<1 />adhésion ?',
      subtitle: 'Si vous la supprimez, toutes les données saisies seront perdues. ',
      confirmActionLabel: 'Supprimer la demande',
      backActionLabel: 'Retour à la page d’accueil'
    }
  },
  app: {
    sessionModal: {
      title: 'Session expirée',
      message: 'Vous allez être redirigé vers la page de connexion...'
    }
  }
};
