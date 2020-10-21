import * as cdk from '@aws-cdk/core';
import * as kms from '@aws-cdk/aws-kms';
import * as eks from '@aws-cdk/aws-eks';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as s3 from '@aws-cdk/aws-s3';

export class CdkEksStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // provisiong a cluster
    const secretsKey = new kms.Key(this, 'SecretsKey');

    const cluster = new eks.Cluster(this, 'hello-eks', {
      version: eks.KubernetesVersion.V1_18,
      secretsEncryptionKey: secretsKey,
    });

    // launch template
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      'set -o xtrace',
      `/etc/eks/bootstrap.sh ${cluster.clusterName}`,
    );
    const lt = new ec2.CfnLaunchTemplate(this, 'LaunchTemplate', {
      launchTemplateData: {
        imageId: 'ami-0dadf836fc8220165', // custom AMI
        instanceType: new ec2.InstanceType('t3.small').toString(),
        userData: cdk.Fn.base64(userData.render()),
      },
    });
    cluster.addNodegroupCapacity('extra-ng', {
      launchTemplateSpec: {
        id: lt.ref,
        version: lt.attrDefaultVersionNumber,
      },
    });

    // self managed
    cluster.addAutoScalingGroupCapacity('spot', {
      instanceType: new ec2.InstanceType('t3.large'),
      minCapacity: 2,
      bootstrapOptions: {
        kubeletExtraArgs: '--node-labels foo=bar,goo=far',
        awsApiRetryAttempts: 5
      }
    });

    // fargate
    cluster.addFargateProfile('MyProfile', {
      selectors: [ { namespace: 'fg' } ]
    });

    // apply a kubernetes manifest to the cluster
    // add service account
    const sa = cluster.addServiceAccount('MyServiceAccount');

    const bucket = new s3.Bucket(this, 'Bucket');
    bucket.grantReadWrite(sa);

    const mypod = cluster.addManifest('mypod', {
      apiVersion: 'v1',
      kind: 'Pod',
      metadata: { name: 'mypod' },
      spec: {
        serviceAccountName: sa.serviceAccountName,
        containers: [
          {
            name: 'hello',
            image: 'paulbouwer/hello-kubernetes:1.5',
            ports: [ { containerPort: 8080 } ],

          }
        ]
      }
    });

    // create the resource after the service account.
    mypod.node.addDependency(sa);

    // print the IAM role arn for this service account
    new cdk.CfnOutput(this, 'ServiceAccountIamRole', { value: sa.role.roleArn })

    // helm
    new eks.HelmChart(this, 'NginxIngress', {
      cluster,
      chart: 'nginx-ingress',
      repository: 'https://helm.nginx.com/stable',
      namespace: 'kube-system'
    });

    // query the load balancer address
    // const myServiceAddress = new eks.KubernetesObjectValue(this, 'LoadBalancerAttribute', {
    //   cluster: cluster,
    //   objectType: 'service',
    //   objectName: 'my-service',
    //   jsonPath: '.status.loadBalancer.ingress[0].hostname', // https://kubernetes.io/docs/reference/kubectl/jsonpath/
    // });
  }
}
