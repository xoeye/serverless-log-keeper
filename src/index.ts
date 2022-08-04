import { inspect } from 'util'
import { JSONRepresentable } from './types/awsApi'
import { AWSProvider, AWSServiceProvider, Serverless } from './types/serverless'

const LOG_PREFIX = '[LambdaLogKeeper]'

export default class LambdaLogKeeperPlugin {
  private serverless: any
  provider: AWSProvider
  serviceProvider: AWSServiceProvider

  hooks: { [key: string]: (...args: any) => any | Promise<any> }

  keepLambdaLogs: boolean

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  constructor(serverless: Serverless, _options: unknown) {
    this.serverless = serverless

    if (this.serverless.service.provider.name !== 'aws') {
      throw new Error("serverless-log-keeper can only be used with the 'aws' provider")
    }

    this.provider = this.serverless.getProvider('aws')

    this.serviceProvider = this.serverless.service.provider as AWSServiceProvider

    this.hooks = {
      'before:package:finalize': () => this.setDeletionRetainOnLambdaLogs(),
    }

    const configProperties = {
      type: 'object',
      properties: {
        keepLambdaLogs: { type: 'boolean' },
      },
      required: ['keepLambdaLogs'],
    }

    this.serverless.configSchemaHandler.defineTopLevelProperty('logKeeper', configProperties)

    const config = this.serverless.configurationInput.logKeeper as JSONRepresentable
    if (!config) {
      throw new Error('Please specify `logKeeper` in your serverless.yml file!')
    }

    this.keepLambdaLogs = config.keepLambdaLogs as boolean

    if (!this.keepLambdaLogs) {
      throw new Error(
        'Please specify `logKeeper.keepLambdaLogs` with true or false in your serverless.yml file!'
      )
    }
  }

  log(str: string, ...objects: unknown[]): void {
    let objects_str = objects.map((e) => inspect(e, { colors: true, depth: null })).join('\n')
    if (objects_str.length > 0) objects_str = '\n' + objects_str

    this.serverless.cli.log(`${LOG_PREFIX} ${str}${objects_str}`)
  }
  setDeletionRetainOnLambdaLogs() {
    const rsrc = this.serverless.service.provider.compiledCloudFormationTemplate.Resources
    for (const key in rsrc) {
      const logGroupName = rsrc[key].Properties.LogGroupName
      if (rsrc[key].Type === 'AWS::Logs::LogGroup' && logGroupName.startsWith('/aws/lambda/')) {
        this.log(`setting DeletionPolicy: Retain on ${logGroupName}`)
        rsrc[key].DeletionPolicy = 'Retain'
      }
    }
  }
}

module.exports = LambdaLogKeeperPlugin // happy transpiler now, `export default` isn't equivalent
