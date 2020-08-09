## k8s

### Switching between local and gcloud contexts:

`kubectl config get-contexts`
`kubectl config use-context CONTEXT_NAME`

### psql

```
kubectl get pods
kubectl exec -it <postgres pod name> bash
bash> psql -h localhost -U sample --password hilltop
```
