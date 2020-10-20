#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { CdkEksStack } from '../lib/cdk-eks-stack';

const app = new cdk.App();
new CdkEksStack(app, 'CdkEksStack');
