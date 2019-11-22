---
title: Trying out a Kubernertes cluster on Google Cloud Platform with Terraform
date: '2019-11-21'
spoiler: Automate your process with terraform
---

# Overview
There are a lot of articles on the internet explaining [Kubernetes](https://kubernetes.io/) already, so I will skip that part. In this blog, we will deploy a Kubernetes cluster into a Google Kubernetes Engine cluster with Terraform.
Relative [link](/relative/)

To keep the simplicity of this blog, I will skip the installation of the tools. I will use a general used folder structure for Terraform, you should make changes to suit your needs.

# What are we going go create
- Kubernetes cluster in Google Kubernetes Engine.
- Kubernetes node pool to attach into the cluster.
- A docker image to test our cluster.

# Let's get started
## 1. Install the tools
In this blog, three tools will be used.
- [gcloud](https://cloud.google.com/sdk/install): the command line interface for Google Cloud Platform.
- [terraform](https://www.terraform.io/downloads.html): an Infrastructure as Code provisioner.
- [kubectl](https://www.terraform.io/downloads.html): a command line interface to control Kubernertes.
- [golang](https://golang.org/): we are going to build a golang docker image to test our cluster.

## 2. Deploy a Kubernetes cluster with Terraform

Let's look at the folder structure

```yaml{2}
├── files
│   └── gcp_key.json
├── main.tf
├── modules
└── variables.tf
```

Notice that we have the `gcp_key.json`, this file can be obtained by using [GCP's service account](https://cloud.google.com/iam/docs/creating-managing-service-accounts). This is the main method we use in Terraform to authenticate the provider. In real environments, I would recommend encode the file to base64, store the file into a protected, hidden variable then use the [base64decode](https://www.terraform.io/docs/configuration/functions/base64decode.html) function of Terraform to use it, but for now let's just use the file.

```jsxon{9,14,15}{numberLines: true}
// main.tf
terraform {
  backend "local" {
    path = "../state/terraform.tfstate"
  }
}

provider "google" {
  credentials = "${file("files/gcp_key.json")}"
  project = "${var.project_id}"
  region = "${var.region}"
}

module "kube-cluster" {
  source = "../../modules/kube-cluster"

  location = "${var.region}"
  
  # Cluster
  name = "${var.cluster_name}"
  project_id = "${var.project_id}"
  node_locations = "${var.node_locations}"

  # Node pool
  pool_name = "${var.node_pool_name}"
  node_count = "${var.node_count}"
  machine_type = "${var.machine_type}"
}
```

[Modules](https://www.terraform.io/docs/modules/index.html) in Terraform provide a little abstraction layer. We create a module to initiate a Kubernetes cluster, you can write a module for yourself to, for example, create a FileStore for Kubernetes Persistent Storage. So this is our `kube-cluster` module.

```jsxon{6}{numberLines: true}
# modules/kube-cluster/cluster.tf
resource "google_container_cluster" "primary" {
  name = "dev-cluster"
  location = "australia-southeast1"

  remove_default_node_pool = true
  initial_node_count = 1

  provisioner "local-exec" {
    command = "gcloud container clusters get-credentials ${google_container_cluster.primary.name} --project ${var.project_id}"
  }
}
```
This will create a Kubernetes cluster on our GCP. We should remove the default node pool and attach our own node pool for easier management. This will be our node pool.

```jsxon{9}{numberLines: true}
resource "google_container_node_pool" "primary_preemptible_nodes" {
  name = "${var.node_pool_name}"
  cluster = "${google_container_cluster.primary.name}"
  location = "${var.location}"

  node_count = "${var.node_count}"

  node_config {
    preemptible = true
    machine_type = "${var.machine_type}"
    metadata = {
      disable-legacy-endpoints = "true"
    }

    oauth_scopes = [
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring",
    ]
  }
}
```
For 

# Try the cluster

Let's create a simple golang "Hello, world!" docker image
```go{numberLines: true}
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("Hello, World"))
	})

	http.HandleFunc("/healthz", func(w http.ResponseWriter, r *http.Request) {
		_, _ = w.Write([]byte("Healthy!"))
	})

	err := http.ListenAndServe(":8444", nil)
	if err != nil {
		fmt.Println(err)
	}
}
```