import React, {useContext, useEffect, useState} from 'react'
import {withRouter} from 'next/router'
import PropTypes from 'prop-types'
import NetContext from '../../../shared/providers/net-provider'
import ContactContext, {ContactProvider} from '../providers/contact-provider'
import Layout from '../shared/contact-layout'
import {ContactDetails} from '../components'

function ContactView({router: {query}}) {
  const {addr} = query
  const {identities} = useContext(NetContext)
  const contacts = useContext(ContactContext)

  const [contact, setContact] = useState(null)

  useEffect(() => {
    if (!contacts || !identities || !addr) {
      return
    }
    const identity = identities.find(id => id.address === addr)
    setContact({
      ...contacts.find(c => c.addr === addr),
      status: identity && identity.state,
    })
  }, [addr, identities, contacts])

  return (
    <ContactProvider>
      <Layout>
        <ContactDetails {...contact} />
      </Layout>
    </ContactProvider>
  )
}

ContactView.propTypes = {
  // eslint-disable-next-line react/forbid-prop-types
  router: PropTypes.object.isRequired,
}

export default withRouter(ContactView)