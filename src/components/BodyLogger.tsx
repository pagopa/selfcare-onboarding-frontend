import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { logAction } from '../lib/action-log'
import { Header } from './Header'
import { Main } from './Main'
import { Footer } from './Footer'

export function BodyLogger() {
  const location = useLocation()

  /*
   * Handle data logging (now console.log, in the future might be Analytics)
   */
  useEffect(() => {
    logAction('Route change', location)
  }, [location])

  return (
    <React.Fragment>
      <Header />
      <Main />
      <Footer />
    </React.Fragment>
  )
}
