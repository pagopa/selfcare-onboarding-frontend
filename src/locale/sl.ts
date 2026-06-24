export default {
  asyncAutocomplete: {
    noResultsLabel: 'Brez rezultatov',
    lessThen3CharacterLabel: 'Vnesite vsaj 3 znake',
    lessThen11CharacterLabel: 'Vnesite vsaj 11 znake',
    searchLabel: 'Poiščite organizacijo',
    aooLabel: 'Vnesite edinstveno kodo AOO',
    uoLabel: 'Vnesite edinstveno kodo UO',
    ariaLabel: 'Vrsta iskanja subjekta',
    clearIconAriaLabel: 'Prekliči izbiro subjekta',
    businessName: 'Naziv podjetja',
    taxcode: 'Davčna številka organizacije',
    originId: 'Koda IVASS',
    reaLabel: 'RM-123456',
    searchResultsLabel: 'Najdeni subjekti'
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Išči po',
    businessName: 'Naziv podjetja',
    ivassCode: 'Koda IVASS',
    taxCode: 'Davčna številka organizacije',
    aooCode: 'Edinstvena koda AOO',
    uoCode: 'Edinstvena koda UO',
    reaCode: 'Koda REA',
    personalTaxCode: 'Davčna številka za individualno dejavnost'
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Prenesite pogodbo o članstvu',
          description: 'Za dokončanje naročnine prenesite pogodbo in pridobite digitalni podpis v <1 /><2>obliki p7m</2> od pravnega zastopnika organizacije.',
          downloadContract: 'Prenesite pogodbo'
        },
        attachments: {
          title: 'Prenesite addendum',
          description: 'Prenesite addendum in digital podpis v <2>p7m</2> obliki.',
          downloadContract: 'Prenesite dokument'
        },
        user: {
          title: 'Prenesite obrazec za dodatek',
          description: 'Ko ste podpisali obrazec, sledite navodilom za pošiljanje in dokončanje <1 /> dodajanja enega ali več skrbnikov.',
          downloadContract: 'Prenesite obrazec'
        },
        disclaimerAttachments: 'Pogodbo lahko podpiše pravni zastopnik ali pooblaščenec.',
        disclaimer: 'Z podpisom pogodbe pravni zastopnik organizacije izrecno in posebej sprejme tudi posamezne klavzule navedene v odstavku "Klavzule v skladu z 1341. in 1342. členom c.c."'
      },
      upload: {
        product: {
          title: 'Naložite podpisano pogodbo',
          description: 'Ko ste podpisali pogodbo, sledite navodilom za pošiljanje in dokončanje <1 /> naročnine na izbrani produkt. Ne pozabite naložiti pogodbe <3>v 30 dneh.</3>'
        },
        attachments: {
          title: 'Naložite podpisan addendum',
          description: 'Ko ste digitalno podpisali dokument, ga naložite za dokončanje <1 />naročnine.'
        },
        user: {
          title: 'Naložite podpisan obrazec',
          description: 'Ko ste podpisali obrazec, sledite navodilom za pošiljanje in dokončanje <1 /> dodajanja enega ali več skrbnikov.'
        },
        goToUpload: 'Pojdite na nalaganje'
      }
    },
    upload: {
      product: {
        title: 'Naložite pogodbo o članstvu',
        description: 'Naložite pogodbo o članstvu, podpisano digitalno v <1 />p7m s strani pravnega zastopnika.',
        dropArea: {
          title: 'Podpisano pogodbo o članstvu povlecite sem ali',
          link: 'naložite datoteko'
        }
      },
      user: {
        title: 'Naložite obrazec',
        description: 'Naložite obrazec za dodatek, podpisan digitalno v <1 />p7m s strani pravnega zastopnika.',
        dropArea: {
          title: 'Povlecite podpisan obrazec sem ali',
          link: 'naložite datoteko'
        },
        continue: 'Nadaljuj'
      },
      attachments: {
        title: 'Naložite dokument',
        description: 'Naložite digitalno podpisan addendum v p7m',
        dropArea: {
          title: 'Povlecite podpisan dokument sem ali',
          link: 'izberite s svojega računalnika'
        }
      },
      continue: 'Nadaljuj',
      error: {
        title: 'Nalaganje ni uspelo',
        description: 'Nalaganje dokumenta ni bilo uspešno. <1 />Naložite samo eno datoteko v obliki <3>p7m</3>.',
        close: 'Izhod',
        retry: 'Ponovno naloži'
      }
    }
  },
  fileUploadPreview: {
    loadingStatus: 'Nalaganje ...',
    labelStatus: 'Pripravljeno za pošiljanje',
    cleanIcon: 'Izbriši naloženo datoteko'
  },
  inlineSupportLink: {
    assistanceLink: 'obrnite se na podporo'
  },
  moreInformationOnRoles: 'Več informacij o vlogah',
  onboardingStep0: {
    title: 'Dobrodošli na portalu za samopomoč',
    description: 'V samo nekaj korakih se bo vaša organizacija lahko pridružila in upravljala vse produkte PagoPA.',
    privacyPolicyDescription: 'Prebral/-a sem in razumel/-a',
    privacyPolicyLink: 'Izjavo o varstvu podatkov ter Pravila in pogoje uporabe storitve',
    actionLabel: 'Nadaljuj'
  },
  stepVerifyOnboarding: {
    loadingText: 'Preverjamo vaše podatke',
    ptAlreadyOnboarded: {
      title: 'Partner je že registriran',
      description: 'Če želite delati s produktom, prosite skrbnika, da vas <1/> doda v razdelku Uporabniki.',
      backAction: 'Zapri'
    },
    alreadyOnboarded: {
      title: 'Izbrana organizacija se je že prijavila',
      description: 'Če želite delati s produktom, prosite skrbnika, da vas <1/>doda v razdelku Uporabniki.',
      addNewAdmin: 'Ali trenutni skrbniki niso več na voljo in potrebujete upravljanje produktov? <3>Dodajte novega skrbnika</3>',
      backHome: 'Vrni se domov'
    },
    genericError: {
      title: 'Nekaj ​​je šlo narobe',
      description: 'Zaradi sistemske napake ni mogoče dokončati <br />postopka. Prosimo vas, da poskusite pozneje.',
      backHome: 'Vrni se domov'
    },
    userNotAllowedError: {
      title: 'Na ta produkt se ne morete naročiti',
      description: 'V tem trenutku organizacija <1>{{partyName}}</1> ne more pristopiti k <3>{{productTitle}}</3>. <5 /> Kontaktirajte <7>podporo</7> za več informacij.',
      noSelectedParty: 'navedeno',
      backToHome: 'Vrni se domov'
    }
  },
  onboardingStep1: {
    loadingOverlayText: 'Preverjamo vaše podatke',
    onboarding: {
      bodyTitle: 'Poiščite svojo organizacijo',
      codyTitleSelected: 'Potrdite izbrano organizacijo',
      disclaimer: {
        description: 'Trenutno se lahko samo <1>javne <3 /> lokalne uprave</1> na IPA prijavijo na SEND preko varnega območja, ki jih najdete na <5>tej povezavi</5>.'
      },
      bodyDescription: 'Vnesite enega od zahtevanih podatkov in poiščite indeks javne uprave (IPA) za organizacijo, za katero želite zahtevati naročnino na <3/><4>{{productTitle}}</4>.',
      aggregator: 'Sem združevalna organizacija',
      aggregatorModal: {
        title: 'Združevalna organizacija',
        message: 'Zahtevate naročnino kot agregirajući subjekt za <1>{{partyName}}</1>.<3 />Za dokončanje naročnine morate navesti subjekte za agregiranje.',
        back: 'Nazaj',
        forward: 'Nadaljuj'
      },
      ipaDescription: 'Ne najdete svoje organizacije v IPA? <1>Na tej strani</1> najdete več <3/> informacij o indeksu in kako se akreditirati',
      selectedInstitution: 'Nadaljujte z naročnino na <1>{{productName}}</1> za izbrano organizacijo',
      gpsDescription: 'Ne najdete svoje organizacije v IPA?<1 /><2>Ročno vnesite podatke svoje organizacije.</2>',
      saSubTitle: 'Če ste med zasebnimi upravljavci platform e-javnih naročil in ste že <1/> prejeli <3>certifikacijo od AgID</3>, vnesite enega od zahtevanih podatkov in poiščite organizacijo, za katero želite zahtevati naročnino na <1/> <5>{{productName}}.</5>',
      asSubTitle: 'Če ste zavarovalnica, navedena v registru zavarovalnic IVASS, vnesite enega od zahtevanih podatkov in poiščite organizacijo, za katero <1/> želite zahtevati naročnino na <3>{{productName}}.</3>',
      scpSubtitle: 'Vnesite enega od zahtevanih podatkov in poiščite v InfoCamere organizacijo <3/> za katero želite zahtevati naročnino na <5>{{productName}}.</5>',
      merchantSubtitle: 'Vnesite enega od zahtevanih podatkov za iskanje na InfoCamere organizacije <3/> za katero želite zahtevati naročnino na <5>{{productName}}.</5>',
      merchantAtecoValid: 'Če ste del trgovske verige, mora naročnino izvršiti matična družba.',
      merchantAtecoNotValid: 'Navedena organizacija se ne more naročiti, ker njena koda ATECO ne spada med dovoljene.',
      merchantCompanyStatusDisabled: 'Vaša družba ne more dostopati do portala, ker je v likvidaciji ali ustavljenih dejavnostih',
      asyncAutocomplete: {
        placeholder: 'Iskanje'
      },
      onboardingStepActions: {
        confirmAction: 'Nadaljuj',
        backAction: 'Nazaj'
      }
    }
  },
  stepUploadAggregates: {
    title: 'Navedite agregirane subjekte za {{productName}}',
    subTitle: 'Prenesite primer datoteke, ga izpolnite po navodilih in naložite dokument za dodajanje/deklariranje agregiranih subjektov.',
    findOutMore: 'Ste v dvomih? Pojdite na priročnik',
    errors: {
      onCsv: {
        title: 'Datoteka vsebuje eno ali več napak',
        description: '<1>Prenesite poročilo</1> za preverjanje podatkov in ponovno naložite datoteko.'
      },
      invalidFormat: {
        title: 'Format datoteke ni veljaven',
        description: 'Naložite lahko samo datoteke v obliki zapisa .csv'
      }
    },
    dropArea: {
      title: 'Datoteko .csv s seznamom agregirane organizacije povlecite sem ali',
      button: 'naložite datoteko'
    },
    downloadExampleCsv: 'Ne veste, kako pripraviti datoteko? <1>Prenesite primer</1>',
    back: 'Nazaj',
    forward: 'Nadaljuj'
  },
  stepAddManager: {
    title: 'Navedite pravnega zastopnika',
    subTitle: {
      flow: {
        base: 'Vnesite podatke pravnega zastopnika vaše organizacije. <1/> Odgovoren bo za podpis pogodbe za <3>{{productTitle}}</3> <4/> in bo imel vlogo skrbnika za ta produkt na varnem območju.',
        premium: 'Vnesite podatke pravnega zastopnika vaše organizacije. <1/> Oseba, ki jo navedete, bo signatar pogodbe za <3>{{subProductTitle}}<3/>.',
        addNewUser: 'Oseba, ki jo navedete, bo podpisala obrazec za dodajanje novega skrbnika in ga <1 />odobrila za delo na produktu <3>{{productTitle}}</3> za vašo organizacijo.'
      }
    },
    changedManager: {
      title: 'Dodajate pravnega zastopnika',
      message: 'Podatki pravnega zastopnika, ki ste jih vnesli, se razlikujejo od tistih, navedenih v <1 />prejšnje. Ali želite nadaljevati?'
    },
    formControl: {
      label: 'Dodaj me kot pravnega zastopnika'
    },
    back: 'Nazaj',
    continue: 'Nadaljuj'
  },
  stepAddDelegates: {
    title: 'Navedite skrbnika',
    description: {
      flow: {
        onboarding: 'Dodate lahko enega do tri skrbnike ali njihove pooblaščence. <1/> Odgovorni bodo za upravljanje <3>{{productTitle}}</3> in prisotni v pogodbi <4 />naročnine kot pooblaščenci pravnega zastopnika.',
        pt: 'Dodate lahko enega do tri skrbnike ali njihove pooblaščence.<1/> V imenu organizacij bodo upravljali upravljanje uporabnikov in produktov.',
        addNewUser: 'Dodate lahko skrbnika ali njegovega pooblaščenca. Dodate lahko tudi osebo, ki ste jo že navedli kot pravnega zastopnika. Če dodate osebo, ki je že prisotna z drugo vlogo za ta produkt, bo dodana kot skrbnik.'
      }
    },
    addUserLabel: 'DODAJTE DRUGEGA SKRBNIKA',
    addUserLink: 'Dodajte drugega skrbnika',
    backLabel: 'Nazaj',
    confirmLabel: 'Nadaljuj',
    formControl: {
      label: 'Dodaj me kot skrbnika'
    },
    removeUser: 'Odstranite dodatnega skrbnika'
  },
  stepAddApplicantEmail: {
    title: 'Navedite svojo e-pošto',
    description: 'Vnesite svojo e-pošto, da boste prejeli potrdilo, ko bo vaša prošnja obdelana <1/> uspešno',
    applicantName: 'Ime',
    applicantSurname: 'Priimek',
    applicantEmail: 'E-pošta',
    backLabel: 'Nazaj',
    confirmLabel: 'Nadaljuj'
  },
  additionalGpuDataPage: {
    title: 'Vnesite dodatne podrobnosti',
    subTitle: 'Izberite možnost, ki opisuje vašo organizacijo.',
    firstBlock: {
      yes: 'Od',
      no: 'Ne',
      question: {
        isPartyRegistered: 'Je organizacija vpisana v register, albo ali seznam?',
        subscribedTo: 'Vpisan v:',
        isPartyProvidingAService: 'Ali organizacija opravlja storitev za državljane?',
        gpuRequestAccessFor: 'Za katere storitve javne koristi in/ali splošnega interesa organizacija zahteva dostop?',
        longTermPayments: 'Je pogostnost plačil neprekinjena?'
      },
      placeholder: {
        registerBoardList: 'Register/Albo/Seznam',
        answer: 'Odgovor',
        numberOfSubscription: 'Številka vpisa'
      },
      errors: {
        requiredField: 'Zahtevano polje'
      }
    },
    secondBlock: {
      title: 'Pravni zastopnik zahtevajuče organizacije nepreklicno izjavlja in potrjuje:',
      boxes: {
        first: 'da ima pooblastilo, da deluje v imenu in za račun zahtevajuče organizacije;',
        second: 'da ima organizacija s svojim pravnim zastopnikom in svojimi vodilnimi zaposlenimi vse pravne pooblastila za opravljanje dejavnosti, na katero se nanaša prošnja;',
        third: 'da se pravni zastopnik in vodje zahtevajuče organizacije ne nahajajo v nobeni od okoliščin, navedenih v členih 94 in 95 zakona D.Lgs. št. 36/2023;',
        fourth: 'da niso v teku nobeni postopki za uporabo ukrepov varnosti pred preprekami iz člena 6 zakona D.Lgs. 159/2011 in da ne obstajajo nobene ovire iz člena 67 zakona D.Lgs. 159/2011;',
        fifth: 'da zahtevajuča organizacija ni prejemnica sodnih odločb niti ni vključena v tekoče postopke, ki comportajo uporabo sankcij iz dekreta z dne 8. junija 2001, št. 231.'
      },
      legalBlockFooterInfo: 'Izjave v tem dokumentu so izdane v skladu s členom 46 dekreta D.P.R. 28.12.2000 št. 445. V primeru lažnih izjav se uporabijo sankcije, tudi kazenske narave, kot so predvidene in kot se kaznuje v D.P.R. 28.12.2000 št. 445.'
    }
  },
  additionalDataPage: {
    title: 'Vnesite dodatne podrobnosti',
    subTitle: 'Izberite možnost, ki opisuje vašo organizacijo. Če ni nobena ustrezna, izberite "Drugo" in <1 /> vnesite več podrobnosti.',
    formQuestions: {
      textFields: {
        labels: {
          note: 'Opomba',
          ipa: 'Vnesite referenčno kodo IPA'
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'Niste vnesli opombe',
          fromBelongsRegulatedMarket: 'Niste vnesli opombe',
          isFromIPA: 'Vnesite referenčno kodo IPA',
          isConcessionaireOfPublicService: 'Niste vnesli opombe',
          optionalPartyInformations: 'Zahtevano polje'
        }
      },
      estabilishedRegulatoryProvision: 'Organizacija je družba, ki jo je vzpostavil pravni akt',
      belongsRegulatedMarket: 'Organizacija je del reguliranega trga (npr. energija, plin, voda, <1 />prevoz, poštne storitve itd.)',
      registratedOnIPA: 'Organizacija je registrirana na IPA',
      concessionaireOfPublicService: 'Organizacija je koncesionar javne storitve',
      other: 'Drugo',
      optionalPartyInformations: 'Tukaj napišite informacije o svoji organizaciji'
    },
    options: {
      yes: 'Od',
      no: 'Ne'
    },
    addNote: 'Dodajte opombo',
    allowedCharacters: 'Največ 300 znakov'
  },
  addUser: {
    title: 'Dodajte novega <1 /> skrbnika',
    subTitle: 'Navedite, za kateri produkt želite dodati novega <1 /> skrbnika',
    stepSelectProduct: {
      title: 'IZBERITE PRODUKT'
    }
  },
  platformUserForm: {
    helperText: 'Polje ni veljavno',
    fields: {
      name: {
        label: 'Ime',
        errors: {
          conflict: 'Ime je napačno ali se razlikuje od davčne številke'
        }
      },
      surname: {
        label: 'Priimek',
        errors: {
          conflict: 'Priimek je napačen ali se razlikuje od davčne številke'
        }
      },
      taxCode: {
        label: 'Davčna številka',
        errors: {
          invalid: 'Vnesena davčna številka je neveljavna',
          duplicate: 'Vnesena davčna številka že obstaja'
        }
      },
      email: {
        label: 'Overjen e-poštni naslov',
        errors: {
          invalid: 'E-poštni naslov je neveljaven',
          invalidPec: 'Naslov PEC ni sprejemljiv. Vnesite overjen e-poštni naslov, ki se uporablja za organizacijo',
          duplicate: 'Vneseni e-poštni naslov že obstaja',
          conflict: 'Vneseni e-poštni naslov ne ustreza prejšnjemu'
        },
        description: 'Vnesite overjen e-poštni naslov, ki se uporablja za organizacijo. Naslovi PEC niso sprejemljivi'
      }
    }
  },
  completeRegistration: {
    sessionModal: {
      onConfirmLabel: 'Ponovno naloži',
      onCloseLabel: 'Izhod'
    },
    steps: {
      step0: {
        label: 'Naložite Akt o članstvu'
      },
      step1: {
        label: 'Naložite Akt o članstvu'
      }
    },
    request: {
      notFound: {
        title: 'Stran, ki ste jo iskali, ni na voljo',
        description: 'V tem trenutku ni mogoče nadaljevati. Poskusite čez nekaj <1 />minut ali kontaktirajte podporo',
        contactAssistanceButton: 'Obrnite se na podporo'
      },
      expired: {
        product: {
          title: 'Vaša prošnja za članstvo je potekla',
          description: 'Preteklo je več kot 30 dni od prošnje za članstvo. Če želite še vedno pristopiti k produktu {{productTitle}}, pošljite <4 />novo prošnjo.'
        },
        user: {
          title: 'Prošnja je potekla',
          description: 'Preteklo je več kot 30 dni od prošnje za dodajanje <2 />skrbnika. Za nadaljevanje pošljite novo <2 /> prošnjo.'
        },
        backHome: 'Vrni se domov'
      },
      alreadyCompleted: {
        product: {
          title: 'Prošnja za članstvo je bila sprejeta'
        },
        user: {
          title: 'Prošnja je že sprejeta'
        },
        description: 'Za upravljanje produkta se prijavite s pomočjo SPID ali CIE',
        logIn: 'Prijava'
      },
      alreadyRejected: {
        product: {
          title: 'Prošnja za članstvo je bila preklicana',
          description: 'Prošnja za članstvo ni bila uspešna. Če želite še vedno pristopiti k produktu {{productTitle}}, pošljite <4 />novo prošnjo.'
        },
        user: {
          title: 'Prošnja ni več veljavna',
          description: 'Vaša organizacija je preklicala prošnjo. Če želite dodati novega skrbnika, pošljite novo.'
        },
        backHome: 'Vrni se domov'
      }
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Članstvo je zaključeno!',
          description: 'Obvestilo o članstvu bomo poslali na primarni naslov PEC organizacije. Od tega trenutka je mogoče dostopati do varnega območja.'
        },
        user: {
          title: 'Zahteva je zaključena',
          description: 'Od tega trenutka mogu navedeni skrbniki dostopati do varnega območja.'
        },
        attachments: {
          title: 'Nalaganje zaključeno',
          description: 'Pravilno ste se naročili na novi addendum DORA.',
          link: 'Pojdite v razdelak dokumentov'
        },
        backHome: 'Vrni se domov'
      },
      error: {
        title: 'Nalaganje ni uspelo',
        description: 'Nalaganje dokumenta ni bilo uspešno.',
        backToUpload: 'Ponovno naloži'
      }
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Preverite dokument',
        product: {
          message: 'Naloženi dokument ne ustreza Aktu o članstvu. Preverite, ali je pravilen, in ga znova naložite.'
        },
        user: {
          message: 'Naloženi dokument se ne ujema z obrazcem, ki ste ga prejeli po e-pošti. Preverite, ali je pravilen, in ga ponovno naložite.'
        }
      },
      INVALID_SIGN: {
        title: 'Preverite dokument',
        product: {
          message: 'Digitalni podpis ni mogoče povezati s pravnim zastopnikom, navedenimi v času naročnine. Preverite ujemanje in ponovno naložite dokument.'
        },
        user: {
          message: 'Digitalni podpis ni mogoče povezati s pravnim zastopnikom, navedenimi v času zahteve. Preverite ujemanje in ponovno naložite dokument.'
        }
      },
      ALREADY_ONBOARDED: {
        title: 'Izbrana organizacija se je že prijavila',
        message: 'Če želite delati s produktom, prosite skrbnika, da vas <1 />doda v razdelku Uporabniki.'
      },
      GENERIC: {
        title: 'Nalaganje ni uspelo',
        message: 'Nalaganje dokumenta ni bilo uspešno. Pojdite nazaj in ga ponovno naložite.'
      },
      INVALID_SIGN_FORMAT: {
        title: 'Nalaganje ni uspelo',
        message: 'Nalaganje dokumenta ni bilo uspešno. <1 />Naložite samo eno datoteko v obliki <3>p7m</3>.'
      }
    }
  },
  noProductPage: {
    title: 'Žal, nekaj je šlo narobe.',
    description: 'Želenega produkta ni mogoče najti'
  },
  onboarding: {
    success: {
      flow: {
        product: {
          title: 'Zahteva za članstvo je poslana',
          publicAdministration: {
            description: 'Poslali bomo e-pošto na primarni naslov PEC organizacije. <1 /> Vsebuje navodila za dokončanje <3 />naročnine.'
          },
          notPublicAdministration: {
            description: 'Poslali bomo e-pošto na navedeni naslov PEC. <1 /> Vsebuje navodila za dokončanje <3 />naročnine.'
          }
        },
        techPartner: {
          title: 'Prošnja za registracijo je poslana',
          description: 'Poslali bomo e-pošto z rezultatom prošnje na navedeni <1 />naslov PEC.'
        },
        user: {
          title: 'Poslali ste zahtevo',
          description: 'Poslali bomo e-pošto na primarni naslov PEC organizacije. <1 /> Vsebuje navodila za dokončanje <3 />postopka.'
        }
      }
    },
    error: {
      title: 'Nekaj je šlo narobe.',
      description: 'Zaradi sistemske napake ni mogoče dokončati <1 />postopka. Prosimo vas, da poskusite pozneje.'
    },
    backHome: 'Vrni se domov',
    sessionModal: {
      title: 'Ali se res želite odjaviti?',
      message: 'Če se odjavite, bo vaša zahteva za članstvo izgubljena.',
      onConfirmLabel: 'Izhod',
      onCloseLabel: 'Prekliči'
    },
    confirmationModal: {
      title: 'Ali potrjujete pošiljanje zahteve?',
      description: {
        flow: {
          base: 'Pošiljate zahtevo za pristop k produktu <1>{{productName}}</1> za organizacijo <3>{{institutionName}}</3>. <5 /> Pogodba o članstvu bo poslana na overjen e-poštni naslov organizacije in jo mora podpisati pravni zastopnik. Prepričajte se, da ste kot zaposleni pooblaščeni za vložitev te zahteve.',
          addNewUser: 'Dodajate novega skrbnika za organizacijo <1>{{institutionName}}</1>. <3 />Organizacija bo prejela obrazec na institucionalni PEC in ga mora podpisati pravni zastopnik, ki ste ga navedli. <3 />Prepričajte se, da ste pooblaščeni s strani organizacije za to zahtevo.'
        }
      },
      confirm: 'Potrdi',
      back: 'Nazaj'
    },
    loading: {
      loadingText: 'Preverjamo vaše podatke'
    },
    phaseOutError: {
      title: 'Nekaj je šlo narobe',
      description: 'Ne morete pristopiti k izbranemu produktu, ker bo kmalu ni več na voljo.',
      backAction: 'Vrni se domov'
    }
  },
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Naročnina je že bila izvedena',
      message: 'Izbrana organizacija je že naročena na ponudbo <1 /><strong>Premium</strong>.',
      closeButton: 'Zapri'
    },
    subProductStepSelectPricingPlan: {
      discountLabelData: '25% popust Do 30. junija 2023',
      title: 'Nadgradite na IO Premium in izboljšajte <1/> delovanje sporočil',
      firstCheckLabel: 'Skrajšajte čas prejema plačil',
      secondCheckLabel: 'Izboljšana učinkovitost izterjav',
      thirdCheckLabel: 'Zmanjšajte neplačane terjatve',
      infoSectionLabel: 'Če je vaša organizacija že naročena na IO, izberite načrt, ki najbolje ustreza njenin potrebam. <1/> Načrt po zvezku je aktivirajte samo enkrat. Ko se konča število sporočil v načrtu <3/> po zvezku, se samodejno aktivira načrt porabe.',
      btnRejectLabel: 'Ne zanima me',
      pricingPlanExitModal: {
        title: 'Se želite odpovedati ponudbam Premium?',
        subtitle: 'Če izstopite, boste nadaljevali z dostopom do varnega območja.',
        closeBtnLabel: 'Izhod',
        confirmBtnLabel: 'Nazaj na ponudbe Premium'
      },
      headerPlanCard: {
        from: 'Od',
        to: 'do',
        beyond: 'Čez',
        mess: '/ sporočilo'
      },
      carnetPlan: {
        caption: 'NAČRT PO ZVEZKU – ENKRATNI',
        discountBoxLabel: '25% popust',
        title: 'Izbirajte med {{carnetCount}} različnimi zvezki, zasnovanimi za vse vaše potrebe',
        showMore: 'Izvedite več',
        showLess: 'Prikaži manj',
        description: 'Ko enkrat izberete zvezek, ga ne morete spremeniti zaradi podpisa pogodbe.',
        carnetLabelsDiscount: {
          c1: 'Prihranite 55 EUR',
          c2: 'Prihranite 543,75 EUR',
          c3: 'Prihranite 2.687,50 EUR',
          c4: 'Prihranite 5.312,50 EUR',
          c5: 'Prihranite 13.125 EUR',
          c6: 'Prihranite 25.625 EUR',
          c7: 'Prihranite 50.000 EUR'
        },
        btnActionLabel: 'Aktivirajte načrt'
      },
      consumptionPlan: {
        caption: 'NAČRT PORABE',
        discountBoxLabel: '25% popust',
        title: 'Izberite plačilo samo za dejanska <1/> sporočila, ki jih pošljete',
        showMore: 'Izvedite več',
        showLess: 'Prikaži manj',
        description: 'Ko aktivirate načrt porabe, ne boste več mogli aktivirati načrta po zvezku.',
        rangeLabelsDiscount: '25% popust',
        btnActionLabel: 'Aktivirajte načrt'
      }
    },
    subProductStepUserUnrelated: {
      title: 'Ne morete se naročiti na {{selectedProduct}}',
      description: 'Vaša organizacija se ni naročila na <strong>{{selectedProduct}}</strong>, ali nimate vloge za upravljanje produkta. <5/> Prosite skrbnika, da vas <1/>doda v razdelku <7/>Uporabniki, ali zahtevajte naročnino na <strong>{{selectedProduct}}</strong> za vašo organizacijo.',
      backHomeLabelBtn: 'Vrni se domov',
      goToBtnLabel: 'Pojdite na članstvo'
    },
    selectUserPartyStep: {
      title: 'Izberite svojo organizacijo',
      subTitle: 'Izberite organizacijo, za katero zahtevate naročnino na <1 />ponudbo <3>{{productName}}</3>',
      searchLabel: 'Iskanje organizacije',
      notFoundResults: 'Brez rezultatov',
      IPAsubTitle: 'Iz indeksa javne uprave (IPA) izberite organizacijo <1/>, za katero želite zahtevati članstvo v {{baseProduct}} Premium',
      helperLink: 'Ne najdete svoje organizacije? <1>Ugotovite zakaj</1>',
      confirmButton: 'Nadaljuj'
    },
    noPartyStep: {
      title: 'Nobena od vaših organizacij ne more <1/> pristopiti',
      subTitle: 'Če v seznamu ne vidite dostopnih organizacij, je iskana organizacija morda že <1/> pristopila k <3>{{productName}}</3>',
      notPartyAvailable: 'Nobena organizacija ni na voljo',
      helperLink: 'Vaša organizacija je pristopila, vendar ni na voljo? <1>Ugotovite zakaj</1>',
      backButton: 'Nazaj'
    },
    genericError: {
      title: 'Nekaj je šlo narobe',
      subTitle: 'Zaradi sistemske napake ni mogoče dokončati postopka. Prosimo vas, da poskusite pozneje.',
      homeButton: 'Vrni se domov'
    },
    successfulAdhesion: {
      title: 'Zahteva za članstvo je bila <1/>uspešno poslana',
      message: 'Na overjen naslov organizacije boste prejeli e-pošto. <1 />Vsebuje navodila za dokončanje <3 /> naročnine na ponudbo <strong>Premium</strong>.',
      closeButton: 'Zapri'
    },
    billingData: {
      subTitle: 'Potrdite, spremenite ali vnesite zahtevane podatke in se prepričajte, da so pravilni. <1 /> Uporabljeni bodo tudi za zahtevo za članstvo pri drugih produktih in za namene obračunavanja.'
    },
    exitModal: {
      title: 'Ali se res želite odjaviti?',
      message: 'Če se odjavite, bo vaša zahteva za članstvo izgubljena.',
      backButton: 'Izhod',
      cancelButton: 'Prekliči'
    },
    loading: {
      loadingText: 'Preverjamo vaše podatke'
    }
  },
  invalidPricingPlan: {
    title: 'Nekaj je šlo narobe',
    description: 'Ne moremo najti strani, ki jo iščete. <1 />Preverite, ali je naslov pravilen, ali se vrnite na domov.',
    backButton: 'Vrni se domov'
  },
  stepInstitutionType: {
    title: 'Izberite vrsto organizacije, ki jo <1/> predstavljate',
    subtitle: 'Navedite vrsto organizacije, ki se bo pridružila <1>{{productName}}</1>',
    institutionTypes: {
      pa: {
        title: 'Javna uprava',
        description: 'člen 2, odstavek 2, črka A CAD'
      },
      pa_ced: {
        title: 'Javni subjekti'
      },
      gsp: {
        title: 'Vodja javne službe',
        description: 'člen 2, odstavek 2, črka B CAD'
      },
      scec: {
        title: 'Podjetje s konsolidirano računovodsko bilanco'
      },
      gpu: {
        title: 'Upravljavec javne storitve in/ali splošnega interesa',
        description: 'Upniške organizacije sodelujejo na prostovoljni osnovi'
      },
      scp: {
        title: 'Družba pod javnim nadzorom',
        description: 'člen 2, odstavek 2, črka C CAD'
      },
      pt: {
        title: 'Tehnološki partner',
        description: 'V skladu z IO - Razdelkom 6.1.3 "Smernic za dostopno točko do storitev javne uprave", ki jih je izdala AgID v skladu s členom 64-bis CAD'
      },
      psp: {
        title: 'Ponudniki plačilnih storitev'
      },
      sa: {
        title: 'Zasebni upravitelj e-javnih naročil'
      },
      as: {
        title: 'Zavarovalnica'
      },
      prv: {
        title: 'Zasebni subjekti'
      },
      prv_ced: {
        title: 'Zasebni subjekti'
      },
      oth: {
        title: 'Drugo',
        description: 'Upniške organizacije sodelujejo na prostovoljni osnovi'
      }
    },
    infoAlert: {
      ced: 'PagoPA S.p.A. mette a disposizione la piattaforma per la gestione delle adesioni. Non partecipa alla Convenzione e non è responsabile della sua esecuzione.'
    },
    backLabel: 'Nazaj',
    confirmLabel: 'Nadaljuj'
  },
  onboardingFormData: {
    title: 'Vnesite podatke o organizaciji',
    pspAndProdPagoPATitle: 'Vnesite podatke',
    backLabel: 'Nazaj',
    confirmLabel: 'Nadaljuj',
    closeBtnLabel: 'Zapri',
    billingDataPt: {
      title: 'Vnesite podatke',
      subTitle: 'Vnesite zahtevane informacije in se prepričajte, da so pravilne. <1 /> Potrebni bodo za registracijo kot tehnološki partner za <3 /> produkt <5>{{nameProduct}}</5>.'
    },
    pspDashboardWarning: 'Za posodobitev obstoječih podatkov se obrnite na <1>storitev pomoči</1>',
    billingDataSection: {
      invalidFiscalCode: 'Davčna številka je neveljavna',
      invalidTaxCodeInvoicing: 'Vnesena davčna številka ni povezana z vašo organizacijo',
      invalidZipCode: 'Poštna številka je neveljavna',
      invalidVatNumber: 'Številka za DDV ni veljavna',
      invalidEmail: 'E-poštni naslov je neveljaven',
      invalidReaField: 'Polje REA ni veljavno',
      invalidMailSupport: 'E-poštni naslov je neveljaven',
      invalidShareCapitalField: 'Polje delniškega kapitala je neveljavno',
      recipientCodeMustBe6Chars: 'Koda mora biti najmanj 6 znakov',
      invalidRecipientCodeNoAssociation: 'Vnesena koda ni povezana z vašo organizacijo',
      invalidRecipientCodeNoBilling: 'Vnesena koda je povezana s davčno številko organizacije, ki nima aktivne storitve obračunavanja',
      vatNumberAlreadyRegistered: 'Številka za DDV, ki ste jo vnesli, je že registrirana.',
      vatNumberVerificationErrorTitle: 'Preverjanje je bilo neuspešno',
      vatNumberVerificationErrorDescription: 'V tem trenutku ni bilo mogoče preveriti številke DDV. Poskusite pozneje.',
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
      partyWIthoutVatNumberSubtitle: 'Vnesite samo davčno številko, če vaša organizacija ne deluje kot podjetje,\n' +
        '      obrt ali profesija <1 />(gl. člen 21, odstavek 2, črka f, dekret predsednika republike št. 633/1972)',
      vatNumberGroup: 'Številka za DDV je skupinska',
      taxCode: 'Davčna številka',
      taxCodeCentralParty: 'Davčna številka osrednje organizacije',
      vatNumber: 'Številka za DDV',
      taxCodeInvoicing: 'Davčna številka SFE',
      originId: 'Koda IVASS',
      sdiCode: 'Koda SDI',
      sdiCodePaAooUo: 'Edinstvena koda ali SDI',
      sdiCodePaAooUoDescription: 'To je edinstvena koda, potrebna za prejemanje elektronskih računov. Lahko je vaše organizacije ali njene organizacijske enote.',
      recipientCodeDescription: 'To je koda, potrebna za prejemanje elektronskih računov',
      gspDescription: 'Sem vodja vsaj ene od javnih služb: Plin, energija, telekomunikacije.',
      pspDataSection: {
        commercialRegisterNumber: 'št. vpisa v poslovni register',
        invalidCommercialRegisterNumber: 'Št. vpisa v poslovni register je neveljaven',
        registrationInRegister: 'Register',
        registerNumber: 'Številka v registru',
        invalidregisterNumber: 'Številka v registru je neveljavna',
        abiCode: 'Koda ABI',
        invalidabiCode: 'Koda ABI je neveljavna'
      },
      informationCompanies: {
        commercialRegisterNumber: 'Kraj vpisa v poslovni register (neobvezno)',
        requiredRea: 'REA',
        rea: 'REA (neobvezno)',
        shareCapital: 'Delniški kapital (neobvezno)',
        requiredCommercialRegisterNumber: 'Kraj vpisa v poslovni register',
        requiredShareCapital: 'Delniški kapital',
        shareCapitalHelper: 'Izpolniti samo za delničarskie družbe'
      },
      assistanceContact: {
        supportEmail: 'E-poštni naslov, viden državljanom',
        supportEmailOptional: 'E-poštni naslov, viden državljanom (neobvezno)',
        supportEmailDescriprion: 'To je stik, ki ga državljani vidijo za zahtevo za pomoč organizaciji'
      }
    },
    taxonomySection: {
      title: 'OZNAČUJE GEOGRAFSKO OBMOČJE',
      nationalLabel: 'Nacionalno',
      localLabel: 'Lokalno',
      infoLabel: 'Izberite območje, na katerem vaša organizacija deluje. Če je lokalno, lahko izberete eno ali več območij pristojnosti. Če se je organizacija že naročila na druge produkte PagoPA, bo območje že nastavljeno.',
      localSection: {
        addButtonLabel: 'Dodajte območje',
        inputLabel: 'Občina, pokrajina ali regija'
      },
      error: {
        notMatchedArea: 'Izberite lokacijo s seznama'
      },
      modal: {
        addModal: {
          title: 'Svoji organizaciji dodajate druga območja',
          description: 'Geografska območja bodo dodana vsem produktom PagoPA, ki se je organizacija že naročila. Ali želite nadaljevati?',
          confirmButton: 'Nadaljuj',
          backButton: 'Nazaj'
        },
        modifyModal: {
          title: 'Spreminjate geografsko območje svoje organizacije',
          description: 'Sprememba bo upoštevana pri vseh produktih PagoPA, ki se je organizacija že naročila. Ali želite nadaljevati?',
          confirmButton: 'Nadaljuj',
          backButton: 'Nazaj'
        }
      }
    },
    dpoDataSection: {
      dpoTitle: 'KONTAKTI POOBLAŠČENE OSEBE ZA VARSTVO PODATKOV',
      dpoAddress: 'Naslov',
      dpoPecAddress: 'Naslov PEC',
      dpoEmailAddress: 'E-naslov'
    },
    ibanSection: {
      title: 'VNESITE IBAN ZA PREJEMANJE POVRAČIL',
      subTitle: 'Da bo nalog za nakazilo uspešen, se prepričajte, da <1>se IBAN ujema z navedenimi podatki vašega računa.</1>',
      holder: 'Imetnik',
      iban: 'IBAN',
      confirmIban: 'Potrdite IBAN',
      error: {
        invalidIban: 'Vnesite veljaven IBAN',
        ibanNotMatch: 'IBAN se ne ujema'
      }
    }
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Zahteva za članstvo je izbrisana',
        description: 'Na domači strani varnega območja lahko vidite dostopne produkte in zahtevate članstvo za svojo organizacijo.',
        backActionLabel: 'Vrni se domov'
      },
      error: {
        title: 'Nekaj je šlo narobe.',
        description: 'Zaradi sistemske napake ni mogoče dokončati postopka. <1 /> Prosimo vas, da poskusite pozneje.',
        backActionLabel: 'Vrni se domov'
      },
      verify: {
        loadingText: 'Preverjamo vaše podatke'
      },
      delete: {
        loadingText: 'Preklicujemo vaše članstvo'
      },
      jwtNotValid: {
        title: 'Zahteva za članstvo ni več <1 /> veljavna',
        subtitle: 'Ta zahteva je bila odobrena, preklicana ali je potekla.',
        backActionLabel: 'Vrni se domov'
      }
    },
    confirmCancellatione: {
      title: 'Ali želite izbrisati zahtevo za <1 /> članstvo?',
      subtitle: 'Če ga izbrišete, bodo vsi vneseni podatki izgubljeni.',
      confirmActionLabel: 'Izbrišite zahtevo',
      backActionLabel: 'Vrni se domov'
    }
  },
  app: {
    sessionModal: {
      title: 'Seja je potekla',
      message: 'Preusmerjeni boste na stran za prijavo...'
    }
  }
};
