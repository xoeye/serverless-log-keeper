export type JSONObject =
  | string
  | number
  | boolean
  | { [name: string]: JSONObject }
  | Array<JSONObject>

export interface JSONRepresentable {
  [name: string | symbol | number]: string | number | boolean | JSONObject
}

export type AwsApiCall<TParams, TRes> = (params: TParams) => Promise<TRes>

/**
 * CloudFormation::GetTemplate
 */
export interface GetTemplateParams {
  StackName: string
}

export interface GetTemplateResult {
  TemplateBody: string
}

export type GetTemplate = AwsApiCall<GetTemplateParams, GetTemplateResult>

/**
 * Cloudformation::ListResources
 */
export interface ListStackResourcesParams {
  StackName: string
}

export interface StackResource {
  LogicalResourceId: string
  PhysicalResourceId: string
  ResourceType: string
}

export interface ListStackResourcesResult {
  StackResourceSummaries: Array<StackResource>
}
