import React, { useState } from 'react';
import { WhiteBackground } from '../components/WhiteBackground';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Link, useLocation } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';
import { fetchWithLogs } from '../lib/api-utils';
import { MessageNoAction } from '../components/MessageNoAction';
import { RequestOutcome, RequestOutcomeOptions } from '../../types';
import checkIllustration from '../assets/check-illustration.svg';
import redXIllustration from '../assets/red-x-illustration.svg';
import { StyledInputFile } from '../components/StyledInputFile';
import { getFetchOutcome } from '../lib/error-utils';
import { InlineSupportLink } from '../components/InlineSupportLink';
import isEmpty from 'lodash/isEmpty';
import { StyledIntro } from '../components/StyledIntro';
import { parseSearch } from '../lib/url-utils';

export function CompleteRegistration() {
  const [loading, setLoading] = useState(false);
  const [outcome, setOutcome] = useState<RequestOutcome>();
  const [contract, setContract] = useState<Blob>();
  const location = useLocation();

  const getJwt = () => {
    const s = parseSearch(location.search);
    return s.jwt;
  };

  const token = getJwt();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    // Avoid page reload
    e.preventDefault();
    // Start the loader
    setLoading(true);
    // Append the file as form data
    const formData = new FormData();
    formData.append('contract', contract!);
    // Send multipart/form-data POST request
    const contractPostResponse = await fetchWithLogs(
      { endpoint: 'ONBOARDING_COMPLETE_REGISTRATION', endpointParams: { token } },
      { method: 'POST', data: formData, headers: { 'Content-Type': 'multipart/form-data' } }
    );
    // Stop the loader
    setLoading(false);

    // Check the outcome
    const outcome = getFetchOutcome(contractPostResponse);

    // Show it to the end user
    setOutcome(outcome);
  };

  const loadFile = (e: any) => {
    if (!isEmpty(e.target.files) && e.target.files.length > 0) {
      setContract(e.target.files[0]);
    }
  };

  const outcomeContent: RequestOutcomeOptions = {
    success: {
      img: { src: checkIllustration, alt: "Icona dell'email" },
      title: 'Congratulazioni',
      description: [
        <p>
          La registrazione è completa.{' '}
          <Link to="/" className="link-default">
            Clicca qui
          </Link>{' '}
          per iniziare
        </p>,
      ],
    },
    error: {
      img: { src: redXIllustration, alt: 'Icona della X' },
      title: 'Attenzione!',
      description: [
        <p>
          C'è stato un errore nel completamento della procedura. Assicurati che il file caricato sia
          l'accordo firmato. Per ritentare, ricarica la pagina. Se credi sia un errore,{' '}
          <InlineSupportLink />.
        </p>,
      ],
    },
  };

  return !outcome ? (
    <React.Fragment>
      <WhiteBackground containerClassNames="d-flex flex-direction-column">
        <div className="mx-auto my-auto text-center">
          <StyledIntro additionalClasses="mx-auto">
            {{
              title: 'Ciao!',
              description:
                "Per completare la procedura di registrazione, carica l'accordo ricevuto via email, completo della firma in originale del rappresentante legale",
            }}
          </StyledIntro>

          <Form className="mt-4 form-max-width" onSubmit={handleSubmit}>
            <StyledInputFile
              id="contratto"
              onChange={loadFile}
              value={contract}
              label="carica accordo"
            />

            <Button variant="primary" type="submit" disabled={!contract}>
              prosegui
            </Button>
          </Form>
        </div>
      </WhiteBackground>
      {loading && <LoadingOverlay loadingText="Stiamo caricando il tuo contratto" />}
    </React.Fragment>
  ) : (
    <MessageNoAction {...outcomeContent[outcome]} />
  );
}
