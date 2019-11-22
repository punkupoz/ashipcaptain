---
title: Cái này tiếng Việt :|
date: '2019-11-21'
spoiler: Automate your process with terraform
---

# Overview
There are a lot of articles on the internet explaining [Kubernetes](https://kubernetes.io/) already, so I will skip that part. In this blog, we will deploy a Kubernetes cluster into a Google Kubernetes Engine cluster with Terraform.
Relative [link](/relative/)

To keep the simplicity of this blog, I will skip the installation of the tools. I will use a general used folder structure for Terraform, you should make changes to suit your needs.

# Let's get started
## 1. Install the tools
In this blog, three tools will be used.
- [gcloud](https://cloud.google.com/sdk/install): the command line interface for Google Cloud Platform
- [terraform](https://www.terraform.io/downloads.html): an Infrastructure as Code provisioner
- [kubectl](https://www.terraform.io/downloads.html): a command line interface to control Kubernertes

## 2. Deploy the Kubernetes cluster

Let's look at the folder structure

```yaml{2,5}
├── files
│   └── gcp_key.json
├── main.tf
├── modules
└── variables.tf
```