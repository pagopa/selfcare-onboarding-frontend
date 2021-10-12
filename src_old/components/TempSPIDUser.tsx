import React, { useState } from 'react';
import isEmpty from 'lodash/isEmpty';
import { Button, Form } from 'react-bootstrap';
import { useLogin } from '../hooks/useLogin';
import { LoadingOverlay } from './LoadingOverlay';
import { UsersObject } from './OnboardingStep2';
import { PlatformUserForm } from './PlatformUserForm';
import { StyledIntro } from './StyledIntro';

export function TempSPIDUser() {
  const [data, setData] = useState<UsersObject>({});
  const { setTestSPIDUser, loadingText } = useLogin();

  const handleSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();
    setTestSPIDUser({ ...data['spid'], status: 'active' });
  };

  return (
    <React.Fragment>
      <div className="position-fixed top-0 start-0 w-100 h-100 bg-white">
        <div className="d-flex h-100">
          <div className="mx-auto my-auto w-100" style={{ maxWidth: 480 }}>
            <div className="text-primary">
              <StyledIntro>
                {{
                  title: 'Inserisci dati SPID',
                  description: (
                    <React.Fragment>
                      Per questa PoC, per favore inserire manualmente i dati dell'utente SPID per il
                      quale effettuare accesso alla piattaforma.
                      <br />
                      <br />
                      Attenzione: se si intende fare più test nel tempo, si consiglia di conservare
                      il codice fiscale inserito per questo finto login, in modo da poter associare
                      l'utente a tutte le operazioni che ha già effettuato sulla piattaforma
                    </React.Fragment>
                  ),
                }}
              </StyledIntro>
            </div>

            <Form onSubmit={handleSubmit}>
              <PlatformUserForm
                platformRole="admin"
                role="Manager"
                prefix="spid"
                people={data}
                setPeople={setData}
              />

              <Button
                className="mt-3"
                variant="secondary"
                type="submit"
                disabled={isEmpty(data) || isEmpty(data['spid'])}
              >
                Effettua il login
              </Button>
            </Form>
          </div>
        </div>
      </div>
      {loadingText && <LoadingOverlay loadingText={loadingText} />}
    </React.Fragment>
  );
}
