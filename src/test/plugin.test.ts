import assert from 'assert'
import LambdaLogKeeperPlugin from '../index'
import { JSONRepresentable } from '../types/awsApi'
import { MockServerless } from './mocks/serverless.mock'

const DUMMY_OPTIONS = { stage: 'unittest', region: 'outer-space' }

describe('serverless plugin sets a DeletionPolicy to Retain', () => {
  it('adds a `DeletionPolicy: Retain` to Log Group', async () => {
    const serverless = MockServerless()
    const plugin = new LambdaLogKeeperPlugin(serverless, DUMMY_OPTIONS)
    const rsrc = serverless.service.provider.compiledCloudFormationTemplate
      .Resources as JSONRepresentable
    assert('LogGroup' in rsrc)
    const logGroup = rsrc['LogGroup'] as JSONRepresentable
    assert(!('DeletionPolicy' in logGroup))
    plugin.setDeletionRetainOnLambdaLogs()
    assert('DeletionPolicy' in logGroup)
    assert(logGroup.DeletionPolicy === 'Retain')
  })

  it('adds a `DeletionPolicy: Delete` to Log Group', async () => {
    const serverless = MockServerless(false)
    const plugin = new LambdaLogKeeperPlugin(serverless, DUMMY_OPTIONS)
    const rsrc = serverless.service.provider.compiledCloudFormationTemplate
      .Resources as JSONRepresentable
    assert('LogGroup' in rsrc)
    const logGroup = rsrc['LogGroup'] as JSONRepresentable
    assert(!('DeletionPolicy' in logGroup))
    plugin.setDeletionRetainOnLambdaLogs()
    assert('DeletionPolicy' in logGroup)
    assert(logGroup.DeletionPolicy === 'Delete')
  })
})

describe('plugin configuration and usage', () => {
  it('errors out if using non-aws provider', () => {
    const serverless = MockServerless() as any
    serverless.service.provider.name = 'not_aws'

    assert.throws(() => {
      new LambdaLogKeeperPlugin(serverless, DUMMY_OPTIONS)
    }, /only be used with the 'aws' provider/)
  })

  it('errors out on missing logKeeper root entry', () => {
    const serverless = MockServerless()
    serverless.configurationInput = {}

    assert.throws(() => {
      new LambdaLogKeeperPlugin(serverless, DUMMY_OPTIONS)
    }, /Please specify `logKeeper`/)
  })

  it('errors out on missing keepLambdaLogs', () => {
    const serverless = MockServerless()
    serverless.configurationInput = {
      logKeeper: {},
    }

    assert.throws(() => {
      new LambdaLogKeeperPlugin(serverless, DUMMY_OPTIONS)
    }, /Please specify `logKeeper.keepLambdaLogs`/)
  })
})
