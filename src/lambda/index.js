import { emptyBucket } from './empty-bucket'
import { RemovalPolicy } from '@aws-cdk/core'

export const handler = async event => {
  console.debug('event: %o', event)

  /**
   * See the AWS documentation for more information passed in the request for a custom resource.
   *
   * https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/crpg-ref-requests.html
   */
  const bucketName = event.ResourceProperties.BucketName

  if (!bucketName) {
    throw new Error('bucketName is required')
  }

  const physicalResourceId = `${bucketName}-${event.LogicalResourceId}`

  switch (event.RequestType)
  {
    case 'Create':
      return {
        PhysicalResourceId: physicalResourceId,
        Reason: 'No operations are performed by this custom resource when it is created'
      }

    case 'Update':
      return {
        PhysicalResourceId: physicalResourceId,
        Reason: 'No operations are performed by this custom resource when it is updated'
      }

    case 'Delete':
      if (event.ResourceProperties.RemovalPolicy === RemovalPolicy.DESTROY) {
        try {
          await emptyBucket(bucketName)
          return {
            PhysicalResourceId: physicalResourceId,
            Reason: `Deleted files from bucket '${bucketName}' in preparation for bucket delete`
          }
        } catch (err) {
          console.error('delete bucket error: %o', err)
          throw err
        }

      } else {
        return {
          PhysicalResourceId: physicalResourceId,
          Reason: `No operations have been performed on bucket '${bucketName}', because it is set to be retained`
        }
      }
  }
}
