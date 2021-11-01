import React, {useState} from "react";
import {StepperStep} from "../../types";
import {ConfirmRegistrationStep0} from "../components/ConfirmRegistrationStep0";
import {ConfirmRegistrationStep1} from "../components/ConfirmRegistrationStep1";
import {AlertDialog} from "../components/AlertDialog";
import {useHistoryState} from "../components/useHistoryState";


function CompleteRegistrationComponent() {



    const [activeStep, setActiveStep] = useState(0);
    const [showDialog, setShowDialog] = useHistoryState<boolean>(
        'show_dialog',
        false
    );
    const [dialogTitle, setDialogTitle] = useHistoryState<string|null>(
        'dialog_title_confirm_registration_1',
        null
    );
    const [dialogDescription, setDialogDescription] = useHistoryState<string|null>(
        'dialog_desription_confirm_registration_1',
        null
    );


    const handleCloseDialog = (): void => {
        setShowDialog(false);
    };

    const forward = () => {
        setActiveStep(activeStep + 1);
    };

    // const back = () => {
    //     setActiveStep(activeStep - 1);
    // };

    const steps: Array<StepperStep> = [
        {
            label: "Carica l'Atto di Adessione",
            Component: () => ConfirmRegistrationStep0({forward}),
        },
        {
            label: "Carica l'Atto di Adessione",
            Component: () => ConfirmRegistrationStep1({setDialogTitle,setDialogDescription,setShowDialog,handleCloseDialog}),
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
            <AlertDialog open={showDialog} handleClose={handleCloseDialog}
                         description={dialogDescription}
                         title={dialogTitle}/>
        </React.Fragment>);

}

export default CompleteRegistrationComponent;
