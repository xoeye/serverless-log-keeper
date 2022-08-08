import assert from 'assert'
import {
  GetTemplateParams,
  GetTemplateResult,
  JSONRepresentable,
  ListStackResourcesParams,
  ListStackResourcesResult,
} from '../../types/awsApi'

export const sampleTemplate = {
  Resources: {
    LogGroupA: {
      Type: 'AWS::Logs::LogGroup',
      Properties: {
        LogGroupName: '/aws/lambda/log-group-a',
      },
      DeletionPolicy: 'Retain',
    },
  },
}

function ResolvedPromise<T>(res: T): Promise<T> {
  const promise = new Promise((resolve) => resolve(res)) as Promise<T>
  return promise
}

export class MockCloudFormation {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getTemplate(_params: GetTemplateParams): Promise<GetTemplateResult> {
    return ResolvedPromise<GetTemplateResult>({
      TemplateBody: JSON.stringify(sampleTemplate),
    })
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  listStackResources(_params: ListStackResourcesParams): Promise<ListStackResourcesResult> {
    return ResolvedPromise<ListStackResourcesResult>({
      StackResourceSummaries: [
        {
          LogicalResourceId: 'LogGroupB',
          PhysicalResourceId: '/aws/appsync/apis/log-group-b',
          ResourceType: 'AWS::Logs::LogGroup',
        },
      ],
    })
  }
}

export class MockAWSProvider {
  services: { [key: string]: any }

  constructor() {
    this.services = {
      CloudFormation: new MockCloudFormation(),
    }
  }

  async request(serviceName: string, api: string, params: JSONRepresentable): Promise<any> {
    const service = this.services[serviceName]
    assert.notEqual(service, null)
    assert.notEqual(service[api], null)

    return ResolvedPromise(service[api](params))
  }
}
