export default {
  asyncAutocomplete: {
    noResultsLabel: 'No result',
    lessThen3CharacterLabel: 'Enter at least 3 characters',
    lessThen11CharacterLabel: 'Enter at least 11 characters',
    searchLabel: 'Search for institution',
    aooLabel: 'Enter the univocal AOO code',
    uoLabel: 'Enter the univocal UO code',
    ariaLabel: `Select the institution search type`,
    businessName: 'Company name',
    taxcode: 'Company Tax Code',
    originId: 'IVASS code',
    reaLabel: 'RM-123456',
  },
  partyAdvancedSelect: {
    advancedSearchLabel: 'Search by',
    businessName: 'Company name',
    ivassCode: 'IVASS code',
    taxCode: 'Company Tax Code',
    aooCode: 'Univocal AOO code',
    uoCode: 'Univocal UO code',
    reaCode: 'REA code',
    personalTaxCode: 'Sole proprietorship Tax Code',
  },
  confirmOnboarding: {
    chooseOption: {
      download: {
        product: {
          title: 'Download the membership agreement',
          description: `To complete the membership, download the agreement and have it digitally signed in <1 /><2>p7m format</2> by the institution's Legal Representative.`,
          downloadContract: 'Download the agreement',
        },
        user: {
          title: 'Download the Addition Module',
          description: `To complete the membership, download the Addition Module and have it <1 />digitally signed in <2>p7m format</2> by the institution's Legal Representative.`,
          downloadContract: 'Download the Module',
        },
        disclaimer:
          'By signing the agreement, the institution\'s Legal Representative expressly and specifically accepts the individual clauses indicated in the paragraph "Clauses pursuant to articles 1341 and 1342 of the Italian Civil Code"',
      },
      upload: {
        product: {
          title: 'Upload the signed agreement',
          description: `Once the agreement is signed, follow the instructions to send it and complete <1 /> the membership to the selected product. Remember to upload the agreement <3>within 30 days.</3>`,
        },
        user: {
          title: 'Upload the signed Module',
          description: `Once the Module is signed, follow the instructions to send it and complete <1 /> the addition of one or more Administrators.`,
        },
        goToUpload: 'Go to upload',
      },
    },
    upload: {
      product: {
        title: 'Upload the membership agreement',
        description: `Upload the membership agreement, digitally signed in <1 />p7m by the Legal Representative.`,
        dropArea: {
          title: 'Drag the signed Membership Agreement here or',
          link: 'upload the file',
        },
      },
      user: {
        title: 'Upload the module',
        description: `Upload the Addition Module, digitally signed in <1 />p7m by the Legal Representative.`,
        dropArea: {
          title: 'Drag the signed module here or',
          link: 'upload the file',
        },
        continue: 'Continue',
      },
      continue: 'Continue',
      error: {
        title: 'Upload failed',
        description:
          'The document upload was not successful. <1 />Upload only one file in <3>p7m</3> format.',
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
    assistanceLink: 'contact support',
  },
  moreInformationOnRoles: 'More information about roles',
  onboardingStep0: {
    title: 'Welcome to the Self-care Portal',
    description: 'In a few steps your institution can join and manage all PagoPA products.',
    privacyPolicyDescription: 'I have read and understood',
    privacyPolicyLink: 'the Privacy Policy and Terms and Conditions of Use of the service',
    actionLabel: 'Continue',
  },
  stepVerifyOnboarding: {
    loadingText: 'We are verifying your data',
    ptAlreadyOnboarded: {
      title: 'The Partner is already registered',
      description:
        'To operate on a product, ask an Administrator to <1/> add you in the Users section.',
      backAction: 'Close',
    },
    alreadyOnboarded: {
      title: 'The selected institution has already joined',
      description:
        'To operate on the product, ask an Administrator to <1/>add you in the Users section.',
      addNewAdmin:
        'Are current Administrators no longer available and do you need <1 />to manage products? <3>Add a new Administrator</3>',
      backHome: 'Back to home',
    },
    genericError: {
      title: 'Something went wrong',
      description: `Due to a system error, the procedure cannot be completed. <br />Please try again later.`,
      backHome: 'Back to home',
    },
    userNotAllowedError: {
      title: 'You cannot join this product',
      description: `Currently, the institution <1>{{partyName}}</1> cannot join <3>{{productTitle}}</3>. <5 /> For more details contact <7>support</7>.`,
      noSelectedParty: 'indicated',
      backToHome: 'Back to home',
    },
  },
  onboardingStep1: {
    loadingOverlayText: 'We are verifying your data',
    onboarding: {
      bodyTitle: 'Search for your institution',
      codyTitleSelected: 'Confirm the selected institution',
      disclaimer: {
        description: `Currently only <1>Local Public <3 /> Administrations </1> listed in the IPA that you can find at <5>this link</5> can join SEND through the Reserved Area.`,
      },
      bodyDescription:
        'Enter one of the required data and search the Public Administration <1/> Index (IPA) for the institution for which you want to request membership to <3/><4>{{productTitle}}</4>.',
      aggregator: 'I am an aggregator institution',
      aggregatorModal: {
        title: 'Aggregator institution',
        message: `You are requesting membership as an aggregator institution for <1>{{partyName}}</1>.<3 />To complete the membership, you will need to indicate the institutions to be aggregated.`,
        back: 'Back',
        forward: 'Continue',
      },
      ipaDescription: `Can't find your institution in the IPA? <1>On this page</1> you can find more <3/> information about the index and how to register `,
      selectedInstitution:
        'Continue with membership to <1>{{productName}}</1> for the selected institution',
      gpsDescription: `Can't find your institution in the IPA?<1 /><2>Manually enter your institution's data.</2>`,
      saSubTitle:
        'If you are among the private e-procurement platform operators and have <1/> already obtained <3> certification from AgID </3>, enter one of the required <1/> data and search for the institution for which you want to request membership to <1/> <5>{{productName}}.</5>',
      asSubTitle:
        'If you are an insurance company listed in the IVASS <1/>company Register, enter one of the required data and search for the institution for <1/> which you want to request membership to <3>{{productName}}.</3>',
      scpSubtitle:
        'Enter one of the required data and search InfoCamere for the institution <3/> for which you want to request membership to <5>{{productName}}.</5>',
      merchantSubtitle:
        'Enter one of the required data to search InfoCamere for the institution <3/> for which you want to request membership to <5>{{productName}}.</5>',
      merchantAtecoValid:
        'If you are part of a store chain, membership must be done by the parent company.',
      merchantAtecoNotValid: 'The entered ATECO code is not allowed for membership to the portal',
      merchantCompanyStatusDisabled:
        'Your company cannot join the portal because it is ceased or in liquidation',
      asyncAutocomplete: {
        placeholder: 'Search',
      },
      onboardingStepActions: {
        confirmAction: 'Continue',
        backAction: 'Back',
      },
    },
  },
  stepUploadAggregates: {
    title: `Indicate the aggregated entities for {{productName}}`,
    subTitle:
      'Download the example file, fill it in following the instructions and upload the document to add/declare the institutions to be aggregated.',
    findOutMore: 'Questions? Consult the manual',
    errors: {
      onCsv: {
        title: 'The file contains one or more errors',
        description:
          '<1>Download the report</1> to verify the information and upload the file again.',
      },
      invalidFormat: {
        title: 'The file format is invalid',
        description: 'Only files in .csv format can be uploaded',
      },
    },
    dropArea: {
      title: 'Drag the .csv file with the list of aggregated institutions here or',
      button: 'upload the file',
    },
    downloadExampleCsv: 'Don\'t know how to prepare the file? <1>Download the example</1>',
    back: 'Back',
    forward: 'Continue',
  },
  stepAddManager: {
    title: 'Indicate the Legal Representative',
    subTitle: {
      flow: {
        base: `Enter the Legal Representative's details of your institution. <1/> They will be responsible for signing the contract for <3>{{productTitle}}</3> <4/> and will have the role of Administrator for this product in the Reserved Area.`,
        premium: `Enter the Legal Representative's details of your institution. <1/> The person you indicate will be the signatory of the contract for <3>{{subProductTitle}}<3/>.`,
        addNewUser: `The indicated person will sign the Addition Module for the new Administrator and will <1 />authorize them to operate on the product <3>{{productTitle}}</3> for your institution.`,
      },
    },
    changedManager: {
      title: 'You are adding a Legal Representative',
      message:
        'The Legal Representative data entered is different from that indicated <1 />previously. Do you want to continue?',
    },
    back: 'Back',
    continue: 'Continue',
  },
  stepAddDelegates: {
    title: 'Indicate the Administrator',
    description: {
      flow: {
        onboarding: `You can add from one to three Administrators or their delegates. <1/> They will be responsible for managing <3>{{productTitle}}</3> and will appear in the membership <4 />contract as delegates of the Legal Representative.`,
        pt: 'You can add from one to three Administrators or their delegates.<1/> They will manage users and products on behalf of the institutions.',
        addNewUser: `You can add an Administrator or their delegate. You can also enter the person you <1 />already indicated as Legal Representative. If you add a person already present with a <3 />different role for this product, they will be added as Administrator.`,
      },
    },
    addUserLabel: 'ADD ANOTHER ADMINISTRATOR',
    addUserLink: 'Add another Administrator',
    backLabel: 'Back',
    confirmLabel: 'Continue',
    formControl: {
      label: 'Add me as Administrator',
    },
  },
  additionalGpuDataPage: {
    title: 'Enter additional details',
    subTitle: 'Select from the options the one that describes your institution.',
    firstBlock: {
      yes: 'Yes',
      no: 'No',
      question: {
        isPartyRegistered: 'Is the institution registered in a Register, Roll or List?',
        subscribedTo: 'Registered in:',
        isPartyProvidingAService: 'Does the institution provide a service aimed at citizens?',
        gpuRequestAccessFor:
          'For which public utility and/or general interest services does the institution request access?',
        longTermPayments: 'Is the payment frequency continuous?',
      },
      placeholder: {
        registerBoardList: 'Register/Roll/List',
        answer: 'Answer',
        numberOfSubscription: 'Registration number',
      },
      errors: {
        requiredField: 'Required field',
      },
    },
    secondBlock: {
      title:
        'The legal representative of the Requesting Institution declares and represents irrevocably:',
      boxes: {
        first: 'to have the power to act in the name and on behalf of the Requesting Institution;',
        second:
          'that the Institution, through its legal representative, the legal representative and its Directors are in possession of all the authorizations required by law for carrying out the activities subject to the request and underlying it;',
        third:
          'that this legal representative and the directors of the Requesting Institution are not in one of the circumstances indicated in articles 94 and 95 of Legislative Decree no. 36/2023;',
        fourth:
          'that no proceedings are pending against the same and the directors of the Requesting Institution for the application of one of the prevention measures referred to in art. 6 of Legislative Decree 159/2011 and that none of the impeditive causes provided for by art. 67 of Legislative Decree 159/2011 exist;',
        fifth:
          'that the Requesting Institution is not the recipient of judicial measures, nor involved in pending proceedings that involve the application of administrative sanctions referred to in Legislative Decree of 8 June 2001, no. 231.',
      },
      legalBlockFooterInfo:
        'The declarations in this document are issued pursuant to art. 46 of Presidential Decree 28.12.2000 no. 445. In case of false declarations, applicable sanctions, including criminal ones, apply, including the cases provided for and punished under Presidential Decree 28.12.2000 no. 445.',
    },
  },
  additionalDataPage: {
    title: 'Enter additional details',
    subTitle:
      'Choose the option that describes your institution. If none is appropriate, select "Other" and <1 /> enter more details.',
    formQuestions: {
      textFields: {
        labels: {
          note: 'Notes',
          ipa: 'Enter the reference IPA code',
        },
        errors: {
          isEstabilishedRegulatoryProvision: 'You have not entered any notes',
          fromBelongsRegulatedMarket: 'You have not entered any notes',
          isFromIPA: 'Enter the reference IPA code',
          isConcessionaireOfPublicService: 'You have not entered any notes',
          optionalPartyInformations: 'Required field',
        },
      },
      estabilishedRegulatoryProvision:
        'The institution is a company established by law by a regulatory provision',
      belongsRegulatedMarket:
        'The institution belongs to a regulated market (e.g. energy, gas, water, <1 />transport, postal services, etc...)',
      registratedOnIPA: 'The institution is registered on IPA',
      concessionaireOfPublicService: 'The institution is a concessionaire of a public service',
      other: 'Other',
      optionalPartyInformations: 'Write here information about your institution',
    },
    options: {
      yes: 'Yes',
      no: 'No',
    },
    addNote: 'Add a note',
    allowedCharacters: 'Maximum 300 characters',
  },
  addUser: {
    title: `Add a new <1 /> Administrator`,
    subTitle: `Indicate for which product you want to add a new<1 />Administrator`,
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
          conflict: 'Name incorrect or different from Tax Code',
        },
      },
      surname: {
        label: 'Surname',
        errors: {
          conflict: 'Surname incorrect or different from Tax Code',
        },
      },
      taxCode: {
        label: 'Tax Code',
        errors: {
          invalid: 'The entered Tax Code is not valid',
          duplicate: 'The entered tax code is already present',
        },
      },
      email: {
        label: 'Institutional email',
        errors: {
          invalid: 'The email address is not valid',
          duplicate: 'The entered email address is already present',
          conflict: 'The email address you entered does not match the previous one',
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
        label: 'Upload the Membership Deed',
      },
      step1: {
        label: 'Upload the Membership Deed',
      },
    },
    request: {
      notFound: {
        title: 'The page you were looking for is not available',
        description:
          'At the moment it is not possible to proceed. Try again in a few <1 />minutes, or contact support',
        contactAssistanceButton: 'Contact support',
      },
      expired: {
        product: {
          title: 'The membership request has expired',
          description: `More than 30 days have passed since the membership request. If <2 />you still wish to join the product {{productTitle}}, send <4 />a new request.`,
        },
        user: {
          title: 'The request has expired',
          description: `More than 30 days have passed since the request to add <2 />an Administrator. To proceed, send a new <2 /> request.`,
        },
        backHome: 'Back to home',
      },
      alreadyCompleted: {
        product: {
          title: 'The membership request has been accepted',
        },
        user: {
          title: 'The request has already been accepted',
        },
        description: `To manage the product, log in via SPID or CIE`,
        logIn: 'Log in',
      },
      alreadyRejected: {
        product: {
          title: 'The membership request has been cancelled',
          description: `The membership request was not successful. If <2 />you still wish to join the product {{productTitle}}, send <4 />a new request.`,
        },
        user: {
          title: 'The request is no longer valid',
          description: `Your institution has cancelled the request. To add a <2 />new Administrator, send a new one.`,
        },
        backHome: 'Back to home',
      },
    },
    outcomeContent: {
      success: {
        product: {
          title: 'Membership completed!',
          description: `We will communicate the successful membership to the institution's primary <1/> PEC address. From this moment it is possible to <3 />access the Reserved Area.`,
        },
        user: {
          title: 'Request completed',
          description: `From this moment the indicated Administrators can <1 />access the Reserved Area.`,
        },
        backHome: 'Back to home',
      },
      error: {
        title: 'Upload failed',
        description: 'The document upload was not successful.',
        backToUpload: 'Upload again',
      },
    },
    errors: {
      INVALID_DOCUMENT: {
        title: 'Check the document',
        product: {
          message:
            'The uploaded document does not correspond to the Membership Deed. Verify that it is correct and upload it again.',
        },
        user: {
          message:
            'The uploaded document does not correspond to the form you received via email. Verify that it is correct and upload it again.',
        },
      },
      INVALID_SIGN: {
        title: 'Check the document',
        product: {
          message:
            'The Digital Signature cannot be attributed to the Legal Representative indicated during membership. Verify the correspondence and upload the document again.',
        },
        user: {
          message:
            'The Digital Signature cannot be attributed to the Legal Representative indicated during the request. Verify the correspondence and upload the document again.',
        },
      },
      ALREADY_ONBOARDED: {
        title: `The selected institution has already joined`,
        message:
          'To operate on the product, ask an Administrator to <1 />add you in the Users section.',
      },
      GENERIC: {
        title: 'Upload failed',
        message:
          'The document upload was not successful. Go back and upload it again.',
      },
      INVALID_SIGN_FORMAT: {
        title: 'Upload failed',
        message:
          'The document upload was not successful. <1 />Upload only one file in <3>p7m</3> format.',
      },
    },
  },
  noProductPage: {
    title: 'Sorry, something went wrong.',
    description: 'Unable to identify the desired product',
  },
  onboarding: {
    success: {
      flow: {
        product: {
          title: 'Membership request sent',
          publicAdministration: {
            description: `We will send an email to the institution's primary PEC address. <1 /> Inside, there are instructions to complete <3 />the membership.`,
          },
          notPublicAdministration: {
            description: `We will send an email to the indicated PEC address. <1 /> Inside, there are instructions to complete <3 />the membership.`,
          },
        },
        techPartner: {
          title: 'Registration request sent',
          description: `We will send an email with the outcome of the request to the <1 />indicated PEC address.`,
        },
        user: {
          title: 'You have sent the request',
          description: `We will send an email to the institution's primary PEC address. <1 /> Inside, there are instructions to complete <3 />the operation.`,
        },
      },
    },
    error: {
      title: 'Something went wrong.',
      description: `Due to a system error it is not possible to complete <1 />the procedure. Please try again later.`,
    },
    backHome: 'Back to home',
    sessionModal: {
      title: 'Do you really want to exit?',
      message: 'If you exit, the membership request will be lost.',
      onConfirmLabel: 'Exit',
      onCloseLabel: 'Cancel',
    },
    confirmationModal: {
      title: 'Do you confirm the request to send?',
      description: {
        flow: {
          base: 'You are sending a membership request to the product <1>{{productName}}</1> for the institution <3>{{institutionName}}</3>. <5 /> The membership agreement will arrive at the institution\'s institutional PEC and must be signed by the Legal Representative. Make sure you are authorized as an employee to make this request.',
          addNewUser: `You are adding a new Administrator for the institution <1>{{institutionName}}</1>. <3 />The institution will receive a form at the institutional PEC and it must be signed by the Legal Representative you indicated. <3 />Make sure you are authorized by the institution to make this request.`,
        },
      },
      confirm: 'Confirm',
      back: 'Back',
    },
    loading: {
      loadingText: 'We are verifying your data',
    },
    phaseOutError: {
      title: 'Something went wrong',
      description:
        'You cannot join the selected product as it will soon <1 /> no longer be available.',
      backAction: 'Back to home',
    },
  },
  onboardingSubProduct: {
    alreadyOnboardedError: {
      title: 'Subscription already done',
      message:
        'The institution you selected has already subscribed to the <1 /><strong>Premium</strong> offer.',
      closeButton: 'Close',
    },
    subProductStepSelectPricingPlan: {
      discountLabelData: '25% discount Until June 30, 2023 ',
      title: 'Switch to IO Premium and improve <1/> message performance',
      firstCheckLabel: 'Reduce collection times',
      secondCheckLabel: 'Improve collection performance',
      thirdCheckLabel: 'Reduce bad debts',
      infoSectionLabel: `If your institution has already joined IO, choose which plan best meets its needs. <1/> The carnet plan can be activated only once. Once the number of messages in the <3/> carnet plan is finished, the consumption plan will be automatically activated. `,
      btnRejectLabel: 'Not interested',
      pricingPlanExitModal: {
        title: 'Do you want to give up Premium offers?',
        subtitle: 'If you exit, you will continue with access to the Reserved Area.',
        closeBtnLabel: 'Exit',
        confirmBtnLabel: 'Back to Premium offers',
      },
      headerPlanCard: {
        from: 'From',
        to: 'to',
        beyond: 'Beyond',
        mess: '/ msg',
      },
      carnetPlan: {
        caption: 'CARNET PLAN - ONE-TIME',
        discountBoxLabel: '25% discount',
        title: 'Choose from the {{carnetCount}} different carnets designed for your every need',
        showMore: 'Learn more',
        showLess: 'Show less',
        description:
          'Once the carnet is selected it cannot be changed due to contract subscription.',
        carnetLabelsDiscount: {
          c1: 'Save €55',
          c2: 'Save €543.75',
          c3: 'Save €2,687.50',
          c4: 'Save €5,312.50',
          c5: 'Save €13,125',
          c6: 'Save €25,625',
          c7: 'Save €50,000',
        },
        btnActionLabel: 'Activate the plan',
      },
      consumptionPlan: {
        caption: 'CONSUMPTION PLAN',
        discountBoxLabel: '25% discount',
        title: 'Choose to pay only for the actual <1/> messages you send',
        showMore: 'Learn more',
        showLess: 'Show less',
        description:
          'By activating the consumption plan, it will no longer be possible to activate the carnet plan.',
        rangeLabelsDiscount: '25% discount',
        btnActionLabel: 'Activate the plan',
      },
    },
    subProductStepUserUnrelated: {
      title: 'You cannot join {{selectedProduct}}',
      description:
        'Your institution has not joined <strong>{{selectedProduct}}</strong>, or you do not have a role to <3/>manage the product. <5/> Ask an Administrator to <1/>add you in the <7/>Users section, or request membership to <strong>{{selectedProduct}}</strong> for your institution.',
      backHomeLabelBtn: 'Back to home',
      goToBtnLabel: 'Go to membership',
    },
    selectUserPartyStep: {
      title: 'Select your institution',
      subTitle:
        'Select the institution for which you are requesting the subscription <1 />to the offer <3>{{productName}}</3>',
      searchLabel: 'Search institution',
      notFoundResults: 'No result',
      IPAsubTitle:
        'Select from the Public Administration Index (IPA) the institution <1/> for which you want to request membership to {{baseProduct}} Premium',
      helperLink: 'Can\'t find your institution? <1>Find out why</1>',
      confirmButton: 'Continue',
    },
    noPartyStep: {
      title: 'None of your institutions can <1/> join',
      subTitle:
        'If you don\'t see any institutions available in the list, the institution searched for might <1/> have already joined <3>{{productName}}</3>',
      notPartyAvailable: 'No institution available',
      helperLink: 'Has your institution joined but is not available? <1>Find out why</1>',
      backButton: 'Back',
    },
    genericError: {
      title: 'Something went wrong',
      subTitle:
        'Due to a system error it is not possible to complete<0 /> the procedure. Please try again later.',
      homeButton: 'Back to home',
    },
    successfulAdhesion: {
      title: 'The membership request has been <1/>successfully sent',
      message:
        'You will receive a PEC at the institution\'s institutional address.<1 />Inside you will find the instructions to complete the <3 /> subscription to the offer <strong>{{title}}</strong>.',
      closeButton: 'Close',
    },
    billingData: {
      subTitle: `Confirm, modify or enter the required data, making sure they are correct.<1 /> They will also be used to request membership to other products and in case of invoicing.`,
    },
    exitModal: {
      title: 'Do you really want to exit?',
      message: 'If you exit, the membership request will be lost.',
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
      'We cannot find the page you are looking for. <1 />Make sure the address is correct or go back to home.',
    backButton: 'Back to home',
  },
  stepInstitutionType: {
    title: 'Select the type of institution you <1/> represent',
    subtitle: 'Indicate the type of institution that will join <1>{{productName}}</1>',
    institutionTypes: {
      pa: {
        title: 'Public Administration',
        description: 'art. 2, paragraph 2, letter A of the CAD',
      },
      gsp: {
        title: 'Public service manager',
        description: 'art. 2, paragraph 2, letter B of the CAD',
      },
      scec: {
        title: 'Consolidated economic account company',
      },
      gpu: {
        title: 'Public utility and/or general interest manager',
        description: 'Creditor institutions joining voluntarily',
      },
      scp: {
        title: 'Publicly controlled company',
        description: 'art. 2, paragraph 2, letter C of the CAD',
      },
      pt: {
        title: 'Technology partner',
        description:
          'Pursuant to IO - Paragraph 6.1.3 of the "Guidelines on the telematic access point to Public Administration services" issued by AgID pursuant to art. 64-bis of the CAD',
      },
      psp: {
        title: 'Payment Service Providers',
      },
      sa: {
        title: 'Private e-procurement platform manager',
      },
      as: {
        title: 'Insurance company',
      },
      prv: {
        title: 'Private',
      },
      oth: {
        title: 'Other',
        description: 'Creditor institutions joining voluntarily',
      },
    },
    backLabel: 'Back',
    confirmLabel: 'Continue',
  },
  onboardingFormData: {
    title: 'Enter the institution data',
    pspAndProdPagoPATitle: 'Enter the data',
    backLabel: 'Back',
    confirmLabel: 'Continue',
    closeBtnLabel: 'Close',
    billingDataPt: {
      title: 'Enter the data',
      subTitle:
        'Enter the required information and make sure it is correct.<1 /> It will be used to register you as a Technology Partner for the<3 /> product <5>{{nameProduct}}</5>.',
    },
    pspDashboardWarning:
      'To update the present data, contact the <1>Support</1> service',
    billingDataSection: {
      invalidFiscalCode: 'The Tax Code is not valid',
      invalidTaxCodeInvoicing: 'The entered Tax Code is not related to your institution',
      invalidZipCode: 'The ZIP code is not valid',
      invalidVatNumber: 'The VAT number is not valid',
      invalidEmail: 'The email address is not valid',
      invalidReaField: 'The REA field is not valid',
      invalidMailSupport: 'The email address is not valid',
      invalidShareCapitalField: 'The share capital field is not valid',
      recipientCodeMustBe6Chars: 'The code must be at least 6 characters',
      invalidRecipientCodeNoAssociation: 'The entered code is not associated with your institution',
      invalidRecipientCodeNoBilling:
        'The entered code is associated with the tax code of an institution that does not have the invoicing service active',
      vatNumberAlreadyRegistered: 'The VAT number you entered has already been registered.',
      vatNumberVerificationErrorTitle: 'Verification failed',
      vatNumberVerificationErrorDescription:
        'It was not possible to verify the VAT number at this time. Please try again later.',
      centralPartyLabel: 'Central institution',
      businessName: 'Company name',
      aooName: 'AOO name',
      uoName: 'UO name',
      aooUniqueCode: 'Univocal AOO Code',
      uoUniqueCode: 'Univocal UO Code',
      fullLegalAddress: 'Registered office address and civic number',
      zipCode: 'ZIP CODE',
      city: 'City',
      noResult: 'No result',
      county: 'Province',
      country: 'Country',
      digitalAddress: 'PEC address',
      taxCodeEquals2PIVAdescription: 'The VAT number matches the Tax Code',
      partyWithoutVatNumber: 'My institution does not have a VAT number',
      partyWIthoutVatNumberSubtitle: `Indicate only the Tax Code if your institution does not operate in the exercise of business,
      art or profession <1 />(cf. art. 21, paragraph 2, lett. f, Presidential Decree no. 633/1972)`,
      vatNumberGroup: 'The VAT number is for the group',
      taxCode: 'Tax Code',
      taxCodeCentralParty: 'Central institution Tax Code',
      vatNumber: 'VAT number',
      taxCodeInvoicing: 'SFE Tax Code',
      originId: 'IVASS code',
      sdiCode: 'SDI code',
      sdiCodePaAooUo: 'Univocal or SDI code',
      sdiCodePaAooUoDescription:
        'It is the univocal code necessary to receive electronic invoices. It can be from your institution or its reference Organizational Unit.',
      recipientCodeDescription: 'It is the code necessary to receive electronic invoices',
      gspDescription: 'I am the operator of at least one of the public services: Gas, Energy, Telco.',
      pspDataSection: {
        commercialRegisterNumber: 'Business Register registration number',
        invalidCommercialRegisterNumber: 'The Business Register registration number is not valid',
        registrationInRegister: 'Register registration',
        registerNumber: 'Register number',
        invalidregisterNumber: 'The Register number is not valid',
        abiCode: 'ABI code',
        invalidabiCode: 'The ABI code is not valid',
      },
      informationCompanies: {
        commercialRegisterNumber: 'Business Register registration location (optional)',
        requiredRea: 'REA',
        rea: 'REA (optional)',
        shareCapital: 'Share capital (optional)',
        requiredCommercialRegisterNumber: 'Business Register registration location (required)',
        requiredShareCapital: 'Share capital',
        shareCapitalHelper: 'To be filled in only for corporations',
      },
      assistanceContact: {
        supportEmail: 'Email address visible to citizens',
        supportEmailOptional: 'Email address visible to citizens (optional)',
        supportEmailDescriprion:
          'It is the contact that citizens see to request assistance from the institution',
      },
    },
    taxonomySection: {
      title: 'INDICATE THE GEOGRAPHICAL AREA',
      nationalLabel: 'National',
      localLabel: 'Local',
      infoLabel:
        'Select the territory in which your institution operates. If local, you can choose one or more areas of competence. If the institution has already joined other PagoPA products, you will find the area already set.',
      localSection: {
        addButtonLabel: 'Add area',
        inputLabel: 'Municipality, Province or Region',
      },
      error: {
        notMatchedArea: 'Choose a location from the list',
      },
      modal: {
        addModal: {
          title: 'You are adding other areas for your institution',
          description: `The geographical areas will be added to all PagoPA products to which the institution has already joined. Do you want to continue?`,
          confirmButton: 'Continue',
          backButton: 'Back',
        },
        modifyModal: {
          title: 'You are changing the geographical area of your institution',
          description:
            'The change will be applied to all PagoPA products to which the institution has already joined. Do you want to continue?',
          confirmButton: 'Continue',
          backButton: 'Back',
        },
      },
    },
    dpoDataSection: {
      dpoTitle: 'DATA PROTECTION OFFICER CONTACTS',
      dpoAddress: 'Address',
      dpoPecAddress: 'PEC address',
      dpoEmailAddress: 'Email address',
    },
    ibanSection: {
      title: 'ENTER IBAN TO RECEIVE REFUNDS',
      subTitle: 'To ensure the bank transfer is successful, make sure <1> the IBAN matches what is shown on your account details. </1>',
      holder: 'Account holder',
      iban: 'IBAN',
      confirmIban: 'Confirm IBAN',
      error: {
        invalidIban: 'Enter a valid IBAN',
        ibanNotMatch: 'The IBAN does not match',
      },
    },
  },
  rejectRegistration: {
    outcomeContent: {
      success: {
        title: 'Membership request deleted',
        description:
          'On the Reserved Area home you can see the available<1 />products and request membership for your institution.',
        backActionLabel: 'Back to home',
      },
      error: {
        title: 'Something went wrong.',
        description:
          'Due to a system error, the procedure cannot be completed. <1 /> Please try again later.',
        backActionLabel: 'Back to home',
      },
      verify: {
        loadingText: 'We are verifying your data',
      },
      delete: {
        loadingText: 'We are deleting your registration',
      },
      jwtNotValid: {
        title: 'Membership request no longer <1 /> valid',
        subtitle: 'This request has been accepted, cancelled or has expired.',
        backActionLabel: 'Back to home',
      },
    },
    confirmCancellatione: {
      title: 'Do you want to delete the <1 /> membership request?',
      subtitle: 'If you delete it, all entered data will be lost. ',
      confirmActionLabel: 'Delete request',
      backActionLabel: 'Back to home',
    },
  },
  app: {
    sessionModal: {
      title: 'Session expired',
      message: 'You are being redirected to the login page...',
    },
  },
};