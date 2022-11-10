import dotenv from 'dotenv'
import axios from 'axios'
import chai from 'chai'
import http from 'chai-http'
import { verifyConfig } from '../src/config.mjs'
import { randomString } from '../src/utils/crypto.mjs'

dotenv.config()

const config = verifyConfig()
const expect = chai.expect
chai.use(http)

export const setup = async () => {
  // Initial store contents
  const store = {
    chai,
    expect,
    config,
    account: {
      email: `test_${randomString()}@${config.tests.domain}`,
      language: 'en',
      password: randomString(),
    },
    icons: {
      user: '🧑 ',
      jwt: '🎫 ',
      key: '🎟️ ',
    },
  }
  store.icon = (icon1, icon2 = false) => store.icons[icon1] + (icon2 ? store.icons[icon2] : '')

  // Get confirmation ID
  let result
  try {
    result = await axios.post(`${store.config.api}/signup`, {
      email: store.account.email,
      language: store.account.language,
      unittest: true,
    })
  } catch (err) {
    console.log('Failed at first setup request', err)
    process.exit()
  }
  store.account.confirmation = result.data.confirmation

  // Confirm account
  try {
    result = await axios.post(`${store.config.api}/confirm/signup/${store.account.confirmation}`, {
      consent: 1,
    })
  } catch (err) {
    console.log('Failed at account confirmation request', err)
    process.exit()
  }
  store.account.token = result.data.token
  store.account.username = result.data.account.username
  store.account.userid = result.data.account.id

  // Create API key
  try {
    result = await axios.post(
      `${store.config.api}/apikey/jwt`,
      {
        name: 'Test API key',
        level: 4,
        expiresIn: 60,
      },
      {
        headers: {
          authorization: `Bearer ${store.account.token}`,
        },
      }
    )
  } catch (err) {
    console.log('Failed at API key creation request', err)
    process.exit()
  }
  store.account.apikey = result.data.apikey

  return { chai, config, expect, store }
}

export const teardown = async function (store) {
  console.log(store)
}