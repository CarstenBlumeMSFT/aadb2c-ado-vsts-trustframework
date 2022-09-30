/* eslint-disable no-console */
import * as tl from 'azure-pipelines-task-lib/task'
import upath from 'upath'
import {
  MSALClientCredentialsAuthProvider,
  ILogger,
  PolicyUpload
} from 'aadb2c-core-modules-js'

class TlLogger implements ILogger {
  currentIndentation = ''
  lastIndentation = ''

  logDebug(message: string): void {
    tl.debug(`${this.currentIndentation}${message}`)
  }

  logInfo(message: string): void {
    console.log(`${this.currentIndentation}${message}`)
  }

  logWarn(message: string): void {
    tl.warning(`${this.currentIndentation}${message}`)
  }

  logError(message: string): void {
    tl.error(`${this.currentIndentation}${message}`)
  }

  startGroup(title: string): void {
    console.log(`${this.currentIndentation}${title}`)
    this.lastIndentation = this.currentIndentation
    this.currentIndentation = `${this.lastIndentation}  `
  }

  endGroup(): void {
    this.currentIndentation = this.lastIndentation
  }
}

class TaskOptions {
  policyFolder: string
  authProvider: MSALClientCredentialsAuthProvider
  logger: TlLogger

  constructor() {
    // tl will throw on undefined, so no risk allowing empty string
    this.policyFolder = tl.getInput('policyFolder', true)?.valueOf() ?? ''

    // tl will throw on undefined, so no risk allowing empty string
    const b2cGraphServicePrincipal =
      tl.getInput('b2cGraphServicePrincipal', true)?.valueOf() ?? ''

    // tl will throw on undefined, so no risk allowing empty string
    const tenant =
      tl
        .getEndpointDataParameter(b2cGraphServicePrincipal, 'tenant', true)
        ?.valueOf() ?? ''

    // tl will throw on undefined, so no risk allowing empty string
    const clientId =
      tl
        .getEndpointDataParameter(b2cGraphServicePrincipal, 'clientId', true)
        ?.valueOf() ?? ''

    // tl will throw on undefined, so no risk allowing empty string
    const authScheme =
      tl
        .getEndpointAuthorizationScheme(b2cGraphServicePrincipal, true)
        ?.toLowerCase() ?? ''
    tl.debug(`Used authenticationSCheme is ${authScheme}`)

    this.logger = new TlLogger()

    const externalAuth = tl.getEndpointAuthorization(
      b2cGraphServicePrincipal,
      true
    )

    this.authProvider = new MSALClientCredentialsAuthProvider(
      tenant,
      clientId,
      this.logger
    )

    switch (authScheme) {
      case 'certificate':
        this.authProvider.initializeWithClientCertificate(
          externalAuth?.parameters['certificateThumbprint'] ?? '',
          externalAuth?.parameters['certificate'] ?? '',
          externalAuth?.parameters['certificatePass'] ?? ''
        )
        break
      case 'usernamepassword':
        this.authProvider.initializeWithClientSecret(
          externalAuth?.parameters['password'] ?? ''
        )
        break
      case 'none':
      default:
        break
    }
  }
}

async function doWork(): Promise<void> {
  try {
    tl.debug('start')
    tl.setResourcePath(upath.join(__dirname, '..', 'task.json'))

    console.log('Upload all custom policies started...')

    const taskOptions: TaskOptions = new TaskOptions()

    PolicyUpload(
      taskOptions.policyFolder,
      taskOptions.authProvider,
      taskOptions.logger
    )
    tl.setResult(
      tl.TaskResult.Succeeded,
      'All custom policies successfully uploaded...'
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    console.log(e.message)
    tl.debug(e.message)
    tl.setResult(tl.TaskResult.Failed, e.message)
  }
}

doWork()
