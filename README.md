## k8s

### Spinning up new GCE environment

#### Creating GKE cluster

```
gcloud container clusters create hilltop \
    --num-nodes=3 --zone us-central1-a --machine-type g1-small
```

#### Creating persistent disk:

`gcloud compute disks create pg-data-disk --size 50GB --zone us-central1-a`
Relevant: https://stackoverflow.com/questions/59337139/crashloopbackoff-postgres-gcp
TLDR: the pv and pvc need to be created before the pod is deployed

#### Creating db

```
kubectl apply -f ./postgres/k8s/prod/volume.yaml
kubectl apply -f ./postgres/k8s/prod/service.yaml
kubectl apply -f ./postgres/k8s/prod/deployment.yaml
kubectl get pods
kubectl exec -it <postgres pod> bash
createdb -U sample hilltop
```

#### Migrating db

kubectl get pods
kubectl exec <web pod> yarn migrate-up

### Switching between local and gcloud contexts:

`kubectl config get-contexts`
`kubectl config use-context CONTEXT_NAME`

### Build + deploy

`skaffold run`

### psql

```
kubectl get pods
kubectl exec -it <postgres pod name> bash
psql -h localhost -U sample --password hilltop
```

### local development

```
minikube start
skaffold dev --port-forward
```

(port forwarding is off by default)
