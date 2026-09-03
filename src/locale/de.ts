export default {
  asyncAutocomplete: {
    noResultsLabel: 'Kein Ergebnis',
    lessThen3CharacterLabel: 'Gib mindestens 3 Zeichen ein',
    lessThen11CharacterLabel: 'Gib mindestens 11 Zeichen ein',
    searchLabel: 'Körperschaft suchen',
    aooLabel: 'Gib den eindeutigen AOO-Code ein',
    uoLabel: 'Gib den eindeutigen UO-Code ein',
    ariaLabel: 'Wähle die Suchart für die Behörde',
    clearIconAriaLabel: 'Ausgewählte Körperschaft abwählen',
    businessName: 'Firmenbezeichnung',
    taxcode: 'Steuernummer der Körperschaft',
    originId: 'IVASS-Code',
    reaLabel: 'RM-123456',
    searchResultsLabel: 'Behörden gefunden',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Suchen nach',
    businessName: 'Firmenbezeichnung',
    ivassCode: 'IVASS-Code',
    taxCode: 'Steuernummer der Körperschaft',
    aooCode: 'Eindeutiger AOO-Code',
    uoCode: 'Eindeutiger UO-Code',
    reaCode: 'REA-Code',
    personalTaxCode: 'Steuernummer für Einzelunternehmen',
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Beitrittsvereinbarung downloaden',
          description:
            'Um die Anmeldung abzuschließen, laden Sie die Vereinbarung herunter und lassen Sie diese vom Rechtsvertreter der Körperschaft digital in <1 /><2>p7m-Format</2> unterzeichnen.',
          downloadContract: 'Vereinbarung downloaden',
        },
        attachments: {
          title: 'Zusatzabkommen herunterladen',
          description:
            'Laden Sie das Zusatzabkommen herunter und lassen Sie es digital in <2>p7m-Format</2> unterzeichnen.',
          downloadContract: 'Dokument herunterladen',
        },
        user: {
          title: 'Hinzufügungsformular downloaden',
          description:
            'Um die Anmeldung abzuschließen, laden Sie das Antragsformular herunter und lassen Sie es vom Rechtsvertreter der Körperschaft digital in <1 /><2>p7m-Format</2> unterzeichnen.',
          downloadContract: 'Formular downloaden',
        },
        disclaimerAttachments:
          'Sie können die Vereinbarung vom Rechtsvertreter oder Bevollmächtigten unterzeichnen lassen.',
        disclaimer:
          'Mit der Unterzeichnung der Vereinbarung akzeptiert der Rechtsvertreter der Körperschaft ausdrücklich und spezifisch auch die einzelnen Klauseln, die im Abschnitt "Klauseln gemäß Art. 1341 und 1342 BGB" angegeben sind.',
      },
      upload: {
        product: {
          title: 'Signierte Vereinbarung laden',
          description:
            'Nach der Unterzeichnung der Vereinbarung folgen Sie den Anweisungen, um diese einzureichen und die <1 />Anmeldung zum gewählten Produkt abzuschließen. Denken Sie daran, die Vereinbarung <3>innerhalb von 30 Tagen</3> hochzuladen.',
        },
        attachments: {
          title: 'Unterzeichnetes Zusatzabkommen hochladen',
          description:
            'Nach der digitalen Unterzeichnung des Dokuments laden Sie es hoch, um das <1 />Abonnement abzuschließen.',
        },
        user: {
          title: 'Signiertes Formular laden',
          description:
            'Nach der Unterzeichnung des Formulars folgen Sie den Anweisungen, um dieses einzureichen und das <1 />Hinzufügen von einem oder mehreren Administratoren abzuschließen.',
        },
        goToUpload: 'Zum Laden',
      },
    },
    upload: {
      product: {
        title: 'Beitrittsvereinbarung laden',
        description:
          'Laden Sie die von der Körperschaft digital in <1 />p7m unterzeichnete Anmeldevereinbarung hoch.',
        dropArea: {
          title: 'Zieh die signierte Beitrittsvereinbarung hierhin oder',
          link: 'lade die Datei',
        },
      },
      user: {
        title: 'Formular laden',
        description:
          'Laden Sie das vom Rechtsvertreter digital in <1 />p7m unterzeichnete Antragsformular hoch.',
        dropArea: {
          title: 'Zieh das signierte Formular hierhin oder',
          link: 'lade die Datei',
        },
        continue: 'Weiter',
      },
      attachments: {
        title: 'Dokument hochladen',
        description: 'Laden Sie das digital in p7m unterzeichnete Zusatzabkommen hoch.',
        dropArea: {
          title: 'Ziehen Sie das unterzeichnete Dokument hierher oder',
          link: 'wählen Sie es von Ihrem Computer',
        },
      },
      continue: 'Weiter',
      error: {
        title: 'Laden fehlgeschlagen',
        description:
          'Das Hochladen des Dokuments ist fehlgeschlagen. <1 />Laden Sie nur eine Datei in <3>p7m</3>-Format hoch.',
        close: 'Beenden',
        retry: 'Erneut laden',
      },
    },
  },
  fileUploadPreview: {
    loadingStatus: 'Laden läuft...',
    labelStatus: 'Versandbereit',
    cleanIcon: 'Hochgeladene Datei löschen',
  },
  inlineSupportLink: {
    assistanceLink: 'Kundendienst kontaktieren',
  },
  moreInformationOnRoles: 'Mehr Informationen über die Funktionen',
  onboardingStep0: {
    title: 'Willkommen auf dem Portal Self-Care',
    description:
      'In wenigen Schritten kann deine Körperschaft beitreten und alle PagoPA-Produkte verwalten.',
    privacyPolicyDescription: 'Ich habe die',
    privacyPolicyLink:
      'Datenschutzrichtlinie und die Nutzungsbedingungen des Dienstes gelesen und verstanden',
    actionLabel: 'Weiter',
  },
  stepVerifyOnboarding: {
    loadingText: 'Wir prüfen gerade deine Daten',
    ptAlreadyOnboarded: {
      title: 'Der Partner ist bereits registriert',
      description:
        'Bitten Sie einen Administrator, Sie im Abschnitt Benutzer hinzuzufügen, um mit einem Produkt zu arbeiten.',
      backAction: 'Beenden',
    },
    alreadyOnboarded: {
      title: 'Die gewählte Körperschaft ist bereits beigetreten',
      description:
        'Bitten Sie einen Administrator, Sie im Abschnitt Benutzer hinzuzufügen, um mit dem Produkt zu arbeiten.',
      addNewAdmin:
        'Die aktuellen Administratoren sind nicht mehr verfügbar und Sie müssen <1 />Produkte verwalten? <3>Einen neuen Administrator hinzufügen</3>',
      backHome: 'Zurück zur Homepage',
    },
    genericError: {
      title: 'Etwas ist schiefgelaufen',
      description:
        'Aufgrund eines Systemfehlers kann das Verfahren nicht abgeschlossen werden. <br />Bitte versuchen Sie es später erneut.',
      backHome: 'Zurück zur Homepage',
    },
    userNotAllowedError: {
      title: 'Du kannst diesem Produkt nicht beitreten',
      description:
        'Derzeit kann die Behörde <1>{{partyName}}</1> nicht zu <3>{{productTitle}}</3> beitreten. <5 /> Für weitere Details wenden Sie sich an <7>den Kundendienst</7>.',
      noSelectedParty: 'angegeben',
      backToHome: 'Zurück zur Homepage',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'Wir prüfen gerade deine Daten',
    onboarding: {
      bodyTitle: 'Suche deine Körperschaft',
      codyTitleSelected: 'Bestätige die gewählte Körperschaft',
      disclaimer: {
        description:
          'Derzeit können nur <1>Kommunale Verwaltungen<3 /></1>, die im Öffentlichen Verwaltungsregister (IPA) registriert sind, über den Administrationsbereich zu SEND beitreten. Das Register finden Sie <5>hier</5>.',
      },
      bodyDescription:
        'Geben Sie eines der erforderlichen Daten ein und suchen Sie im Index der Öffentlichen Verwaltung (IPA) nach der Behörde, für die Sie <3/><4>{{productTitle}}</4> beantragen möchten.',
      aggregator: 'Ich bin ein Aggregator',
      aggregatorModal: {
        title: 'Aggregator',
        message:
          'Sie fordern die Mitgliedschaft als aggregierende Behörde für <1>{{partyName}}</1> an.<3 />Um die Anmeldung abzuschließen, müssen Sie die zu aggregierenden Behörden angeben.',
        back: 'Zurück',
        forward: 'Weiter',
      },
      ipaDescription:
        'Finden Sie Ihre Körperschaft nicht im IPA? <1>Auf dieser Seite</1> finden Sie weitere <3/>Informationen zum Register und zur Registrierung.',
      selectedInstitution:
        'Fahren Sie mit der Anmeldung zu <1>{{productName}}</1> für die ausgewählte Körperschaft fort.',
      gpsDescription:
        'Finden Sie Ihre Körperschaft nicht im IPA?<1 /><2>Geben Sie die Daten Ihrer Körperschaft manuell ein.</2>',
      saSubTitle:
        'Wenn Sie einer der privaten Betreiber einer E-Beschaffungsplattform sind und bereits die <3>Zertifizierung von AgID</3> erhalten haben, geben Sie einen der erforderlichen Daten ein und suchen Sie nach der Körperschaft, für die Sie <7><8>Interoperabilität</8></7> anmelden möchten.',
      asSubTitle:
        'Wenn Sie ein bei IVASS registriertes Versicherungsunternehmen sind, geben Sie einen der erforderlichen Daten ein und suchen Sie nach der Körperschaft, für die Sie <5>Interoperabilität</5> anmelden möchten.',
      scpSubtitle:
        'Geben Sie einen der erforderlichen Daten ein und suchen Sie bei InfoCamere nach der Körperschaft, für die Sie <5>Interoperabilität</5> anmelden möchten.',
      merchantSubtitle:
        'Geben Sie einen der erforderlichen Daten ein, um die Körperschaft bei InfoCamere zu suchen, für die Sie <5>{{productName}}</5> anmelden möchten.',
      merchantCompanyStatusDisabled:
        'Ihr Unternehmen kann nicht zum Portal beitreten, da es als geschlossen oder in Liquidation eingetragen ist.',
      asyncAutocomplete: {
        placeholder: 'Suchen',
      },
      onboardingStepActions: {
        confirmAction: 'Weiter',
        backAction: 'Zurück',
      },
    },
  },
  stepUploadAggregates: {
    title: 'Geben Sie die aggregierten Subjekte für {{productName}} an',
    subTitle:
      'Laden Sie die Beispieldatei herunter, füllen Sie sie nach den Anweisungen aus und laden Sie das Dokument hoch, um aggregierte Behörden hinzuzufügen/zu deklarieren.',
    findOutMore: 'Zweifel? Zur Anleitung',
    errors: {
      onCsv: {
        title: 'Die Datei enthält einen oder mehrere Fehler',
        description:
          '<1>Laden Sie den Bericht herunter</1>, um die Informationen zu überprüfen, und laden Sie die Datei erneut hoch.',
      },
      invalidFormat: {
        title: 'Dateiformat ungültig',
        description: 'Es können nur Dateien mit Format .csv geladen werden',
      },
    },
    dropArea: {
      title: 'Ziehe die .csv-Datei mit der Liste der Aggregierten hierin oder',
      button: 'lade die Datei',
    },
    downloadExampleCsv:
      'Sie wissen nicht, wie Sie die Datei vorbereiten sollen? <1>Laden Sie das Beispiel herunter</1>',
    back: 'Zurück',
    forward: 'Weiter',
  },
  stepAddManager: {
    title: 'Gib den Rechtsvertreter an',
    subTitle: {
      flow: {
        base: 'Geben Sie die Daten des Rechtsvertreters Ihrer Körperschaft ein. <1/>Er/Sie ist verantwortlich für die Unterzeichnung des Vertrags für <3>{{productTitle}}</3> <4/>und erhält die Rolle eines Administrators für dieses Produkt im Administrationsbereich.',
        premium:
          'Geben Sie die Daten des Rechtsvertreters Ihrer Körperschaft ein. <1/>Die Person, die Sie angeben, unterzeichnet den Vertrag für <3/><strong>Premium<strong/>.</strong>',
        addNewUser:
          'Die angegebene Person unterzeichnet das Antragsformular für den neuen Administrator und <1 />genehmigt seine/ihre Tätigkeit für das Produkt <3>{{productTitle}}</3> für Ihre Körperschaft.',
      },
    },
    changedManager: {
      title: 'Du fügst einen Rechtsvertreter hinzu',
      message:
        'Die eingegebenen Daten des Rechtsvertreters unterscheiden sich von den zuvor angegebenen. Möchten Sie fortfahren?',
    },
    formControl: {
      label: 'Füge mich als Rechtevertreter hinzu',
    },
    back: 'Zurück',
    continue: 'Weiter',
  },
  stepAddDelegates: {
    title: 'Gib den Administrator an',
    description: {
      flow: {
        onboarding:
          'Sie können einen bis drei Administratoren oder deren Bevollmächtigte hinzufügen. <1/>Sie sind verantwortlich für die Verwaltung von <3>{{productTitle}}</3> und sind im Anmeldungsvertrag <4 />als von dem Rechtsvertreter Bevollmächtigte aufgeführt.',
        pt: 'Sie können einen bis drei Administratoren oder deren Bevollmächtigte hinzufügen.<1/> Sie kümmern sich um die Verwaltung der Benutzer und Produkte im Auftrag der Körperschaften.',
        addNewUser:
          'Sie können einen Administrator oder dessen/deren Bevollmächtigten hinzufügen. Sie können auch die Person hinzufügen, die Sie bereits als Rechtsvertreter angegeben haben. Wenn Sie eine Person hinzufügen, die bereits mit einer anderen Rolle für dieses Produkt vorhanden ist, wird sie als Administrator eingefügt.',
      },
    },
    addUserLabel: 'FÜGE EINEN ANDEREN ADMINISTRATOR HINZU',
    addUserLink: 'Füge einen anderen Administrator hinzu',
    backLabel: 'Zurück',
    confirmLabel: 'Weiter',
    formControl: {
      label: 'Füge mich als Administrator hinzu',
    },
    removeUser: 'Zusätzlichen Administrator entfernen',
  },
  stepAddApplicantEmail: {
    title: 'Geben Sie Ihre E-Mail-Adresse an',
    description:
      'Geben Sie Ihre E-Mail-Adresse ein, um eine Bestätigung zu erhalten, wenn Ihre Anfrage erfolgreich verarbeitet wurde <1/>',
    applicantName: 'Name',
    applicantSurname: 'Nachname',
    applicantEmail: 'E-Mail',
    backLabel: 'Zurück',
    confirmLabel: 'Weiter',
  },
  additionalGpuDataPage: {
    title: 'Geben Sie zusätzliche Details ein',
    subTitle: 'Wählen Sie die Option, die Ihre Körperschaft beschreibt.',
    firstBlock: {
      yes: 'Ja',
      no: 'Nein',
      question: {
        isPartyRegistered:
          'Ist die Körperschaft in ein Register, ein Verzeichnis oder eine Liste eingetragen?',
        subscribedTo: 'Eingetragen in:',
        isPartyProvidingAService: 'Erbringt die Körperschaft eine öffentliche Dienstleistung?',
        gpuRequestAccessFor:
          'Für welche öffentlichen Dienste und/oder Dienste von allgemeinem Interesse fordert die Körperschaft Zugang an?',
        longTermPayments: 'Ist die Zahlungshäufigkeit kontinuierlich?',
      },
      placeholder: {
        registerBoardList: 'Register/Verzeichnis/Liste',
        answer: 'Antwort',
        numberOfSubscription: 'Registrierungsnummer',
      },
      errors: {
        requiredField: 'Pflichtfeld',
      },
    },
    secondBlock: {
      title:
        'Der Rechtevertreter der anfragenden Körperschaft erklärt und versichert unwiderruflich:',
      boxes: {
        first:
          'die Befugnis zu haben, im Namen und für Rechnung der anfragenden Körperschaft zu handeln;',
        second:
          'dass die Körperschaft durch ihren Rechtevertreter, den Rechtevertreter und ihre Führungskräfte im Besitz aller für die Durchführung der Aktivitäten erforderlichen Genehmigungen sind, die Gegenstand des Antrags und damit verbunden sind;',
        third:
          'dass dieser Rechtevertreter und die Führungskräfte der anfragenden Körperschaft sich nicht in einem der in den Artikeln 94 und 95 des D.Lgs. Nr. 36/2023 genannten Umstände befinden;',
        fourth:
          'dass gegen denselben und gegen die Führungskräfte der anfragenden Körperschaft kein Verfahren zur Anwendung von Präventivmaßnahmen nach Art. 6 des D.Lgs. 159/2011 läuft und keine der hinderlichen Ursachen nach Art. 67 des D.Lgs. 159/2011 gegeben sind;',
        fifth:
          'dass die anfragende Körperschaft nicht Empfänger von Gerichtsurteilen ist oder in anhängige Verfahren verwickelt ist, die die Anwendung von Verwaltungssanktionen gemäß Legislativdekret vom 8. Juni 2001, Nr. 231 mit sich bringen.',
      },
      legalBlockFooterInfo:
        'Die Erklärungen in diesem Dokument werden gemäß Art. 46 des D.P.R. 28.12.2000 Nr. 445 abgegeben. Bei falschen Aussagen werden die geltenden Sanktionen angewendet, einschließlich Strafmaßnahmen, darunter die in D.P.R. 28.12.2000 Nr. 445 vorgesehenen und bestraften Tatbestände.',
    },
  },
  additionalDataPage: {
    title: 'Gib weitere Details ein',
    subTitle:
      'Wählen Sie die Option, die Ihre Körperschaft beschreibt. Wenn keine angemessen ist, wählen Sie "Sonstiges" und <1 /> geben Sie weitere Details ein.',
    formQuestions: {
      textFields: {
        labels: {
          note: 'Notizen',
          ipa: 'Geben Sie den IPA-Referenzcode ein',
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'Sie haben keine Notiz eingegeben.',
          fromBelongsRegulatedMarket: 'Sie haben keine Notiz eingegeben.',
          isFromIPA: 'Geben Sie den IPA-Referenzcode ein',
          isConcessionaireOfPublicService: 'Sie haben keine Notiz eingegeben.',
          optionalPartyInformations: 'Pflichtfeld',
        },
      },
      estabilishedRegulatoryProvision:
        'Die Körperschaft ist ein Unternehmen, das durch ein Gesetz geschaffen wurde.',
      belongsRegulatedMarket:
        'Die Körperschaft gehört zu einem regulierten Markt (z. B. Energie, Gas, Wasser, <1 />Verkehr, Postdienste usw.)',
      registratedOnIPA: 'Die Körperschaft ist im IPA registriert.',
      concessionaireOfPublicService:
        'Die Körperschaft ist eine Konzessionärin eines öffentlichen Dienstes.',
      other: 'Sonstiges',
      optionalPartyInformations: 'Geben Sie hier Informationen über Ihre Körperschaft ein.',
    },
    options: {
      yes: 'Ja',
      no: 'Nein',
    },
    addNote: 'Eine Notiz hinzufügen',
    allowedCharacters: 'Höchstens 300 Zeichen',
  },
  addUser: {
    title: 'Aggiungi un nuovo <1 /> Amministratore',
    subTitle: 'Indica per quale prodotto vuoi aggiungere un nuovo<1 />Amministratore',
    stepSelectProduct: {
      title: 'WÄHLE DAS PRODUKT',
    },
  },
  platformUserForm: {
    helperText: 'Das Feld ist ungültig',
    fields: {
      name: {
        label: 'Name',
        errors: {
          conflict: 'Name falsch oder stimmt nicht mit der Steuernummer überein',
        },
      },
      surname: {
        label: 'Nachname',
        errors: {
          conflict: 'Nachname falsch oder stimmt nicht mit der Steuernummer überein',
        },
      },
      taxCode: {
        label: 'Steuernummer',
        errors: {
          invalid: 'Die eingegebene Steuernummer ist ungültig',
          duplicate: 'Die eingegebene Steuernummer ist bereits vorhanden',
        },
      },
      email: {
        label: 'Institutionelle -E-Mail-Adresse',
        errors: {
          invalid: 'Die E-Mail-Adresse ist ungültig',
          invalidPec:
            'Indirizzo PEC non accettato. Inserisci l’indirizzo email istituzionale utilizzato per l’ente',
          duplicate: 'Die eingegebene E-Mail-Adresse ist bereits vorhanden',
          conflict: "L'indirizzo email inserito non corrisponde al precedente",
        },
        description:
          'Geben Sie die institutionelle E-Mail-Adresse ein, die für die Körperschaft verwendet wird. PEC-Adressen sind nicht zulässig.',
      },
    },
  },
  completeRegistration: {
    sessionModal: {
      onConfirmLabel: 'Erneut laden',
      onCloseLabel: 'Beenden',
    },
    steps: {
      step0: {
        label: 'Beitrittsakt laden',
      },
      step1: {
        label: 'Beitrittsakt laden',
      },
    },
    request: {
      notFound: {
        title: 'Die von dir gesuchte Seite ist nicht verfügbar',
        description:
          "Al momento non è possibile procedere. Riprova tra qualche <1 />minuto, o contatta l'assistenza",
        contactAssistanceButton: 'Kundendienst kontaktieren',
      },
      expired: {
        product: {
          title: 'Der Beitrittsantrag ist abgelaufen',
          description:
            'Es sind mehr als 30 Tage seit der Anmeldeanfrage vergangen. Wenn <2 />Sie immer noch zum Produkt {{productTitle}} beitreten möchten, senden Sie <4 />eine neue Anfrage.',
        },
        user: {
          title: 'Der Antrag ist abgelaufen',
          description:
            'Es sind mehr als 30 Tage seit der Anfrage zur Hinzufügung eines <2 />Administrators vergangen. Um fortzufahren, senden Sie eine neue <2 />Anfrage.',
        },
        backHome: 'Zurück zur Homepage',
      },
      alreadyCompleted: {
        product: {
          title: 'Der Beitrittsantrag wurde akzeptiert',
        },
        user: {
          title: 'Der Antrag wurde akzeptiert',
        },
        description: 'Um das Produkt zu verwalten, melden Sie sich mit SPID oder CIE an.',
        logIn: 'Anmelden',
      },
      alreadyRejected: {
        product: {
          title: 'Der Beitrittsantrag wurde widerrufen',
          description:
            'Die Anmeldeanfrage war nicht erfolgreich. Wenn <2 />Sie immer noch zum Produkt {{productTitle}} beitreten möchten, senden Sie <4 />eine neue Anfrage.',
        },
        user: {
          title: 'Der Antrag ist nicht mehr gültig',
          description:
            'Ihre Körperschaft hat die Anfrage storniert. Um einen <2 />neuen Administrator hinzuzufügen, senden Sie eine neue Anfrage.',
        },
        backHome: 'Zurück zur Homepage',
      },
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Beitritt abgeschlossen!',
          description:
            'Wir werden die erfolgreiche Anmeldung an die primäre PEC-Adresse <1/> der Körperschaft mitteilen. Ab diesem Moment können Sie sich <3 />in den Administrationsbereich anmelden.',
        },
        user: {
          title: 'Antrag abgeschlossen',
          description:
            'Ab diesem Moment können die angegebenen Administratoren <1 />auf den Administrationsbereich zugreifen.',
        },
        attachments: {
          title: 'Caricamento completato',
          description: 'Sie haben das neue DORA-Zusatzabkommen ordnungsgemäß unterzeichnet.',
          link: 'Zur Dokumentensektion wechseln',
        },
        backHome: 'Zurück zur Homepage',
      },
      error: {
        title: 'Laden fehlgeschlagen',
        description: 'Das Hochladen des Dokuments ist fehlgeschlagen.',
        backToUpload: 'Erneut laden',
      },
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Prüfe das Dokument',
        product: {
          message:
            'Das hochgeladene Dokument entspricht nicht dem Anmeldungsakt. Überprüfen Sie es auf Korrektheit und laden Sie es erneut hoch.',
        },
        user: {
          message:
            'Das hochgeladene Dokument entspricht nicht dem Formular, das Sie per E-Mail erhalten haben. Überprüfen Sie, dass es korrekt ist, und laden Sie es erneut hoch.',
        },
      },
      INVALID_SIGN: {
        title: 'Prüfe das Dokument',
        product: {
          message:
            'Die digitale Signatur kann nicht dem bei der Anmeldung angegebenen Rechtsvertreter zugeordnet werden. Überprüfen Sie die Übereinstimmung und laden Sie das Dokument erneut hoch.',
        },
        user: {
          message:
            'Die digitale Signatur kann nicht dem in der Anfrage angegebenen Rechtsvertreter zugeordnet werden. Überprüfen Sie die Übereinstimmung und laden Sie das Dokument erneut hoch.',
        },
      },
      ALREADY_ONBOARDED: {
        title: "L'ente selezionato ha già aderito",
        message:
          'Um das Produkt zu verwalten, bitten Sie einen Administrator, Sie im Abschnitt Benutzer hinzuzufügen.',
      },
      GENERIC: {
        title: 'Laden fehlgeschlagen',
        message:
          'Das Hochladen des Dokuments ist fehlgeschlagen. Gehen Sie zurück und laden Sie es erneut hoch.',
      },
      INVALID_SIGN_FORMAT: {
        title: 'Laden fehlgeschlagen',
        message:
          'Das Hochladen des Dokuments ist fehlgeschlagen. <1 />Laden Sie nur eine Datei in <3>p7m</3>-Format hoch.',
      },
    },
  },
  noProductPage: {
    title: 'Leider ist etwas schiefgelaufen.',
    description: 'Das gewünschte Produkt konnte nicht gefunden werden.',
  },
  onboarding: {
    success: {
      flow: {
        product: {
          title: 'Beitrittsantrag gesendet',
          publicAdministration: {
            description:
              'Wir senden eine E-Mail an die primäre PEC-Adresse der Körperschaft. <1 />Darin finden Sie die Anweisungen zum Abschließen <3 />der Anmeldung.',
          },
          notPublicAdministration: {
            description:
              'Wir senden eine E-Mail an die angegebene PEC-Adresse. <1 />Darin finden Sie die Anweisungen zum Abschließen <3 />der Anmeldung.',
          },
        },
        techPartner: {
          title: 'Registrierungsanfrage gesendet',
          description:
            'Wir senden eine E-Mail mit dem Ergebnis der Anfrage an die angegebene <1 />PEC-Adresse.',
        },
        user: {
          title: 'Du hast den Antrag gesendet',
          description:
            'Wir senden eine E-Mail an die primäre PEC-Adresse der Körperschaft. <1 />Darin finden Sie die Anweisungen zum Abschließen <3 />der Vorgangs.',
        },
      },
    },
    error: {
      title: 'Etwas ist schiefgelaufen.',
      description:
        'Aufgrund eines Systemfehlers kann das Verfahren nicht abgeschlossen werden. <1 />Bitte versuchen Sie es später erneut.',
    },
    backHome: 'Zurück zur Homepage',
    sessionModal: {
      title: 'Wirklich beenden?',
      message: 'Wenn Sie beenden, geht der Anmeldungsantrag verloren.',
      onConfirmLabel: 'Beenden',
      onCloseLabel: 'Abbrechen',
    },
    confirmationModal: {
      title: 'Sendeanfrage bestätigen?',
      description: {
        flow: {
          base: 'Sie senden einen Anmeldungsantrag für das Produkt <1>{{productName}}</1> für die Körperschaft <3>{{institutionName}}</3>. <5 />Die Anmeldevereinbarung wird im institutionellen PEC-Postfach der Körperschaft eingehen und muss vom Rechtsvertreter unterzeichnet werden. Vergewissern Sie sich, dass Sie als Mitarbeiter berechtigt sind, diesen Antrag zu stellen.',
          addNewUser:
            'Sie fügen einen neuen Administrator für die Körperschaft <1>{{institutionName}}</1> hinzu. <3 />Die Körperschaft erhält ein Formular zur institutionellen PEC und muss vom von Ihnen angegebenen Rechtsvertreter unterzeichnet werden. <3 />Vergewissern Sie sich, dass Sie berechtigt sind, diese Anfrage von der Körperschaft zu stellen.',
        },
      },
      confirm: 'Bestätigen',
      back: 'Zurück',
    },
    loading: {
      loadingText: 'Wir prüfen gerade deine Daten',
    },
    phaseOutError: {
      title: 'Etwas ist schiefgelaufen',
      description:
        'Sie können nicht zum gewählten Produkt beitreten, da dieses in Kürze nicht mehr verfügbar ist. <1 /> ',
      backAction: 'Zurück zur Homepage',
    },
  },
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Abonnement bereits erfolgt',
      message:
        'Die von Ihnen gewählte Körperschaft hat das <1 /><strong>Premium</strong>-Angebot bereits abonniert.',
      closeButton: 'Beenden',
    },
  },
  subProductStepUserUnrelated: {
    title: 'Du kannst {{selectedProduct}} Premium nicht beitreten',
    description:
      'Ihre Körperschaft hat nicht zu <strong>{{selectedProduct}}</strong> beigetreten, oder Sie haben keine Rolle zum <3/>Verwalten des Produkts. <5/> Bitten Sie einen Administrator, Sie im Abschnitt <7/>Benutzer hinzuzufügen, oder beantragen Sie <strong>{{selectedProduct}}</strong> für Ihre Körperschaft zu beitreten.',
    backHomeLabelBtn: 'Zurück zur Homepage',
    goToBtnLabel: 'Zum Beitritt',
  },
  selectUserPartyStep: {
    title: 'Wähle deine Körperschaft',
    subTitle:
      'Wählen Sie die Körperschaft, für die Sie ein Abonnement für das <1 />Premium <3>Angebot beantragen</3>',
    searchLabel: 'Körperschaft suchen',
    notFoundResults: 'Kein Ergebnis',
    IPAsubTitle:
      'Wählen Sie aus dem Index der Öffentlichen Verwaltung (IPA) die Körperschaft, <1/> für die Sie den Beitritt zum {{baseProduct}} Premium beantragen',
    helperLink: 'Deine Körperschaft nicht gefunden? <1>Erfahre warum</1>',
    confirmButton: 'Weiter',
  },
  noPartyStep: {
    title: 'Nessuno dei tuoi enti può <1/> aderire',
    subTitle:
      'Wenn Sie keine Körperschaften in der Liste sehen, hat die gesuchte Körperschaft möglicherweise <1/> bereits zu <3>{{productName}}</3> beigetreten.',
    notPartyAvailable: 'Nessun ente disponibile',
    helperLink: 'Il tuo ente ha aderito ma non è disponibile? <1>Scopri perché</1>',
    backButton: 'Zurück',
  },
  genericError: {
    title: 'Etwas ist schiefgelaufen',
    subTitle:
      'A causa di un errore del sistema non è possibile completare<0 /> la procedura. Ti chiediamo di riprovare più tardi.',
    homeButton: 'Zurück zur Homepage',
  },
  successfulAdhesion: {
    title: 'Der Beitrittsantrag wurde erfolgreich <1/>gesendet',
    message:
      'Sie erhalten eine PEC an die institutionelle Adresse der Körperschaft.<1 />Darin finden Sie die Anweisungen, um das <3 /> Abonnement des <strong>Premium</strong>-Angebots abzuschließen.',
    closeButton: 'Schließen',
  },
  billingData: {
    subTitle:
      'Bestätigen, ändern oder geben Sie die erforderlichen Daten ein und stellen Sie sicher, dass sie korrekt sind.<1 /> Sie werden auch für die Beantragung der Anmeldung zu anderen Produkten und bei der Abrechnung verwendet.',
  },
  exitModal: {
    title: 'Wirklich beenden?',
    message: 'Wenn Sie beenden, geht der Anmeldungsantrag verloren.',
    backButton: 'Beenden',
    cancelButton: 'Abbrechen',
  },
  loading: {
    loadingText: 'Wir prüfen gerade deine Daten',
  },
  invalidPricingPlan: {
    title: 'Etwas ist schiefgelaufen',
    description:
      'Wir können die gesuchte Seite nicht finden. <1 />Vergewissern Sie sich, dass die Adresse korrekt ist, oder gehen Sie zur Startseite.',
    backButton: 'Zurück zur Homepage',
  },
  stepInstitutionType: {
    title: 'Wähle die Art der Körperschaft, die du <1/> vertrittst',
    subtitle: 'Gib die Art der Körperschaft an, die <1>{{productName}} beitreten wird</1>',
    institutionTypes: {
      pa: {
        title: 'Öffentliche Verwaltung',
        description: 'Art. 2, Absatz 2, Buchstabe A del digitalen Verwaltungscodes CAD',
      },
      pa_ced: {
        title: 'Öffentliche Körperschaften',
      },
      gsp: {
        title: 'Betreiber öffentlicher Dienstleistungen',
        description: 'Art. 2, Absatz 2, Buchstabe B del digitalen Verwaltungscodes CAD',
      },
      scec: {
        title: 'Società in conto economico consolidato',
      },
      gpu: {
        title: 'Manager von öffentlichen Versorgungsbetrieben und/oder von allgemeinem Interesse',
        description: 'Kreditinstitute nehmen optional teil',
      },
      scp: {
        title: 'Öffentliche kontrollierte Gesellschaft',
        description: 'Art. 2, Absatz 2, Buchstabe C del digitalen Verwaltungscodes CAD',
      },
      pt: {
        title: 'Technologischer Partner',
        description: `Ai sensi di IO - Paragrafo 6.1.3 delle "Linee Guida sul punto di accesso telematico ai servizi della Pubblica Amministrazione" emanate da AgID ai sensi dell'art- 64-bis del CAD`,
      },
      psp: {
        title: 'Zahlungsverkehrsdienstleister',
      },
      sa: {
        title: 'Privater Betreiber einer E-Beschaffungsplattform',
      },
      as: {
        title: 'Versicherungsgesellschaft',
      },
      prv: {
        title: 'Private',
      },
      prv_ced: {
        title: 'Private Körperschaften',
      },
      oth: {
        title: 'Sonstiges',
        description: 'Freiwillig beigetretene forderungsberechtigte Körperschaft',
      },
    },
    infoAlert: {
      ced: 'PagoPA S.p.A. mette a disposizione la piattaforma per la gestione delle adesioni. Non partecipa alla Convenzione e non è responsabile della sua esecuzione.',
    },
    backLabel: 'Zurück',
    confirmLabel: 'Weiter',
  },
  onboardingFormData: {
    title: 'Gib die Daten der Körperschaft ein',
    pspAndProdPagoPATitle: 'Daten eingeben',
    backLabel: 'Zurück',
    confirmLabel: 'Weiter',
    closeBtnLabel: 'Schließen',
    billingDataPt: {
      title: 'Daten eingeben',
      subTitle:
        'Geben Sie die erforderlichen Informationen ein und stellen Sie sicher, dass sie korrekt sind.<1 /> Sie werden verwendet, um Sie als technologischen Partner für das Produkt <3 /><5>{{nameProduct}}</5> zu registrieren.',
    },
    pspDashboardWarning:
      'Um die vorhandenen Daten zu aktualisieren, kontaktieren Sie den <1>Support</1>-Service.',
    billingDataSection: {
      invalidFiscalCode: 'Die Steuernummer ist ungültig',
      invalidTaxCodeInvoicing:
        'Die eingegebene Steuernummer bezieht sich nicht auf Ihre Körperschaft.',
      invalidZipCode: 'Die PLZ ist ungültig',
      invalidVatNumber: 'Die USt-IdNr ist ungültig',
      invalidEmail: 'Die E-Mail-Adresse ist ungültig',
      invalidReaField: 'Das Feld REA ist ungültig',
      invalidMailSupport: 'Die E-Mail-Adresse ist ungültig',
      invalidShareCapitalField: 'Das Feld Stammkapital ist ungültig',
      recipientCodeMustBe6Chars: 'Der Code muss mindestens 6 Zeichen sein.',
      invalidRecipientCodeNoAssociation:
        'Der eingegebene Code ist nicht mit Ihrer Körperschaft verknüpft.',
      invalidRecipientCodeNoBilling:
        'Der eingegebene Code ist dem Steuernummer eines Körperschaft zugeordnet, das den Abrechnungsservice nicht aktiviert hat.',
      vatNumberAlreadyRegistered: 'Die eingegebene USt-IdNr. wurde bereits registriert.',
      vatNumberVerificationErrorTitle: 'Die Prüfung ist fehlgeschlagen',
      vatNumberVerificationErrorDescription:
        'Die Überprüfung der USt-IdNr. ist derzeit nicht möglich. Bitte versuchen Sie es später erneut.',
      centralPartyLabel: 'Zentrale Körperschaft',
      businessName: 'Firmenbezeichnung',
      aooName: 'AOO-Bezeichnung',
      uoName: 'UO-Bezeichnung',
      aooUniqueCode: 'Eindeutiger AOO-Code',
      uoUniqueCode: 'Eindeutiger UO-Code',
      fullLegalAddress: 'Adresse und Hausnummer des Rechtssitzes',
      zipCode: 'PLZ',
      city: 'Stadt',
      noResult: 'Kein Ergebnis',
      county: 'Provinz',
      country: 'Land',
      digitalAddress: 'PEC-Adresse',
      taxCodeEquals2PIVAdescription: 'Die USt.-IdNr. ist mit der Steuernummer identisch',
      partyWithoutVatNumber: 'Meine Körperschaft hat keine USt.-IdNr.',
      partyWIthoutVatNumberSubtitle:
        'Geben Sie nur die Steuernummer ein, wenn Ihre Körperschaft nicht als Unternehmen, als Künstler oder als Fachperson tätig ist,\n' +
        '      <1 />(vgl. Art. 21, Absatz 2, Buchstabe f, DPR Nr. 633/1972)',
      vatNumberGroup: 'Die USt.-IdNr. ist die einer Gruppe.',
      taxCode: 'Steuernummer',
      taxCodeCentralParty: 'Steuernummer der zentralen Körperschaft',
      vatNumber: 'USt.-IdNr.',
      taxCodeInvoicing: 'SFE-Steuernummer',
      originId: 'IVASS-Code',
      sdiCode: 'SDI-Code',
      sdiCodePaAooUo: 'Eindeutiger oder SDI-Code',
      sdiCodePaAooUoDescription:
        'Es ist der eindeutige Code, der zum Empfang elektronischer Rechnungen erforderlich ist. Es kann der Code Ihrer Behörde oder ihrer Organisationseinheit sein.',
      recipientCodeDescription:
        'Dieser Code ist für den Empfang elektronischer Rechnungen notwendig',
      gspDescription:
        'Ich bin Betreiber mindestens eines der folgenden öffentlichen Dienste: Gas, Energie, Telekommunikation.',
      pspDataSection: {
        commercialRegisterNumber: 'Eintragungsnummer in das Handelsregister',
        invalidCommercialRegisterNumber:
          'Die Eintragungsnummer in das Handelsregister ist ungültig',
        registrationInRegister: 'Eintragung im Register',
        registerNumber: 'Nummer des Registers',
        invalidregisterNumber: 'Die Nummer des Registers ist ungültig',
        abiCode: 'ABI-Code',
        invalidabiCode: 'Der ABI-Code ist ungültig',
      },
      informationCompanies: {
        commercialRegisterNumber: 'Eintragungsort in das Handelsregister (fakultativ)',
        requiredRea: 'REA',
        rea: 'REA (fakultativ)',
        shareCapital: 'Stammkapital (fakultativ)',
        requiredCommercialRegisterNumber:
          'Ort der Eintragung in das Handelsregister (erforderlich)',
        requiredShareCapital: 'Stammkapital',
        shareCapitalHelper: 'Nur auszufüllen für Kapitalgesellschaften.',
      },
      assistanceContact: {
        supportEmail: 'E-Mail-Adresse für Bürger sichtbar',
        supportEmailOptional: 'E-Mail-Adresse für Bürger sichtbar (fakultativ)',
        supportEmailDescriprion:
          'Dies ist der Kontakt, den Bürger sehen, um Unterstützung von der Körperschaft zu beantragen.',
      },
    },
    taxonomySection: {
      title: 'GEOGRAFISCHES GEBIET ANGEBEN',
      nationalLabel: 'National',
      localLabel: 'Lokal',
      infoLabel:
        'Wählen Sie das Gebiet, in dem Ihre Körperschaft tätig ist. Bei lokaler Ausführung können Sie ein oder mehrere Zuständigkeitsbereiche auswählen. Wenn die Körperschaft bereits zu anderen PagoPA-Produkten beigetreten ist, finden Sie das Gebiet bereits festgelegt.',
      localSection: {
        addButtonLabel: 'Gebiet hinzufügen',
        inputLabel: 'Gemeinde, Provinz oder Region',
      },
      error: {
        notMatchedArea: 'Wählen Sie einen Ort aus der Liste.',
      },
      modal: {
        addModal: {
          title: 'Du fügst weitere Gebiete für deine Körperschaft hinzu',
          description:
            'Die geografischen Gebiete werden zu allen PagoPA-Produkten hinzugefügt, zu denen die Körperschaft bereits beigetreten ist. Möchten Sie fortfahren?',
          confirmButton: 'Weiter',
          backButton: 'Zurück',
        },
        modifyModal: {
          title: 'Du bearbeitest das geografische Gebiet deiner Körperschaft',
          description:
            'Die Änderung wird auf alle PagoPA-Produkte angewendet, zu denen die Körperschaft bereits beigetreten ist. Möchten Sie fortfahren?',
          confirmButton: 'Weiter',
          backButton: 'Zurück',
        },
      },
    },
    dpoDataSection: {
      dpoTitle: 'KONTAKTE DES DATENSCHUTZBEAUFTRAGTEN',
      dpoAddress: 'Adresse',
      dpoPecAddress: 'PEC-Adresse',
      dpoEmailAddress: 'E-Mail-Adresse',
    },
    ibanSection: {
      title: 'INSERISCI IBAN PER RICEVERE I RIMBORSI',
      subTitle:
        'Um sicherzustellen, dass die Überweisung erfolgreich ist, stellen Sie sicher, dass <1>die IBAN mit den in Ihren Kontoangaben angegebenen Informationen übereinstimmt.</1>',
      holder: 'Intestatario',
      iban: 'IBAN',
      confirmIban: 'Conferma IBAN',
      error: {
        invalidIban: 'Geben Sie eine gültige IBAN ein.',
        ibanNotMatch: 'Die IBAN stimmt nicht überein.',
      },
    },
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Beitrittsantrag gelöscht',
        description:
          'Auf der Startseite des Administrationsbereichs können Sie die verfügbaren Produkte sehen <1 />und die Anmeldung für Ihre Körperschaft anfordern.',
        backActionLabel: 'Zurück zur Homepage',
      },
      error: {
        title: 'Etwas ist schiefgelaufen.',
        description:
          'Aufgrund eines Systemfehlers kann das Verfahren nicht abgeschlossen werden. <1 /> Bitte versuchen Sie es später erneut.',
        backActionLabel: 'Zurück zur Homepage',
      },
      verify: {
        loadingText: 'Wir prüfen gerade deine Daten',
      },
      delete: {
        loadingText: 'Wir löschen Ihre Registrierung.',
      },
      jwtNotValid: {
        title: 'Beitrittsantrag nicht mehr <1 /> gültig',
        subtitle: 'Dieser Antrag wurde bewilligt, widerrufen oder ist abgelaufen.',
        backActionLabel: 'Zurück zur Homepage',
      },
    },
    confirmCancellatione: {
      title: 'Möchtest du den <1 /> Beitrittsantrag löschen?',
      subtitle: 'Wenn Sie diesen löschen, gehen alle eingegebenen Daten verloren. ',
      confirmActionLabel: 'Antrag löschen',
      backActionLabel: 'Zurück zur Homepage',
    },
  },
  app: {
    sessionModal: {
      title: 'Sitzung abgelaufen',
      message: 'Sie werden zur Anmeldeseite weitergeleitet...',
    },
  },
};
