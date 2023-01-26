import { useState } from 'react'
import { useTranslation } from 'next-i18next'
import useBackend from 'site/hooks/useBackend.js'
import Link from 'next/link'
import { Choice, Icons, welcomeSteps } from '../shared.js'
import OkIcon from 'shared/components/icons/ok.js'
import NoIcon from 'shared/components/icons/no.js'

export const namespaces = ['username']

const UsernameSettings = ({ app, title = false, welcome = false }) => {
  const backend = useBackend(app)
  const { t } = useTranslation(namespaces)
  const [username, setUsername] = useState(app.account.username)
  const [available, setAvailable] = useState(true)
  const [checking, setChecking] = useState(false)

  const update = async (evt) => {
    evt.preventDefault()
    if (evt.target.value !== username) {
      setUsername(evt.target.value)
      setChecking(true)
      const free = await backend.isUsernameAvailable(evt.target.value)
      setChecking(false)
      setAvailable(free)
    }
  }

  const save = async () => {
    const result = await backend.updateAccount({ username })
  }

  const nextHref =
    welcomeSteps[app.account.control].length > 4
      ? '/welcome/' + welcomeSteps[app.account.control][5]
      : '/docs/guide'

  return (
    <>
      {title ? <h1 className="text-4xl">{t('title')}</h1> : null}
      <div className="flex flex-row items-center">
        <input
          value={username}
          onChange={update}
          className="input w-full input-bordered flex flex-row"
          type="text"
          placeholder={t('title')}
        />
        <span className={`-ml-10 rounded-full p-1 ${available ? 'bg-success' : 'bg-error'}`}>
          {available ? (
            <OkIcon className="w-5 h-5 text-neutral-content" stroke={4} />
          ) : (
            <NoIcon className="w-5 h-5 text-neutral-content" stroke={3} />
          )}
        </span>
      </div>
      <button
        className={`btn btn-secondary mt-4 ${available ? '' : 'btn-disabled'} w-64`}
        onClick={save}
      >
        {available ? 'Save' : 'Username is not available'}
      </button>

      {welcome ? (
        <>
          <Link href={nextHref} className="btn btn-primary w-full mt-12">
            {t('continue')}
          </Link>
          {welcomeSteps[app.account.control].length > 0 ? (
            <>
              <progress
                className="progress progress-primary w-full mt-12"
                value={500 / welcomeSteps[app.account.control].length}
                max="100"
              ></progress>
              <span className="pt-4 text-sm font-bold opacity-50">
                5 / {welcomeSteps[app.account.control].length}
              </span>
              <Icons
                done={welcomeSteps[app.account.control].slice(0, 4)}
                todo={welcomeSteps[app.account.control].slice(5)}
                current="username"
              />
            </>
          ) : null}
        </>
      ) : null}
    </>
  )
}

export default UsernameSettings
