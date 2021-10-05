import React, { useContext } from 'react'
import { WhiteBackground } from '../components/WhiteBackground'
import { withLogin } from '../components/withLogin'
import { PartyContext, UserContext } from '../lib/context'

function MyExampleLoggedInRouteComponent() {
  const { user } = useContext(UserContext)
  const { party } = useContext(PartyContext)

  return (
    <WhiteBackground>
      <h1>Rotta autenticata</h1>
      <p>
        Qui sono loggato come{' '}
        <strong>
          {user?.name} {user?.surname}, ({party?.role})
        </strong>
        , con permessi da <strong>{party?.platformRole}</strong>. Opero per l'ente{' '}
        <strong>{party?.description}</strong>
      </p>
    </WhiteBackground>
  )
}

export const MyExampleLoggedInRoute = withLogin(MyExampleLoggedInRouteComponent)
