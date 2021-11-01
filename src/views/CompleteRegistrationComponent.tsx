import React, {useState} from "react";
import {StepperStep} from "../../types";
import {ConfirmRegistrationStep0} from "../components/ConfirmRegistrationStep0";
import {ConfirmRegistrationStep1} from "../components/ConfirmRegistrationStep1";
import {AlertDialog} from "../components/AlertDialog";
import {useHistoryState} from "../components/useHistoryState";
import {fetchWithLogs} from "../lib/api-utils";
import {getFetchOutcome} from "../lib/error-utils";


function CompleteRegistrationComponent() {

    const [activeStep, setActiveStep, setActiveStepHistory] = useHistoryState('complete_registration_step', 0);
    const [showDialog, setShowDialog] = useState<boolean>(false);
    const [dialogTitle, setDialogTitle] = useState<string | null>(null);
    const [dialogDescription, setDialogDescription] = useState<string | null>(null
    );

    const [loading, setLoading] = useState<boolean>(
        false
    );

    const [uploadedFiles, setUploadedFiles, setUploadedFilesHistory] = useHistoryState<Array<File>>(
        'uploaded_files',
        []
    );

    const setUploadedFilesAndWriteHistory = (files: Array<File>) =>{
        setUploadedFilesHistory(files);
        setUploadedFiles(files);
    };


    const handleCloseDialog = (): void => {
        setShowDialog(false);
    };

    const forward = () => {
        setActiveStepHistory(activeStep + 1);
        setUploadedFilesHistory(uploadedFiles);
        setActiveStep(activeStep + 1);
    };

    // const back = () => {
    //     setActiveStep(activeStep - 1);
    // };

    const submit = async (file: File) => {

        setLoading(true);
        const formData = new FormData();
        formData.append('file', file);

        const uploadDocument = await fetchWithLogs(
            {endpoint: 'MOCK_UPLOAD'},
            {method: 'POST', data: formData}
        );

        const outcome = getFetchOutcome(uploadDocument);

        setLoading(false);

        console.log(uploadDocument, outcome);


    };

    const steps: Array<StepperStep> = [
        {
            label: "Carica l'Atto di Adessione",
            Component: () => ConfirmRegistrationStep0({forward}),
        },
        {
            label: "Carica l'Atto di Adessione",
            Component: () => ConfirmRegistrationStep1({
                    setDialogTitle,
                    setDialogDescription,
                    setShowDialog,
                    handleCloseDialog
                }, {forward: submit},
                {loading}, {uploadedFiles, setUploadedFiles:setUploadedFilesAndWriteHistory})
        }

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
