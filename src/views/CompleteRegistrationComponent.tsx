import React, {useState} from "react";
import {StepperStep} from "../../types";
import {ConfirmRegistrationStep0} from "../components/ConfirmRegistrationStep0";
import {ConfirmRegistrationStep1} from "../components/ConfirmRegistrationStep1";


function CompleteRegistrationComponent() {

    const [activeStep, setActiveStep] = useState(0);

    // const back = () => {
    //     setActiveStep(activeStep - 1);
    // };

    const forward = () => {
        setActiveStep(activeStep + 1);
    };

    const steps: Array<StepperStep> = [
        {
            label: "Carica l'Atto di Adessione",
            Component: () => ConfirmRegistrationStep0({forward}),
        },
        {
            label: "Carica l'Atto di Adessione",
            Component: () => ConfirmRegistrationStep1({forward}),
        }
        // {
        //   label: "Seleziona l'ente",
        //   Component: () => OnboardingStep1({ forward: forwardWithDataAndEmail, back }),
        // },
        // {
        //   label: 'Inserisci i dati del rappresentante legale',
        //   Component: () => OnboardingStep2({ forward: forwardWithData, back }),
        // },
        // {
        //   label: 'Inserisci i dati degli amministratori',
        //   Component: () => OnboardingStep3({ forward: submit, back }),
        // },
    ];

    const Step = steps[activeStep].Component;


    return (
        <React.Fragment>
            <Step/>
        </React.Fragment>);

}

export default CompleteRegistrationComponent;
