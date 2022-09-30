/* eslint-disable no-console */
import * as tl from 'azure-pipelines-task-lib/task'
import upath from 'upath'
import {ILogger, PolicyBuild} from 'aadb2c-core-modules-js'

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

  outputFolder: string

  renumberSteps = false

  constructor() {
    // tl will throw on undefined, so no risk allowing empty string
    this.policyFolder = tl.getInput('policyFolder', true)?.valueOf() ?? ''

    // tl will throw on undefined, so no risk allowing empty string
    this.outputFolder = tl.getInput('outputFolder', true)?.valueOf() ?? ''

    const renumber = tl.getInput('renumberSteps', false)

    if (renumber != null && renumber.toLowerCase() === true.toString()) {
      this.renumberSteps = true
    }
  }
}

async function doWork(): Promise<void> {
  try {
    tl.setResourcePath(upath.join(__dirname, '..', 'task.json'))

    console.log('Build all custom policies started...')

    const taskOptions: TaskOptions = new TaskOptions()

    PolicyBuild(
      taskOptions.policyFolder,
      taskOptions.outputFolder,
      taskOptions.renumberSteps,
      new TlLogger()
    )

    tl.setResult(
      tl.TaskResult.Succeeded,
      'All custom policies successfully built...'
    )
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (e: any) {
    tl.debug(e.message)
    tl.setResult(tl.TaskResult.Failed, e.message)
  }
}

doWork()
